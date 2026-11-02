#!/usr/bin/env node
/**
 * Look at the built pages in a real browser — `npm run inspect`.
 *
 * A successful build is not visual verification. This drives a headless
 * Chromium over every route at three widths and asserts the things that are
 * invisible in HTML but obvious on screen:
 *
 *   - the page does not scroll sideways at any width;
 *   - no element's text overflows its own box;
 *   - every picture is drawn at its real proportions, not squashed;
 *   - the layout does not shift as images arrive (CLS);
 *   - every link and control can be reached by keyboard and shows a focus ring;
 *   - the mobile menu opens, traps focus sensibly, and closes on Escape;
 *   - the rendered colours of real text clear WCAG AA against what is actually
 *     behind them, which is stricter than checking the palette;
 *   - the page still lays out with JavaScript disabled.
 *
 * Screenshots go to `screenshots/` (gitignored) for a person to look at.
 *
 * Usage:
 *   node scripts/inspect-pages.mjs [base-url] [label]
 *
 * Requires the preview server to be running (`npm run preview`).
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const ORIGIN = process.argv[2] ?? 'http://localhost:4321';
const LABEL = process.argv[3] ?? 'build';
const OUT = `screenshots/${LABEL}`;
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: '390', width: 390, height: 844 }, // a phone
  { name: '768', width: 768, height: 1024 }, // a tablet
  { name: '1440', width: 1440, height: 900 }, // a laptop
];

const problems = [];
const notes = [];
const report = (where, message) => problems.push(`${where}: ${message}`);

/* ---------------------------------------------------------- the routes --- */

const browser = await chromium.launch();
const indexPage = await browser.newPage();
await indexPage.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });

/** Every internal page, discovered from the site's own links. */
const routes = new Set(['/', '/about/', '/events/', '/announcements/', '/404.html']);
for (const path of ['/events/', '/announcements/']) {
  await indexPage.goto(`${ORIGIN}${path}`, { waitUntil: 'networkidle' });
  for (const href of await indexPage.$$eval('a[href^="/"]', (as) => as.map((a) => new URL(a.href).pathname))) {
    if (/^\/(events|announcements)\/[^/]+\/$/.test(href)) routes.add(href);
  }
}
await indexPage.close();
const ROUTES = [...routes].sort();

/* ------------------------------------------------------- the checks ----- */

/** In-page measurement. Returns plain data; all judgement happens outside. */
const measure = () => {
  const vw = window.innerWidth;

  const overflowing = [];
  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.overflowX === 'auto' || style.overflowX === 'scroll') continue;
    // Text spilling out of its own box, ignoring sub-pixel rounding.
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && el.children.length === 0) {
      overflowing.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className?.toString().slice(0, 50),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        text: (el.textContent ?? '').trim().slice(0, 60),
      });
    }
    const box = el.getBoundingClientRect();
    if (box.width > 0 && box.right > vw + 2) {
      overflowing.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className?.toString().slice(0, 50),
        right: Math.round(box.right),
        viewport: vw,
        beyondViewport: true,
      });
    }
  }

  const images = [...document.querySelectorAll('img')].map((img) => ({
    src: img.currentSrc || img.src,
    // An image in a display:none subtree is deliberately never fetched (the
    // row thumbnails are hidden on a phone), so it is not a load failure.
    drawn: img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0,
    natural: [img.naturalWidth, img.naturalHeight],
    rendered: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)],
    loading: img.loading,
    fetchPriority: img.fetchPriority,
    objectFit: getComputedStyle(img).objectFit,
    complete: img.complete,
    alt: img.alt,
    hasAltAttribute: img.hasAttribute('alt'),
    top: Math.round(img.getBoundingClientRect().top + window.scrollY),
  }));

  /** Contrast of real rendered text against whatever is actually behind it. */
  const srgb = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
  const parse = (value) => (value.match(/[\d.]+/g) ?? []).map(Number);
  const opaqueBackgroundOf = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const [r, g, b, a = 1] = parse(getComputedStyle(node).backgroundColor);
      if (a === 1 && (r !== undefined)) return [r, g, b];
    }
    return [255, 255, 255];
  };
  const contrast = [];
  for (const el of document.querySelectorAll('p, h1, h2, h3, h4, a, span, li, dt, dd, button, time, strong, em')) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!text) continue;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    const [r, g, b, a = 1] = parse(style.color);
    if (a < 1) continue;
    const bg = opaqueBackgroundOf(el);
    // Opacity on an ancestor fades text and ground together; find the
    // effective alpha so the inactive button is measured as it looks.
    let alpha = 1;
    for (let node = el; node; node = node.parentElement) alpha *= Number(getComputedStyle(node).opacity);
    const blend = (fg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
    const [l1, l2] = [lum(blend([r, g, b])), lum(bg)].sort((x, y) => y - x);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    const px = parseFloat(style.fontSize);
    const bold = Number(style.fontWeight) >= 700;
    const large = px >= 24 || (bold && px >= 18.66);
    contrast.push({
      ratio: Math.round(ratio * 100) / 100,
      required: large ? 3 : 4.5,
      large,
      px: Math.round(px * 10) / 10,
      weight: style.fontWeight,
      color: style.color,
      background: `rgb(${bg.join(', ')})`,
      tag: el.tagName.toLowerCase(),
      cls: el.className?.toString().slice(0, 40),
      text: text.slice(0, 45),
    });
  }

  return {
    overflowing,
    images,
    contrast,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    viewport: vw,
  };
};

