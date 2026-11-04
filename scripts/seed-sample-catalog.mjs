#!/usr/bin/env node
// Fills a development store with the fictional sample catalog. Run it after
// setup-custom-data.mjs. Re-running updates the same records by handle.
//
//   node scripts/seed-sample-catalog.mjs --store <store>
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoUserErrors, gql, storeFromArgs } from './lib/shopify.mjs';
import { collections, faqs, ingredients, products } from './sample-data.mjs';

const store = storeFromArgs();
const imagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sample-assets', 'images');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stageImage(name) {
  const filename = `${name}.png`;
  const { stagedUploadsCreate: staged } = gql(
    store,
    /* GraphQL */ `
      mutation Stage($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets { url resourceUrl parameters { name value } }
          userErrors { field message }
        }
      }
    `,
    { input: [{ filename, mimeType: 'image/png', resource: 'IMAGE', httpMethod: 'POST' }] },
  );
  assertNoUserErrors(`stage ${filename}`, staged);

  const [target] = staged.stagedTargets;
  const form = new FormData();
  for (const { name: key, value } of target.parameters) form.append(key, value);
  form.append('file', new Blob([await readFile(path.join(imagesDir, filename))], { type: 'image/png' }), filename);

  const response = await fetch(target.url, { method: 'POST', body: form });
  if (!response.ok) throw new Error(`upload ${filename}: ${response.status}`);
  return target.resourceUrl;
}

async function ensureFile(name, alt) {
  const found = gql(
    store,
    /* GraphQL */ `
      query FindFile($query: String!) {
        files(first: 1, query: $query) { nodes { id fileStatus } }
      }
    `,
    { query: `filename:${name}` },
  ).files.nodes[0];
  if (found) return found.id;

  const { fileCreate } = gql(
    store,
    /* GraphQL */ `
      mutation CreateFile($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files { id fileStatus }
          userErrors { field message }
        }
      }
    `,
    { files: [{ originalSource: await stageImage(name), contentType: 'IMAGE', alt }] },
  );
  assertNoUserErrors(`file ${name}`, fileCreate);

  const { id } = fileCreate.files[0];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { node } = gql(
      store,
      /* GraphQL */ `query FileStatus($id: ID!) { node(id: $id) { ... on MediaImage { fileStatus } } }`,
      { id },
    );
    if (node?.fileStatus === 'READY') break;
    await sleep(1500);
  }
  return id;
}

function upsertMetaobject(type, handle, fields, status = 'ACTIVE') {
  const { metaobjectUpsert } = gql(
    store,
    /* GraphQL */ `
      mutation Upsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
        metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
          metaobject { id handle }
          userErrors { field message code }
        }
      }
    `,
    {
      handle: { type, handle },
      metaobject: { fields, capabilities: { publishable: { status } } },
    },
  );
  assertNoUserErrors(`metaobject ${type}/${handle}`, metaobjectUpsert);
  return metaobjectUpsert.metaobject.id;
}

const refs = { ingredient: {}, faq_item: {} };

for (const { handle, name, amount, summary, image, status } of ingredients) {
  const fileId = await ensureFile(image, name);
  refs.ingredient[handle] = upsertMetaobject(
    'ingredient',
    handle,
    [
      { key: 'name', value: name },
      { key: 'amount', value: amount },
      { key: 'summary', value: summary },
      { key: 'image', value: fileId },
    ],
    status,
  );
  console.log(`ingredient  ${handle}${status ? ` (${status})` : ''}`);
}

for (const { handle, question, answer } of faqs) {
  refs.faq_item[handle] = upsertMetaobject('faq_item', handle, [
    { key: 'question', value: question },
    { key: 'answer', value: answer },
  ]);
  console.log(`faq         ${handle}`);
}

const onlineStore = gql(
  store,
  /* GraphQL */ `query Publications { publications(first: 10) { nodes { id name } } }`,
).publications.nodes.find(({ name }) => name === 'Online Store');

function publish(id) {
  const { publishablePublish } = gql(
    store,
    /* GraphQL */ `
      mutation Publish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) { userErrors { field message } }
      }
    `,
    { id, input: [{ publicationId: onlineStore.id }] },
  );
  assertNoUserErrors(`publish ${id}`, publishablePublish);
}

const toMetafield = (entry) =>
  entry.handles
    ? {
        namespace: 'custom',
        key: entry.key,
        type: 'list.metaobject_reference',
        value: JSON.stringify(entry.handles.map((handle) => refs[entry.kind][handle])),
      }
    : entry;

const productIds = {};

for (const product of products) {
  const existing = gql(
    store,
    /* GraphQL */ `
      query Existing($handle: String!) {
        productByIdentifier(identifier: { handle: $handle }) { id mediaCount { count } }
      }
    `,
    { handle: product.handle },
  ).productByIdentifier;

  const needsImage = !existing || existing.mediaCount.count === 0;
  const single = product.variants.length === 1;
  const optionName = single ? 'Title' : 'Size';

  const input = {
    title: product.title,
    handle: product.handle,
    descriptionHtml: `<p>${product.description}</p>`,
    vendor: 'Trial Supply Co.',
    productType: 'Sample',
    status: 'ACTIVE',
    templateSuffix: product.templateSuffix ?? null,
    productOptions: [
      { name: optionName, position: 1, values: product.variants.map(({ name }) => ({ name })) },
    ],
    variants: product.variants.map(({ name, price, compareAt }) => ({
      optionValues: [{ optionName, name }],
      price,
      compareAtPrice: compareAt ?? null,
      inventoryItem: { tracked: false },
    })),
    metafields: product.metafields.map(toMetafield),
  };

  if (needsImage) {
    input.files = [
      {
        originalSource: await stageImage(product.image),
        contentType: 'IMAGE',
        alt: product.title,
      },
    ];
  }

  const { productSet } = gql(
    store,
    /* GraphQL */ `
      mutation SetProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
        productSet(input: $input, identifier: $identifier, synchronous: true) {
          product { id handle }
          userErrors { field message code }
        }
      }
    `,
    { input, identifier: existing ? { id: existing.id } : null },
  );
  assertNoUserErrors(`product ${product.handle}`, productSet);

  productIds[product.handle] = productSet.product.id;
  publish(productSet.product.id);
  console.log(`product     ${product.handle}`);
}

for (const { handle, title, templateSuffix, description, products: members } of collections) {
  const existing = gql(
    store,
    /* GraphQL */ `query C($handle: String!) { collectionByIdentifier(identifier: { handle: $handle }) { id } }`,
    { handle },
  ).collectionByIdentifier;

  if (existing) {
    console.log(`skip        collection ${handle}`);
    continue;
  }

  const { collectionCreate } = gql(
    store,
    /* GraphQL */ `
      mutation CreateCollection($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id }
          userErrors { field message }
        }
      }
    `,
    {
      input: {
        handle,
        title,
        templateSuffix,
        descriptionHtml: `<p>${description}</p>`,
        products: members.map((member) => productIds[member]),
      },
    },
  );
  assertNoUserErrors(`collection ${handle}`, collectionCreate);
  publish(collectionCreate.collection.id);
  console.log(`collection  ${handle}`);
}
