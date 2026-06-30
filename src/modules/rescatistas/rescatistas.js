window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;
  const Rescatistas = { state: { items: [], query: '', especialidad: '' } };

  function filtered() {
    const q = U.normalizar(Rescatistas.state.query);
    return Rescatistas.state.items.filter(function (item) {
      if (Rescatistas.state.especialidad && item.especialidad !== Rescatistas.state.especialidad) return false;
      if (!q) return true;
      return U.normalizar([item.nombre, item.organizacion, item.especialidad, item.ciudad, item.estado].join(' ')).indexOf(q) !== -1;
    });
  }

  function renderEspecialidades() {
    const select = U.$('#rescatista-especialidad');
    if (!select) return;
    const values = U.unique(Rescatistas.state.items.map(function (i) { return i.especialidad; }));
    select.innerHTML = '<option value="">Todas</option>' + values.map(function (value) { return '<option>' + U.escapeHTML(value) + '</option>'; }).join('');
  }

  function card(item) {
    const phone = U.soloDigitos(item.telefono);
    return '<article class="entity-card"><div class="entity-top"><div><div class="badge-row">' + Cmp.badge(item.especialidad || 'Rescate', 'critical') + Cmp.badge(item.disponibilidad || 'Por confirmar', U.normalizar(item.disponibilidad).indexOf('no disponible') === 0 ? '' : 'success') + '</div><h3>' + U.escapeHTML(item.nombre) + '</h3></div>' + Cmp.badge(U.fechaRelativa(item.actualizado || item.fechaRegistro), '') + '</div>' +
      '<p class="entity-meta">Organización: ' + U.escapeHTML(item.organizacion || 'Independiente') + '</p>' +
      '<p class="entity-meta">' + U.escapeHTML([item.ciudad, item.estado].filter(Boolean).join(', ') || 'Ubicación por confirmar') + '</p>' +
      (item.observaciones ? '<p class="entity-meta">' + U.escapeHTML(item.observaciones) + '</p>' : '') +
      '<div class="entity-actions">' + (phone ? '<a class="btn btn-muted" href="https://wa.me/' + phone + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
      '<button class="btn btn-primary" type="button" data-edit-rescatista="' + U.escapeHTML(item.id) + '">Actualizar</button></div></article>';
  }

  Rescatistas.render = function () {
    const grid = U.$('#rescatistas-grid');
    const count = U.$('#rescatistas-conteo');
    if (!grid) return;
    const rows = filtered();
    if (count) count.textContent = 'Mostrando ' + rows.length + ' de ' + Rescatistas.state.items.length + ' rescatistas';
    grid.innerHTML = rows.length ? rows.map(card).join('') : Cmp.empty('Sin rescatistas', 'Registra un equipo o ajusta los filtros.');
  };

  Rescatistas.load = async function () {
    const grid = U.$('#rescatistas-grid');
    if (grid) grid.innerHTML = Cmp.skeleton(2);
    Rescatistas.state.items = await Sheets.listRescatistas();
    renderEspecialidades();
    Rescatistas.render();
  };

  function resetForm(form) {
    form.reset();
    form.elements.id.value = '';
    U.setFormStatus(form, '', '');
  }

  Rescatistas.init = function () {
    const form = U.$('#form-rescatista');
    const grid = U.$('#rescatistas-grid');
    const search = U.$('#rescatista-busqueda');
    const especialidad = U.$('#rescatista-especialidad');
    if (search) search.addEventListener('input', U.debounce(function () { Rescatistas.state.query = search.value; Rescatistas.render(); }, 180));
    if (especialidad) especialidad.addEventListener('change', function () { Rescatistas.state.especialidad = especialidad.value; Rescatistas.render(); });
    if (grid) grid.addEventListener('click', function (ev) {
      const btn = ev.target.closest('[data-edit-rescatista]');
      if (!btn || !form) return;
      const item = Rescatistas.state.items.find(function (row) { return String(row.id) === String(btn.dataset.editRescatista); });
      if (!item) return;
      U.fillForm(form, item);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      U.announce('Formulario cargado para actualizar rescatista.');
    });
    if (!form) return;
    form.addEventListener('reset', function () { setTimeout(function () { resetForm(form); }, 0); });
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa los campos obligatorios.', 'error');
      const data = U.formData(form);
      try {
        U.setBusy(form, true);
        const res = await Sheets.guardarRescatista(data);
        const saved = Object.assign({}, data, { id: data.id || res.id, actualizado: new Date().toISOString(), fechaRegistro: data.fechaRegistro || new Date().toISOString() });
        const index = Rescatistas.state.items.findIndex(function (row) { return String(row.id) === String(saved.id); });
        if (index >= 0) Rescatistas.state.items[index] = saved; else Rescatistas.state.items.unshift(saved);
        resetForm(form);
        renderEspecialidades();
        Rescatistas.render();
        Cmp.toast('Rescatista guardado.', 'success');
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  };

  App.Rescatistas = Rescatistas;
})(window.Humanitaria);
