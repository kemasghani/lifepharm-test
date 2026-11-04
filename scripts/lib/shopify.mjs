// Thin wrapper around `shopify store execute`, so the scripts need no token
// handling. Authenticate once per store with `shopify store auth` first.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export function storeFromArgs(argv = process.argv) {
  const index = argv.indexOf('--store');
  const store = index > -1 ? argv[index + 1] : process.env.SHOPIFY_STORE;
  if (!store) {
    console.error('Pass the store: --store your-store.myshopify.com');
    process.exit(1);
  }
  return store;
}

export function gql(store, query, variables = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'shopify-gql-'));
  const queryFile = path.join(dir, 'query.graphql');
  const variableFile = path.join(dir, 'variables.json');
  writeFileSync(queryFile, query);
  writeFileSync(variableFile, JSON.stringify(variables));

  try {
    const stdout = execFileSync(
      'shopify',
      [
        'store', 'execute',
        '--store', store,
        '--query-file', queryFile,
        '--variable-file', variableFile,
        '--allow-mutations',
        '--json',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 },
    );
    const parsed = JSON.parse(stdout);
    return parsed.data ?? parsed;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Every mutation payload exposes userErrors. Fail loudly on the first one
// instead of carrying on with a half-built store.
export function assertNoUserErrors(label, payload) {
  const errors = payload?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Error(`${label}: ${JSON.stringify(errors)}`);
  }
  return payload;
}
