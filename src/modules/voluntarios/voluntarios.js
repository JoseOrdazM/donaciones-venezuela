window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;
  const Voluntarios = { state: { items: [], query: '', tipo: '' } };

  function filtered() {
    const q = U.normalizar(Voluntarios.state.query);
    return Voluntarios.state.items.filter(function (item) {
      if (Voluntarios.state.tipo && item.tipo !== Voluntarios.state.tipo) return false;
      if (!q) return true;
      return U.normalizar([item.nombre, item.apellido, item.ciudad, item.estado, item.profesion, item.tipo].join(' ')).indexOf(q) !== -1;
    });
  }

  function renderTipos() {
    const select = U.$('#voluntario-tipo');
    if (!select) return;
    const tipos = U.unique(Voluntarios.state.items.map(function (i) { return i.tipo; }));
    select.innerHTML = '<option value="">Todos</option>' + tipos.map(function (tipo) { return '<option>' + U.escapeHTML(tipo) + '</option>'; }).join('');
  }

  function card(item) {
    const nombre = [item.nombre, item.apellido].filter(Boolean).join(' ');
    const phone = U.soloDigitos(item.telefono);
    return '<article class="entity-card"><div class="entity-top"><div><div class="badge-row">' + Cmp.badge(item.tipo || 'Voluntario', 'blue') + Cmp.badge(item.disponibilidad || 'Por confirmar', U.normalizar(item.disponibilidad).indexOf('no disponible') === 0 ? '' : 'success') + '</div><h3>' + U.escapeHTML(nombre) + '</h3></div>' + Cmp.badge(U.fechaRelativa(item.actualizado || item.fechaRegistro), '') + '</div>' +
      '<p class="entity-meta">' + U.escapeHTML(item.profesion || 'Profesión por confirmar') + '</p>' +
      '<p class="entity-meta">' + U.escapeHTML([item.ciudad, item.estado].filter(Boolean).join(', ') || 'Ubicación por confirmar') + '</p>' +
      (item.observaciones ? '<p class="entity-meta">' + U.escapeHTML(item.observaciones) + '</p>' : '') +
      '<div class="entity-actions">' + (phone ? '<a class="btn btn-muted" href="https://wa.me/' + phone + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
      '<button class="btn btn-primary" type="button" data-edit-voluntario="' + U.escapeHTML(item.id) + '">Actualizar</button></div></article>';
  }

  Voluntarios.render = function () {
    const grid = U.$('#voluntarios-grid');
    const count = U.$('#voluntarios-conteo');
    if (!grid) return;
    const rows = filtered();
    if (count) count.textContent = 'Mostrando ' + rows.length + ' de ' + Voluntarios.state.items.length + ' voluntarios';
    grid.innerHTML = rows.length ? rows.map(card).join('') : Cmp.empty('Sin voluntarios', 'Registra el primer voluntario o ajusta los filtros.');
  };

  Voluntarios.load = async function () {
    const grid = U.$('#voluntarios-grid');
    if (grid) grid.innerHTML = Cmp.skeleton(2);
    Voluntarios.state.items = await Sheets.listVoluntarios();
    renderTipos();
    Voluntarios.render();
  };

  function resetForm(form) {
    form.reset();
    form.elements.id.value = '';
    U.setFormStatus(form, '', '');
  }

  Voluntarios.init = function () {
    const form = U.$('#form-voluntario');
    const grid = U.$('#voluntarios-grid');
    const search = U.$('#voluntario-busqueda');
    const tipo = U.$('#voluntario-tipo');
    if (search) search.addEventListener('input', U.debounce(function () { Voluntarios.state.query = search.value; Voluntarios.render(); }, 180));
    if (tipo) tipo.addEventListener('change', function () { Voluntarios.state.tipo = tipo.value; Voluntarios.render(); });
    if (grid) grid.addEventListener('click', function (ev) {
      const btn = ev.target.closest('[data-edit-voluntario]');
      if (!btn || !form) return;
      const item = Voluntarios.state.items.find(function (row) { return String(row.id) === String(btn.dataset.editVoluntario); });
      if (!item) return;
      U.fillForm(form, item);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      U.announce('Formulario cargado para actualizar voluntario.');
    });
    if (!form) return;
    form.addEventListener('reset', function () { setTimeout(function () { resetForm(form); }, 0); });
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa los campos obligatorios.', 'error');
      const data = U.formData(form);
      try {
        U.setBusy(form, true);
        const res = await Sheets.guardarVoluntario(data);
        const saved = Object.assign({}, data, { id: data.id || res.id, actualizado: new Date().toISOString(), fechaRegistro: data.fechaRegistro || new Date().toISOString() });
        const index = Voluntarios.state.items.findIndex(function (row) { return String(row.id) === String(saved.id); });
        if (index >= 0) Voluntarios.state.items[index] = saved; else Voluntarios.state.items.unshift(saved);
        resetForm(form);
        renderTipos();
        Voluntarios.render();
        Cmp.toast('Voluntario guardado.', 'success');
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  };

  App.Voluntarios = Voluntarios;
})(window.Humanitaria);