/* ------------------------------------------------------------- run ------ */

for (const size of WIDTHS) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Layout shift, measured from before the first paint.
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  for (const route of ROUTES) {
    const where = `${route} @${size.name}`;
    const response = await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle' });
    if (!response || response.status() >= 400) {
      // 404.html is served as a page; a non-200 only matters for the others.
      if (route !== '/404.html') report(where, `HTTP ${response?.status()}`);
    }

    // Scroll the whole page so lazy images load and any late shift is counted.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 150));
    });

    const m = await page.evaluate(measure);
    const cls = await page.evaluate(() => window.__cls ?? 0);

    /* --- sideways scrolling --- */
    if (m.documentScrollWidth > m.viewport + 1) {
      report(where, `the page scrolls sideways: scrollWidth ${m.documentScrollWidth} vs viewport ${m.viewport}`);
    }

    /* --- text and boxes overflowing --- */
    for (const o of m.overflowing) {
      report(
        where,
        o.beyondViewport
          ? `<${o.tag} class="${o.cls}"> extends to ${o.right}px, past the ${o.viewport}px viewport`
          : `<${o.tag} class="${o.cls}"> text overflows its box (${o.scrollWidth} > ${o.clientWidth}): "${o.text}"`,
      );
    }

    /* --- images: loaded, proportioned, described, lazy below the fold --- */
    for (const img of m.images) {
      const name = img.src.split('/').pop();
      if (!img.drawn) continue; // hidden at this width, so never fetched
      if (!img.complete || img.natural[0] === 0) {
        report(where, `image ${name} did not load`);
        continue;
      }
      if (!img.hasAltAttribute) report(where, `image ${name} has no alt attribute`);
      if (img.objectFit === 'fill' || img.objectFit === 'none') {
        const natural = img.natural[0] / img.natural[1];
        const rendered = img.rendered[0] / img.rendered[1];
        if (rendered > 0 && Math.abs(natural - rendered) / natural > 0.02) {
          report(
            where,
            `image ${name} is distorted: drawn ${img.rendered.join('×')} (${rendered.toFixed(3)}) ` +
              `but is ${img.natural.join('×')} (${natural.toFixed(3)})`,
          );
        }
      }
      // Anything starting well below the fold should not be eager.
      if (img.top > size.height * 1.5 && img.loading !== 'lazy') {
        report(where, `image ${name} starts at ${img.top}px but is not loading="lazy"`);
      }
      if (img.top < size.height && img.loading === 'lazy' && img.fetchPriority !== 'high') {
        notes.push(`${where}: image ${name} is above the fold and lazy (harmless, but eager would paint sooner)`);
      }
    }

    /* --- layout stability --- */
    if (cls > 0.1) report(where, `layout shifts badly as it loads (CLS ${cls.toFixed(3)})`);
    else if (cls > 0.01) notes.push(`${where}: small layout shift (CLS ${cls.toFixed(3)})`);

    /* --- contrast of what is actually on screen --- */
    for (const c of m.contrast) {
      if (c.ratio < c.required) {
        report(
          where,
          `contrast ${c.ratio}:1 (needs ${c.required}) — ${c.px}px/${c.weight} <${c.tag} class="${c.cls}"> ` +
            `${c.color} on ${c.background}: "${c.text}"`,
        );
      }
    }

    await page.screenshot({ path: `${OUT}/${route.replace(/[/.]/g, '_') || 'home'}-${size.name}.png`, fullPage: true });
  }

  /* --- keyboard reachability and a visible focus ring, on the homepage --- */
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
  const tabbed = [];
  await page.keyboard.press('Tab');
  for (let i = 0; i < 40; i += 1) {
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: el.className?.toString().slice(0, 40),
        text: (el.textContent ?? '').trim().slice(0, 30),
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        boxShadow: style.boxShadow,
        textDecoration: style.textDecorationLine,
        visible: box.width > 0 && box.height > 0,
        offScreen: box.bottom < 0 || box.top > window.innerHeight * 50,
      };
    });
    if (!info) break;
    const key = `${info.tag}.${info.cls}:${info.text}`;
    if (tabbed.some((t) => t.key === key)) break;
    tabbed.push({ key, ...info });
    await page.keyboard.press('Tab');
  }

  if (tabbed.length === 0) report(`keyboard @${size.name}`, 'nothing is reachable by Tab');
  if (tabbed[0] && !/skip/i.test(tabbed[0].text)) {
    report(`keyboard @${size.name}`, `the first tab stop is "${tabbed[0].text}", not the skip link`);
  }
  for (const stop of tabbed) {
    const ring =
      (stop.outlineStyle !== 'none' && parseFloat(stop.outlineWidth) > 0) ||
      (stop.boxShadow && stop.boxShadow !== 'none');
    if (!ring && stop.visible) {
      report(`keyboard @${size.name}`, `no visible focus ring on <${stop.tag} class="${stop.cls}"> "${stop.text}"`);
    }
  }
  notes.push(`keyboard @${size.name}: ${tabbed.length} tab stops, first is "${tabbed[0]?.text ?? '(none)'}"`);

  /* --- the mobile menu, where it is the only navigation --- */
  if (size.width <= 768) {
    const burgerVisible = await page.isVisible('.burger');
    if (!burgerVisible && size.width <= 540) {
      report(`menu @${size.name}`, 'the burger is not visible, and the bar nav is hidden at this width');
    }
    if (burgerVisible) {
      await page.click('.burger');
      await page.waitForTimeout(150);
      if (!(await page.isVisible('.sheet'))) report(`menu @${size.name}`, 'the menu did not open');
      const expanded = await page.getAttribute('.burger', 'aria-expanded');
      if (expanded !== 'true') report(`menu @${size.name}`, `aria-expanded is "${expanded}" after opening`);
      const focusedClose = await page.evaluate(() => document.activeElement?.className?.includes('sheet__close'));
      if (!focusedClose) report(`menu @${size.name}`, 'focus did not move into the menu on opening');
      const linkCount = await page.$$eval('.sheet__list a', (as) => as.length);
      if (linkCount === 0) report(`menu @${size.name}`, 'the open menu has no links');

      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      if (await page.isVisible('.sheet')) report(`menu @${size.name}`, 'Escape did not close the menu');
      if ((await page.getAttribute('.burger', 'aria-expanded')) !== 'false') {
        report(`menu @${size.name}`, 'aria-expanded was not reset on closing');
      }
      const focusedBurger = await page.evaluate(() => document.activeElement?.className?.includes('burger'));
      if (!focusedBurger) report(`menu @${size.name}`, 'focus did not return to the burger on closing');
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      if (bodyOverflow === 'hidden') report(`menu @${size.name}`, 'the page is still scroll-locked after closing');

      // Reopening and following a link must close it too.
      await page.click('.burger');
      await page.waitForTimeout(100);
      await page.click('.sheet__list a');
      await page.waitForTimeout(300);
      if (await page.isVisible('.sheet')) report(`menu @${size.name}`, 'the menu stayed open after following a link');
      notes.push(`menu @${size.name}: opens, ${linkCount} links, closes on Escape, on a link, and restores focus`);
    }
  }

  await context.close();
}

