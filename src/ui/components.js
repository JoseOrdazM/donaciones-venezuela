window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Components = {};
  let lastFocused = null;

  Components.statCard = function (label, value) {
    return '<article class="stat-card"><span>' + U.escapeHTML(label) + '</span><strong>' + U.escapeHTML(value) + '</strong></article>';
  };

  Components.empty = function (title, text) {
    return '<div class="empty-state"><strong>' + U.escapeHTML(title) + '</strong><p>' + U.escapeHTML(text || '') + '</p></div>';
  };

  Components.skeleton = function (count) {
    return '<div class="skeleton-grid">' + Array.from({ length: count || 3 }).map(function () { return '<div class="skeleton"></div>'; }).join('') + '</div>';
  };

  Components.badge = function (text, tone) {
    return '<span class="badge ' + U.escapeHTML(tone || '') + '">' + U.escapeHTML(text) + '</span>';
  };

  Components.toast = function (message, type) {
    const root = U.$('#toast-root');
    if (!root) return;
    const node = document.createElement('div');
    node.className = 'toast ' + (type || '');
    node.textContent = message;
    root.appendChild(node);
    U.announce(message);
    setTimeout(function () { node.remove(); }, 4200);
  };

  Components.modal = function (title, body) {
    const root = U.$('#modal-root');
    if (!root) return;
    lastFocused = document.activeElement;
    root.innerHTML = '<div class="modal-overlay" role="presentation">' +
      '<section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-header"><h2 id="modal-title">' + U.escapeHTML(title) + '</h2>' +
      '<button class="icon-button" type="button" data-modal-close aria-label="Cerrar modal">×</button></div>' +
      '<div class="modal-body">' + body + '</div></section></div>';

    const overlay = U.$('.modal-overlay', root);
    const close = function () { Components.closeModal(); };
    overlay.addEventListener('click', function (ev) { if (ev.target === overlay) close(); });
    U.$$('[data-modal-close], [data-modal-cancel]', root).forEach(function (btn) { btn.addEventListener('click', close); });
    overlay.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') close();
      if (ev.key !== 'Tab') return;
      const focusable = U.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', overlay).filter(function (el) { return !el.disabled; });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    });
    const focusTarget = U.$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', root);
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 0);
  };

  Components.closeModal = function () {
    const root = U.$('#modal-root');
    if (root) root.innerHTML = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  };

  Components.actionCard = function (item) {
    return '<article class="info-card"><div class="info-icon" aria-hidden="true">' + U.escapeHTML(item.icon) + '</div>' +
      '<h3>' + U.escapeHTML(item.title) + '</h3><p>' + U.escapeHTML(item.text) + '</p>' +
      '<button class="btn" type="button" data-route="' + U.escapeHTML(item.route) + '">' + U.escapeHTML(item.cta) + '</button></article>';
  };

  App.Components = Components;
})(window.Humanitaria);
