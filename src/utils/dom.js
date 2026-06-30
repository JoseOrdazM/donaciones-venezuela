window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const Utils = {};

  Utils.$ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  Utils.$$ = function (selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  };

  Utils.escapeHTML = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  Utils.normalizar = function (value) {
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  };

  Utils.numero = function (value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  };

  Utils.fecha = function (value) {
    if (!value) return 'sin fecha';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  Utils.fechaRelativa = function (value) {
    if (!value) return 'sin fecha';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const diff = Date.now() - d.getTime();
    const min = Math.round(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return 'Hace ' + min + ' min';
    const hours = Math.round(min / 60);
    if (hours < 24) return 'Hace ' + hours + ' h';
    const days = Math.round(hours / 24);
    if (days < 7) return 'Hace ' + days + ' d';
    return Utils.fecha(value);
  };

  Utils.soloDigitos = function (value) {
    return String(value || '').replace(/[^0-9]/g, '');
  };

  Utils.telHref = function (value) {
    return 'tel:' + String(value || '').replace(/[^0-9+]/g, '');
  };

  Utils.waHref = function (phone, message) {
    const tel = Utils.soloDigitos(phone);
    if (!tel) return '';
    return 'https://wa.me/' + tel + '?text=' + encodeURIComponent(message || App.Config.whatsappMessage);
  };

  Utils.formData = function (form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = typeof value === 'string' ? value.trim() : value;
    });
    return data;
  };

  Utils.fillForm = function (form, data) {
    Object.keys(data || {}).forEach(function (key) {
      const field = form.elements[key];
      if (field) field.value = data[key] == null ? '' : data[key];
    });
  };

  Utils.clearInvalid = function (form) {
    Utils.$$('[aria-invalid="true"]', form).forEach(function (field) {
      field.removeAttribute('aria-invalid');
    });
  };

  Utils.validateRequired = function (form) {
    Utils.clearInvalid(form);
    const missing = Utils.$$('[required]', form).filter(function (field) {
      return !String(field.value || '').trim();
    });
    missing.forEach(function (field) { field.setAttribute('aria-invalid', 'true'); });
    if (missing.length) {
      missing[0].focus();
      return false;
    }
    return true;
  };

  Utils.setFormStatus = function (form, message, type) {
    const status = Utils.$('.form-status', form);
    if (!status) return;
    status.textContent = message || '';
    status.classList.remove('error', 'success');
    if (type) status.classList.add(type);
  };

  Utils.setBusy = function (form, busy) {
    Utils.$$('button, input, select, textarea', form).forEach(function (el) {
      el.disabled = !!busy;
    });
    form.setAttribute('aria-busy', String(!!busy));
  };

  Utils.unique = function (items) {
    return Array.from(new Set((items || []).filter(Boolean))).sort(function (a, b) {
      return String(a).localeCompare(String(b), 'es');
    });
  };

  Utils.debounce = function (fn, ms) {
    let id = null;
    return function () {
      const args = arguments;
      clearTimeout(id);
      id = setTimeout(function () { fn.apply(null, args); }, ms || 250);
    };
  };

  Utils.announce = function (message) {
    const node = Utils.$('#announcer');
    if (!node) return;
    node.textContent = '';
    requestAnimationFrame(function () { node.textContent = message || ''; });
  };

  App.Utils = Utils;
})(window.Humanitaria);
