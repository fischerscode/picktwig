const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../config.js');
const { encode, decode, validate } = globalThis.PicktwigConfig;
const payload = { v: 1, question: 'Was möchtest du? 🌱 ÄÖÜ', options: [
  { label: 'Für mich 🧑‍💻', url: 'https://example.org/privat?a=1&b=2#kontakt' },
  { label: 'Fürs Team', url: 'http://example.org/team' },
] };
test('Unicode, query strings and fragments survive a share link roundtrip', () => {
  const hash = encode(payload);
  assert.match(hash, /^#p=[A-Za-z0-9_-]+$/);
  assert.deepEqual(decode(hash), { ...payload, theme: 'auto' });
});
test('normalizes whitespace and destination URLs', () => {
  const result = validate({ ...payload, question: ' Frage ', options: payload.options.map(o => ({ label: ` ${o.label} `, url: ' https://example.org ' })) });
  assert.equal(result.question, 'Frage');
  assert.equal(result.options[0].url, 'https://example.org/');
  assert.equal(result.options[0].label, payload.options[0].label);
});
test('rejects malformed, unsupported and incomplete configurations', () => {
  for (const hash of ['#', '#p=', '#r=abc', '#p=!!!!', '#p=a', '#p=bnVsbA', '#p=____', '#p=' + 'a'.repeat(65536)]) assert.throws(() => decode(hash));
  for (const value of [null, {}, { ...payload, v: 2 }, { ...payload, question: '' }, { ...payload, question: 'a'.repeat(241) }, { ...payload, options: [] }, { ...payload, options: [payload.options[0]] }, { ...payload, options: Array(21).fill(payload.options[0]) }, { ...payload, options: [null, null] }]) assert.throws(() => validate(value));
});
test('blocks script/data URLs, relative paths and credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'file:///etc/passwd', '//example.org', '/relative', 'example.org', 'https://user:password@example.org', '']) {
    assert.throws(() => encode({ ...payload, options: [{ label: 'Unsafe', url }, payload.options[1]] }));
  }
});
test('enforces option title length and option count at both limits', () => {
  assert.throws(() => encode({ ...payload, options: [{ label: '', url: 'https://example.org' }, payload.options[1]] }));
  assert.throws(() => encode({ ...payload, options: [{ label: 'x'.repeat(101), url: 'https://example.org' }, payload.options[1]] }));
  const twenty = { ...payload, options: Array(20).fill(payload.options[0]) };
  assert.equal(decode(encode(twenty)).options.length, 20);
});

test('preserves each explicit theme in the link', () => {
  for (const theme of ['auto', 'light', 'dark']) {
    assert.equal(decode(encode({ ...payload, theme })).theme, theme);
  }
});
test('old links default to automatic theme; invalid themes are rejected', () => {
  const legacyHash = '#p=' + Buffer.from(JSON.stringify(payload)).toString('base64url');
  assert.equal(decode(legacyHash).theme, 'auto');
  for (const theme of ['', null, 'system', 'DARK', 0, {}]) {
    assert.throws(() => validate({ ...payload, theme }));
    const hash = '#p=' + Buffer.from(JSON.stringify({ ...payload, theme })).toString('base64url');
    assert.throws(() => decode(hash));
  }
});