/* --- with JavaScript off, the layout must still be the layout --- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of ['/', '/events/', '/about/']) {
    await page.goto(`${ORIGIN}${route}`);
    const shape = await page.evaluate(() => ({
      main: document.querySelector('main')?.getBoundingClientRect().height ?? 0,
      rows: document.querySelectorAll('.row-item').length,
      nav: document.querySelectorAll('.bar__nav a').length,
      footerNav: document.querySelectorAll('.foot__nav a').length,
      sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    if (shape.main < 400) report(`no-JS ${route}`, `the page barely rendered (main is ${shape.main}px tall)`);
    if (shape.nav === 0 && shape.footerNav === 0) report(`no-JS ${route}`, 'no navigation is present at all');
    if (shape.sideways) report(`no-JS ${route}`, 'the page scrolls sideways');
    notes.push(`no-JS ${route}: main ${Math.round(shape.main)}px, ${shape.rows} event rows, ${shape.nav} bar links, ${shape.footerNav} footer links`);
    await page.screenshot({ path: `${OUT}/nojs${route.replace(/[/.]/g, '_') || 'home'}-1440.png`, fullPage: true });
  }
  // The phone case matters more: the bar nav is hidden and the menu needs JS.
  await context.close();

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const phonePage = await phone.newPage();
  await phonePage.goto(`${ORIGIN}/`);
  const phoneNav = await phonePage.evaluate(() => ({
    barNavVisible: [...document.querySelectorAll('.bar__nav a')].some((a) => a.getBoundingClientRect().width > 0),
    footerLinks: [...document.querySelectorAll('.foot__nav a')].filter((a) => a.getBoundingClientRect().width > 0).length,
  }));
  if (!phoneNav.barNavVisible && phoneNav.footerLinks === 0) {
    report('no-JS / @390', 'with the menu needing JavaScript and the bar nav hidden, there is no way to navigate');
  } else if (!phoneNav.barNavVisible) {
    notes.push(`no-JS / @390: the burger menu needs JavaScript; ${phoneNav.footerLinks} footer links are the fallback`);
  }
  await phone.close();
}

await browser.close();

/* ---------------------------------------------------------- report ------ */

writeFileSync(`${OUT}/report.json`, JSON.stringify({ routes: ROUTES, problems, notes }, null, 2));

console.log(`\nInspected ${ROUTES.length} route(s) at ${WIDTHS.map((w) => w.name).join(', ')}px — screenshots in ${OUT}/\n`);
for (const note of notes) console.log(`  note     ${note}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log('\nNo problems found.');
