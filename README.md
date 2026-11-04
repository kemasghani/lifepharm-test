# Paid trial: product guide section

A product-page section for Shopify Online Store 2.0, built on an unmodified copy of Horizon 4.4.0. All products and images are fictional samples. No client code or data is used.

The commit history is split by feature, and each pull request shows one piece of work with its test plan.

| Pull request | What it holds |
| --- | --- |
| [#1](../../pull/1) | Horizon baseline and repo setup, with no theme edits |
| [#2](../../pull/2) | Metafield and metaobject definitions |
| [#3](../../pull/3) | Fictional sample catalog |
| [#4](../../pull/4) | **Task 1a:** the Product guide section |
| [#5](../../pull/5) | **Task 1b:** the card snippet fix |
| [#6](../../pull/6) | Reviewer guide on the homepage |
| [#7](../../pull/7) | Portability fix and the test matrix |
| [#9](../../pull/9) | Heading fix found by testing on Impact, safer setup script |
| [#10](../../pull/10) | The product page story |

## Task 1a: the Product guide section

`sections/product-guide.liquid` adds three blocks a merchant can drag into any order in the theme editor.

| Block | Metafield | Type |
| --- | --- | --- |
| How to use | `custom.how_to_use` | `list.single_line_text_field` |
| Key ingredients | `custom.key_ingredients` | `list.metaobject_reference` to `ingredient` |
| FAQ | `custom.faqs` | `list.metaobject_reference` to `faq_item` |

### How hiding works

Each block captures its own output. A block prints only if that capture has content, and the section prints only if a block printed.

The check looks at what would be shown, not at whether the metafield exists. That matters because Shopify accepts values with nothing to display. Seeding the store confirmed three of them: an empty list (`[]`), a list that points only at draft metaobjects, and a required rich text field holding one empty paragraph. A plain `metafield != blank` check would show a heading with nothing under it.

In the theme editor, a hidden block shows a short note instead, so the merchant can still see, select and reorder it. Shoppers never see that note.

### Decisions

- **One self-contained file.** The section uses no theme snippets, classes or CSS variables, and it inherits fonts and colors from the page. It passes the same test matrix on Horizon and on Dawn with no edits.
- **Sizes in `em`, not `rem`.** Testing on Dawn exposed this: Dawn sets the root to 62.5%, so `1rem` is only 10px there. Everything now scales from the theme's body text, with a 16px floor.
- **Section blocks, not theme blocks.** They work in any Online Store 2.0 theme, including ones without a `blocks/` folder, and one pass can tell whether anything rendered.
- **Metaobjects for ingredients and FAQs.** An ingredient is written once and reused across products, and merchants get a real form instead of hand-written JSON.
- **No JavaScript.** The FAQ uses native `details` elements that share a `name`, so opening one closes the others. The open and close animation only runs in browsers that support it.
- **Definitions as code.** `scripts/setup-custom-data.mjs` brings any store to the same definitions, which matters with more than one store.

### Move it to another theme

1. Copy `sections/product-guide.liquid`.
2. Run `node scripts/setup-custom-data.mjs --store your-store.myshopify.com`.
3. In the theme editor, add the **Product guide** section to the product template.

Tested on Horizon 4.4.0 and Dawn with the file installed. On Impact 7.2.0 the trial's code is locked, so the section's markup and CSS were injected into a live Impact product page on the development store: no overflow at six widths, 51px tap targets and a working FAQ. That test is what led to the `h2` class, because Impact only styles headings through classes.

## The product page around it

The section is shown inside a full product page, built as one story that follows the questions a buyer asks in order.

| Step | Question | Where it lives |
| --- | --- | --- |
| Promise | What is this, and is it for me? | `blocks/pdp-promise.liquid` |
| Offer | What does it cost me? | Price block: saving and price per serving |
| Problem | Why does this exist? | `sections/pdp-why.liquid` |
| Proof | Does it work for people like me? | `sections/pdp-proof.liquid` |
| Plan | How does it fit my day? | Product guide: How to use |
| Parts | What am I putting in my body? | Product guide: Key ingredients |
| Pushback | What if? | Product guide: FAQ |
| Purchase | OK, I'm in. | `sections/pdp-close.liquid`, plus Horizon's sticky bar |

- **One palette per product.** `sections/pdp-palette.liquid` reads `custom.accent_color`, taken from the packaging, and every button and band follows it. Text on the accent switches between white and ink with `color_contrast`, so a pale color can't break legibility.
- **Numbers come from data.** Ingredient count, servings and price per serving are worked out from the product, so they can't drift from what's being sold.
- **The same hide rule.** Every part hides when its data is empty, so a product with no story still reads properly.
- **Reviews and policies are samples.** Quotes are labeled as sample reviews, and the shipping and returns lines are fictional. A live store would feed reviews from its review app.

These are established patterns, not measured results. A sample store has no traffic, so the conversion effect can only be proven with an A/B test on a live store.

## Task 1b: the snippet fix

The snippet had two faults.

1. The `{% if product.metafields.custom.badge %}` block was never closed, so Liquid reached `{% endfor %}` inside it. Shopify refuses the file: `Liquid syntax error (line 11): 'endfor' is not a valid delimiter for if tags. use endif`.
2. The saving could be wrong on multi-variant products. `product.price` and `product.compare_at_price` are each the lowest value across all variants, so they can come from different variants. On the sample store that printed "Save $39.00" on a $39 variant with no compare-at price.

```diff
 {% for product in collection.products limit: 4 %}
+  {% assign variant = product.selected_or_first_available_variant %}
   <div class="card">
-    <a href="{{ product.url }}">{{ product.title }}</a>
-    {% if product.compare_at_price > product.price %}
-      <span class="sale">Save {{ product.compare_at_price | minus: product.price | money }}</span>
+    <a href="{{ product.url }}">{{ product.title | escape }}</a>
+    {% if variant.compare_at_price > variant.price %}
+      <span class="sale">Save {{ variant.compare_at_price | minus: variant.price | money }}</span>
     {% endif %}
-    <span>{{ product.price | money }}</span>
-    {% if product.metafields.custom.badge %}
-      <span class="badge">{{ product.metafields.custom.badge }}</span>
+    <span>{{ variant.price | money }}</span>
+    {% if product.metafields.custom.badge != blank %}
+      <span class="badge">{{ product.metafields.custom.badge.value | escape }}</span>
+    {% endif %}
   </div>
 {% endfor %}
```

The working version is `snippets/collection-product-cards.liquid`. It expects a collection template, because `collection` doesn't exist elsewhere.

## Run it on a development store

```bash
npm install
shopify store auth --store your-store.myshopify.com --scopes read_products,write_products,read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_files,write_files,read_publications,write_publications
node scripts/setup-custom-data.mjs --store your-store.myshopify.com
node scripts/seed-sample-catalog.mjs --store your-store.myshopify.com
shopify theme push --store your-store.myshopify.com
```

`setup-custom-data.mjs` is safe to re-run: anything that already exists is left alone. `seed-sample-catalog.mjs` updates the same records by handle.

## Verify it

Open the store, enter the password, and paste `tests/storefront-matrix.js` into the browser console. It checks block order, item counts, hiding, draft and empty entries, overflow at six widths, tap targets and the FAQ accordion, then prints one table.

| Check | Result |
| --- | --- |
| Test matrix on Horizon 4.4.0 | Every check passes |
| Test matrix on Dawn, same section file, without the alternate template | 32 of 32 passed before the product page work |
| Drag to reorder in the theme editor | Preview follows the new order |
| Same checks on Impact 7.2.0, section injected into a live page | No overflow at six widths, FAQ works |
| Theme Check | 0 offenses, with two documented exclusions for Horizon's own `applicable_disclosures` filter |

## What I'd do next

- Install the section on a purchased copy of Impact and rerun the matrix.
- Add `locales` for the block headings if the EU store runs in more than one language, and translate the metaobjects with Translate & Adapt.
- Decide with the content team how many FAQs "short" should mean per product type.
