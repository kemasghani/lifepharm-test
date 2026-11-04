// Storefront test matrix. Open the trial store, enter the password, then paste
// this whole file into the browser console. It needs no tools or credentials
// and prints one table: every row should say pass.
(async () => {
  const preview = new URLSearchParams(location.search).get('preview_theme_id');
  const withTheme = (path) => `${path}?${preview ? `preview_theme_id=${preview}&` : ''}cb=${Date.now()}`;

  const products = [
    { handle: 'daily-greens-powder', blocks: ['how_to_use', 'key_ingredients', 'faq'], steps: 3, ingredients: 4, faqs: 5, story: true, proof: 3 },
    { handle: 'daily-greens-travel-sticks', blocks: ['faq', 'key_ingredients', 'how_to_use'], steps: 3, ingredients: 4, faqs: 3, story: true, proof: 0 },
    { handle: 'magnesium-night-capsules', blocks: ['how_to_use', 'faq'], steps: 2, ingredients: 0, faqs: 2, story: true, proof: 2 },
    { handle: 'marine-collagen-peptides', blocks: ['how_to_use', 'key_ingredients'], steps: 4, ingredients: 2, faqs: 0, story: true, proof: 1 },
    { handle: 'vitamin-c-drink-mix', blocks: [], steps: 0, ingredients: 0, faqs: 0, story: false, proof: 0 },
    { handle: 'bamboo-measuring-scoop', blocks: [], steps: 0, ingredients: 0, faqs: 0, story: false, proof: 0 },
  ];

  const load = async (path) => {
    const response = await fetch(withTheme(path), { credentials: 'include' });
    const html = await response.text();
    return { html, doc: new DOMParser().parseFromString(html, 'text/html') };
  };

  const rows = [];
  const check = (test, pass, detail = '') => rows.push({ test, result: pass ? 'pass' : 'FAIL', detail });

  for (const expected of products) {
    const { html, doc } = await load(`/products/${expected.handle}`);
    const blocks = [...doc.querySelectorAll('.product-guide__block')].map((block) =>
      [...block.classList].find((name) => name.startsWith('product-guide__block--')).replace('product-guide__block--', ''),
    );
    const count = (selector) => doc.querySelectorAll(selector).length;

    check(`${expected.handle}: blocks and order`, blocks.join() === expected.blocks.join(), blocks.join(' > ') || 'none');
    check(
      `${expected.handle}: item counts`,
      count('.product-guide__step') === expected.steps &&
        count('.product-guide__ingredient') === expected.ingredients &&
        count('.product-guide__faq') === expected.faqs,
      `${count('.product-guide__step')} steps, ${count('.product-guide__ingredient')} ingredients, ${count('.product-guide__faq')} FAQs`,
    );
    check(`${expected.handle}: wrapper only when needed`, !!doc.querySelector('.product-guide') === expected.blocks.length > 0);
    check(`${expected.handle}: no merchant note for shoppers`, count('.product-guide__notice') === 0);
    check(`${expected.handle}: draft and empty entries stay out`, !html.includes('Unpublished ingredient') && !html.includes('This question has an empty answer'));
    check(
      `${expected.handle}: story sections only with story data`,
      !!doc.querySelector('.pdp-why') === expected.story && !!doc.querySelector('.pdp-close') === expected.story && count('.pdp-proof__card') === expected.proof,
      `${count('.pdp-proof__card')} quotes`,
    );
  }

  const { doc: full } = await load('/products/daily-greens-powder');
  const guide = full.querySelector('.product-guide');
  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((node) => node.outerHTML).join('');

  for (const width of [320, 375, 414, 768, 1024, 1440]) {
    const frame = document.createElement('iframe');
    frame.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:760px;border:0;background:#fff;z-index:2147483647`;
    frame.srcdoc = `<!doctype html><html class="${document.documentElement.className}"><head><meta name="viewport" content="width=device-width">${styles}</head><body style="margin:0">${guide.outerHTML}</body></html>`;
    await new Promise((resolve) => {
      frame.onload = () => setTimeout(resolve, 700);
      document.body.append(frame);
    });

    const win = frame.contentWindow;
    const inner = win.document;
    const overflow = [...inner.querySelectorAll('.product-guide *')].filter((node) => node.getBoundingClientRect().right > win.innerWidth + 0.5);
    const tap = inner.querySelector('.product-guide__question').getBoundingClientRect().height;

    check(`${width}px: no horizontal overflow`, inner.documentElement.scrollWidth <= width && overflow.length === 0, `${inner.documentElement.scrollWidth}px`);
    check(`${width}px: FAQ tap target at least 44px`, tap >= 44, `${Math.round(tap)}px`);
    frame.remove();
  }

  const onPage = [...document.querySelectorAll('.product-guide__faq')];
  if (onPage.length > 1) {
    onPage[1].open = true;
    await new Promise((resolve) => setTimeout(resolve, 60));
    check('FAQ: opening one closes the others', onPage.filter((item) => item.open).length === 1 && onPage[1].open);
    onPage[0].open = true;
  }

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--pdp-accent').trim();
  if (accent) check('Product page accent is set', accent.startsWith('#'), accent);

  const failed = rows.filter((row) => row.result !== 'pass');
  console.table(rows);
  return `${rows.length - failed.length}/${rows.length} passed${failed.length ? `. Failed: ${failed.map((row) => row.test).join('; ')}` : ''}`;
})();
