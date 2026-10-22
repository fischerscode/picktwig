(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = globalThis.PicktwigConfig;
  const list = $('option-list');
  let nextId = 0;
  function renderChoices(container, options, preview) {
    container.replaceChildren();
    for (const option of options) {
      const element = document.createElement(preview ? 'div' : 'a');
      element.className = 'choice';
      const content = document.createElement('span');
      const label = document.createElement('span');
      label.className = 'choice-label';
      label.textContent = option.label;
      content.append(label);
      if (!preview) {
        element.href = option.url;
        element.referrerPolicy = 'no-referrer';
      }
      element.append(content);
      container.append(element);
    }
  }
  function editorTheme() { return document.querySelector('input[name="theme"]:checked').value; }
  function applyTheme(theme) { document.documentElement.dataset.theme = theme; }
  function rows() { return [...list.children]; }
  function updatePreview() {
    applyTheme(editorTheme());
    const all = rows();
    $('preview-question').textContent = $('question').value.trim() || 'Wofür interessierst du dich?';
    renderChoices($('preview-options'), all.map((row, index) => ({ label: row.querySelector('.option-label').value.trim() || `Option ${index + 1}` })), true);
    $('option-count').textContent = `${all.length} Optionen`;
    $('add-option').disabled = all.length >= config.MAX_OPTIONS;
    all.forEach((row, index) => {
      row.querySelector('.option-number').textContent = String(index + 1).padStart(2, '0');
      const remove = row.querySelector('button');
      remove.disabled = all.length <= 2;
      remove.setAttribute('aria-label', `Option ${index + 1} entfernen`);
    });
    $('result').hidden = true;
    $('form-error').hidden = true;
  }
  function addOption(focus = false) {
    if (list.children.length >= config.MAX_OPTIONS) return;
    const id = ++nextId;
    const row = document.createElement('div');
    row.className = 'option-row';
    // Only fixed, trusted markup; all user content is assigned via textContent/value.
    row.innerHTML = `<span class="option-number" aria-hidden="true"></span><div class="option-fields"><label class="sr-only" for="label-${id}">Antwort</label><input class="option-label" id="label-${id}" type="text" maxlength="100" placeholder="Antwort, z. B. Für mich privat" required autocomplete="off"><label class="sr-only" for="url-${id}">Ziel-URL</label><input class="option-url" id="url-${id}" type="url" placeholder="https://example.com" required autocomplete="off" spellcheck="false"></div><button type="button" class="remove-button" title="Option entfernen">×</button>`;
    row.querySelector('button').addEventListener('click', () => {
      if (list.children.length <= 2) return;
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      updatePreview();
      next.querySelector('input').focus();
    });
    list.append(row);
    updatePreview();
    if (focus) row.querySelector('input').focus();
  }
  list.addEventListener('input', updatePreview);
  $('question').addEventListener('input', updatePreview);
  document.querySelectorAll('input[name="theme"]').forEach(input => input.addEventListener('change', updatePreview));
  $('add-option').addEventListener('click', () => addOption(true));
  $('link-form').addEventListener('submit', event => {
    event.preventDefault();
    $('result').hidden = true;
    $('form-error').hidden = true;
    $('copy-status').textContent = '';
    try {
      const payload = { v: 1, theme: editorTheme(), question: $('question').value, options: rows().map(row => ({ label: row.querySelector('.option-label').value, url: row.querySelector('.option-url').value })) };
      const base = new URL(location.href);
      base.hash = '';
      base.search = '';
      const link = base.href + config.encode(payload);
      $('result-url').value = link;
      $('open-link').href = link;
      $('result').hidden = false;
      $('result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
    } catch (error) {
      $('form-error').textContent = error.message;
      $('form-error').hidden = false;
    }
  });
  $('copy-link').addEventListener('click', async () => {
    const value = $('result-url').value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      $('copy-status').textContent = 'Link kopiert.';
    } catch {
      $('result-url').focus();
      $('result-url').select();
      $('copy-status').textContent = 'Bitte kopiere den markierten Link manuell.';
    }
  });
  function renderRoute() {
    applyTheme(editorTheme());
    document.body.classList.remove('picker-mode');
    document.querySelector('.site-header').hidden = false;
    $('builder').hidden = true;
    $('picker').hidden = true;
    $('route-error').hidden = true;
    if (location.hash) {
      try {
        const payload = config.decode(location.hash);
        applyTheme(payload.theme);
        $('picker-question').textContent = payload.question;
        renderChoices($('picker-options'), payload.options, false);
        document.body.classList.add('picker-mode');
        document.querySelector('.site-header').hidden = true;
        $('picker').hidden = false;
        document.title = `${payload.question} — Picktwig`;
        return;
      } catch {
        $('route-error').textContent = 'Dieser Auswahl-Link ist ungültig oder unvollständig. Bitte frage nach dem vollständigen Link oder erstelle hier eine neue Auswahl.';
        $('route-error').hidden = false;
      }
    }
    document.title = 'Picktwig — Deine Wahl. Dein Weg.';
    $('builder').hidden = false;
  }
  addOption();
  addOption();
  window.addEventListener('hashchange', renderRoute);
  // Restore the selection screen when returning from a destination via Back.
  window.addEventListener('pageshow', renderRoute);
  renderRoute();
})();
