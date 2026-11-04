#!/usr/bin/env node
// Creates the metaobject and metafield definitions the Product guide section
// reads. Safe to re-run: anything that already exists is left alone, so the
// same command brings each store to the same state.
//
//   shopify store auth --store <store> --scopes read_products,write_products,read_metaobject_definitions,write_metaobject_definitions
//   node scripts/setup-custom-data.mjs --store <store>
import { metaobjects, productMetafields } from './custom-data.config.mjs';
import { assertNoUserErrors, gql, storeFromArgs } from './lib/shopify.mjs';

const store = storeFromArgs();

const FIND_METAOBJECT = /* GraphQL */ `
  query FindMetaobjectDefinition($type: String!) {
    metaobjectDefinitionByType(type: $type) { id type }
  }
`;

const CREATE_METAOBJECT = /* GraphQL */ `
  mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }
`;

const FIND_METAFIELD = /* GraphQL */ `
  query FindMetafieldDefinition($key: String!) {
    metafieldDefinitions(first: 1, ownerType: PRODUCT, namespace: "custom", key: $key) {
      nodes { id key }
    }
  }
`;

const CREATE_METAFIELD = /* GraphQL */ `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id key }
      userErrors { field message code }
    }
  }
`;

const metaobjectIds = {};

for (const { type, name, displayNameKey, fieldDefinitions } of metaobjects) {
  const existing = gql(store, FIND_METAOBJECT, { type }).metaobjectDefinitionByType;

  if (existing) {
    metaobjectIds[type] = existing.id;
    console.log(`skip    metaobject ${type}`);
    continue;
  }

  const { metaobjectDefinitionCreate: result } = gql(store, CREATE_METAOBJECT, {
    definition: {
      type,
      name,
      displayNameKey,
      fieldDefinitions,
      // Without PUBLIC_READ the references resolve to nothing on the storefront
      // and the block would quietly hide even though the product has data.
      access: { storefront: 'PUBLIC_READ' },
      capabilities: {
        publishable: { enabled: true },
        translatable: { enabled: true },
      },
    },
  });

  assertNoUserErrors(`metaobject ${type}`, result);
  metaobjectIds[type] = result.metaobjectDefinition.id;
  console.log(`create  metaobject ${type}`);
}

for (const { key, name, description, type, metaobjectType } of productMetafields) {
  const existing = gql(store, FIND_METAFIELD, { key }).metafieldDefinitions.nodes[0];

  if (existing) {
    console.log(`skip    metafield custom.${key}`);
    continue;
  }

  const { metafieldDefinitionCreate: result } = gql(store, CREATE_METAFIELD, {
    definition: {
      namespace: 'custom',
      ownerType: 'PRODUCT',
      key,
      name,
      description,
      type,
      pin: true,
      access: { storefront: 'PUBLIC_READ' },
      validations: metaobjectType
        ? [{ name: 'metaobject_definition_id', value: metaobjectIds[metaobjectType] }]
        : [],
    },
  });

  assertNoUserErrors(`metafield ${key}`, result);
  console.log(`create  metafield custom.${key}`);
}
