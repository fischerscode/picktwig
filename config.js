/* The same validation is used for generated and opened links. No persistence. */
(() => {
  'use strict';
  const PREFIX = '#p=';
  const MAX_OPTIONS = 20;
  const MAX_HASH_LENGTH = 65536;
  function normalizeUrl(raw) {
    if (typeof raw !== 'string' || !raw.trim()) throw new Error('Bitte gib für jede Option eine Ziel-URL ein.');
    let url;
    try { url = new URL(raw.trim()); } catch { throw new Error('Bitte verwende vollständige URLs mit https:// oder http://.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Erlaubt sind nur HTTP- und HTTPS-URLs ohne Zugangsdaten.');
    }
    return url.href;
  }
  function validate(payload) {
    if (!payload || payload.v !== 1 || typeof payload.question !== 'string' || !payload.question.trim() || payload.question.trim().length > 240) {
      throw new Error('Bitte gib eine Frage mit höchstens 240 Zeichen ein.');
    }
    if (!Array.isArray(payload.options) || payload.options.length < 2 || payload.options.length > MAX_OPTIONS) {
      throw new Error(`Bitte verwende zwischen 2 und ${MAX_OPTIONS} Optionen.`);
    }
    const theme = payload.theme === undefined ? 'auto' : payload.theme;
    if (!['auto', 'light', 'dark'].includes(theme)) {
      throw new Error('Bitte wähle Automatisch, Hell oder Dunkel als Darstellung.');
    }
    return { v: 1, theme, question: payload.question.trim(), options: payload.options.map(option => {
      if (!option || typeof option.label !== 'string' || !option.label.trim() || option.label.trim().length > 100) {
        throw new Error('Jede Option braucht einen Titel mit höchstens 100 Zeichen.');
      }
      return { label: option.label.trim(), url: normalizeUrl(option.url) };
    }) };
  }
  function encode(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(validate(payload)));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const hash = PREFIX + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    if (hash.length > MAX_HASH_LENGTH) throw new Error('Die Konfiguration ist zu lang. Bitte kürze die Ziel-URLs.');
    return hash;
  }
  function decode(hash) {
    if (!hash.startsWith(PREFIX) || hash.length > MAX_HASH_LENGTH) throw new Error('Ungültiger Auswahl-Link.');
    const encoded = hash.slice(PREFIX.length);
    if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('Ungültiger Auswahl-Link.');
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
    return validate(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)))));
  }
  globalThis.PicktwigConfig = Object.freeze({ encode, decode, validate, MAX_OPTIONS });
})();
