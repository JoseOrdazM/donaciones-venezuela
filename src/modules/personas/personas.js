window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;
  const Personas = {};

  function delicado(estado) {
    return U.normalizar(estado).indexOf('fallec') !== -1;
  }

  function cardPersona(persona) {
    const isDelicado = delicado(persona.estado);
    return '<article class="entity-card ' + (isDelicado ? 'sensitive' : '') + '">' +
      '<div class="entity-top"><div><div class="badge-row">' + Cmp.badge(persona.estado || 'Sin estado', isDelicado ? 'critical' : 'success') + '</div><h3>' + U.escapeHTML(persona.nombre) + '</h3></div>' + Cmp.badge(U.fechaRelativa(persona.actualizado), '') + '</div>' +
      '<p class="entity-meta">Cédula: ' + U.escapeHTML(persona.cedula || 'No registrada') + '</p>' +
      '<p class="entity-meta">Ubicación: ' + U.escapeHTML(persona.ubicacion || 'Por confirmar') + '</p>' +
      '<p class="entity-meta">Fuente: ' + U.escapeHTML(persona.fuente || 'Registro comunitario') + '</p>' +
      (isDelicado ? '<p class="notice">' + U.escapeHTML(App.Config.lineasApoyo) + '</p>' : '') + '</article>';
  }

  Personas.init = function () {
    const form = U.$('#form-familiar');
    const results = U.$('#familiares-resultados');
    const banner = U.$('#familiar-banner');
    if (!form || !results) return;
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return;
      const query = U.$('#familiar-query').value.trim();
      results.innerHTML = Cmp.skeleton(2);
      if (banner) banner.classList.add('hidden');
      try {
        U.setBusy(form, true);
        const data = await Sheets.buscarPersona(query);
        if (banner && data.demo) {
          banner.textContent = 'Modo demo o respaldo local: resultados de ejemplo/verificación parcial.';
          banner.classList.remove('hidden');
        }
        results.innerHTML = data.resultados.length ? data.resultados.map(cardPersona).join('') : Cmp.empty('Sin coincidencias', 'No encontramos registros con ese nombre o cédula. Intenta con otra variante o revisa más tarde.');
      } catch (err) {
        results.innerHTML = Cmp.empty('No se pudo buscar', err.message || 'Intenta nuevamente.');
      } finally {
        U.setBusy(form, false);
      }
    });
  };

  App.Personas = Personas;
})(window.Humanitaria);
