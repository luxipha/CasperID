import assert from 'node:assert/strict';
const base = process.env.STAGING_WEB_URL || 'https://casperid-frontend-staging.onrender.com';
const revisionResponse = await fetch(new URL('/build-info.json', base));
assert.equal(revisionResponse.status, 200);
const metadata = await revisionResponse.json();
if (process.env.EXPECTED_COMMIT) assert.equal(metadata.commit, process.env.EXPECTED_COMMIT);
for (const path of ['/', '/authorize', '/business', '/admin']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes('id="root"'), path);
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(match => match[1]);
  assert.ok(scripts.length > 0, path);
  for (const asset of scripts) assert.equal((await fetch(new URL(asset, base))).status, 200, asset);
}
console.log('Staging web revision, SPA routes, and referenced JavaScript assets verified.');
