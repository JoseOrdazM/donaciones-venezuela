window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;
  const Donaciones = { state: { centros: [], tipo: 'todos', categoria: '', busqueda: '' } };

  function allInsumos(centro) {
    return [].concat(centro.necesita || [], centro.cubiertos || [], centro.tiene_disponible || []);
  }

  function toneUrgencia(value) {
    const v = U.normalizar(value);
    if (v.indexOf('critico') === 0 || v.indexOf('alta') === 0) return 'critical';
    if (v.indexOf('moderado') === 0 || v.indexOf('media') === 0) return 'warning';
    return 'success';
  }

  function progress(item) {
    const needed = U.numero(item.cantidadNecesaria, 0);
    const received = U.numero(item.cantidadRecibida, 0);
    if (!needed) return 0;
    return Math.min(100, Math.round((received / needed) * 100));
  }

  function cardCentro(centro) {
    const isHospital = U.normalizar(centro.tipo).indexOf('hospital') === 0;
    const isRefugio = U.normalizar(centro.tipo + ' ' + centro.nombre).indexOf('refugio') !== -1;
    const needs = (centro.necesita || []).slice(0, 4);
    const covered = (centro.cubiertos || []).length;
    const tipoBadge = isHospital ? 'Hospital' : (isRefugio ? 'Refugio' : (centro.tipo || 'Centro'));
    const operativo = isHospital && App.Hospitales ? App.Hospitales.estadoOperativo(centro) : (needs.length ? 'Recibiendo ayuda' : 'Sin necesidades abiertas');
    const phone = U.soloDigitos(centro.telefono);
    return '<article class="entity-card">' +
      '<div class="entity-top"><div><div class="badge-row">' + Cmp.badge(tipoBadge, isHospital ? 'critical' : 'blue') + Cmp.badge(operativo, needs.length ? 'warning' : 'success') + '</div>' +
      '<h3>' + U.escapeHTML(centro.nombre) + '</h3></div>' + Cmp.badge(U.fechaRelativa(centro.actualizado), '') + '</div>' +
      '<p class="entity-meta">' + U.escapeHTML(centro.ubicacion || 'Ubicación por confirmar') + '</p>' +
      (centro.telefono ? '<p class="entity-meta">Contacto: ' + U.escapeHTML(centro.telefono) + '</p>' : '') +
      '<ul class="needs-list">' + (needs.length ? needs.map(function (item) {
        const pct = progress(item);
        return '<li class="need-item"><div class="need-title"><strong>' + U.escapeHTML(item.nombre) + '</strong><span>' + U.escapeHTML(item.categoria || 'Otros') + '</span></div>' +
          '<div class="badge-row">' + Cmp.badge(item.urgencia || 'Normal', toneUrgencia(item.urgencia)) + Cmp.badge((item.cantidadRecibida || 0) + '/' + (item.cantidadNecesaria || '—') + ' ' + (item.unidad || 'unidades'), '') + '</div>' +
          '<div class="progress" aria-label="' + pct + '% cubierto"><span style="--value:' + pct + '%"></span></div></li>';
      }).join('') : '<li class="need-item">No hay necesidades abiertas registradas.</li>') + '</ul>' +
      (covered ? '<p class="entity-meta">Cubiertos: ' + covered + '</p>' : '') +
      '<div class="entity-actions">' +
      (centro.telefono ? '<a class="btn btn-muted" href="' + U.telHref(centro.telefono) + '">Llamar</a>' : '') +
      (phone ? '<a class="btn btn-muted" href="' + U.waHref(centro.telefono) + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
      '<button class="btn btn-primary" type="button" data-movimiento="' + U.escapeHTML(centro.nombre) + '">Registrar movimiento</button>' +
      '<button class="btn btn-muted" type="button" data-historial="' + U.escapeHTML(centro.nombre) + '">Historial</button>' +
      '</div></article>';
  }

  function filtered() {
    const q = U.normalizar(Donaciones.state.busqueda);
    return Donaciones.state.centros.filter(function (centro) {
      if (Donaciones.state.tipo !== 'todos' && U.normalizar(centro.tipo).indexOf(U.normalizar(Donaciones.state.tipo)) !== 0) return false;
      if (Donaciones.state.categoria) {
        const hasCat = allInsumos(centro).some(function (i) { return i.categoria === Donaciones.state.categoria; });
        if (!hasCat) return false;
      }
      if (q) {
        const text = U.normalizar([centro.nombre, centro.ubicacion].concat(allInsumos(centro).map(function (i) { return i.nombre; })).join(' '));
        if (text.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderCategorias() {
    const select = U.$('#centro-categoria');
    if (!select) return;
    const cats = U.unique(Donaciones.state.centros.flatMap(function (c) { return allInsumos(c).map(function (i) { return i.categoria; }); }));
    select.innerHTML = '<option value="">Todas</option>' + cats.map(function (cat) { return '<option>' + U.escapeHTML(cat) + '</option>'; }).join('');
  }

  Donaciones.render = function () {
    const grid = U.$('#centros-grid');
    const count = U.$('#centros-conteo');
    if (!grid) return;
    const rows = filtered();
    if (count) count.textContent = 'Mostrando ' + rows.length + ' de ' + Donaciones.state.centros.length + ' centros registrados';
    grid.innerHTML = rows.length ? rows.map(cardCentro).join('') : Cmp.empty('Sin resultados', 'Ajusta los filtros o reporta nueva información verificada.');
  };

  function findCentro(nombre) {
    return Donaciones.state.centros.find(function (c) { return U.normalizar(c.nombre) === U.normalizar(nombre); });
  }

  function openMovimiento(nombre) {
    const centro = findCentro(nombre);
    if (!centro) return;
    const insumos = (centro.necesita || []).concat(centro.cubiertos || []);
    if (!insumos.length) { Cmp.toast('Este centro no tiene insumos registrables.', 'error'); return; }
    Cmp.modal('Registrar movimiento', '<form id="form-movimiento" class="form-stack" novalidate>' +
      '<label class="field"><span>Tipo de movimiento</span><select name="tipoMovimiento" required><option>Entrada</option><option>Salida</option></select></label>' +
      '<label class="field"><span>Insumo</span><select name="insumo" required>' + insumos.map(function (i) { return '<option value="' + U.escapeHTML(i.nombre) + '">' + U.escapeHTML(i.nombre) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Cantidad</span><input name="cantidad" type="number" min="1" step="1" required /></label>' +
      '<label class="field"><span>Voluntario</span><input name="nombreVoluntario" type="text" placeholder="Anónimo" /></label>' +
      '<label class="field"><span>Observaciones</span><textarea name="observaciones" rows="3"></textarea></label>' +
      '<div class="form-actions"><button class="btn btn-primary" type="submit">Guardar</button><button class="btn btn-muted" type="button" data-modal-cancel>Cancelar</button><p class="form-status" aria-live="polite"></p></div></form>');
    const form = U.$('#form-movimiento');
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa los campos obligatorios.', 'error');
      const data = U.formData(form);
      const item = insumos.find(function (i) { return i.nombre === data.insumo; }) || {};
      const payload = Object.assign(data, { nombreLugar: centro.nombre, tipoLugar: centro.tipo, unidad: item.unidad || 'unidades', cantidad: U.numero(data.cantidad, 0) });
      try {
        U.setBusy(form, true);
        await Sheets.registrarMovimiento(payload);
        Cmp.closeModal();
        Cmp.toast('Movimiento registrado.', 'success');
        await Donaciones.load();
      } catch (err) {
        U.setFormStatus(form, 'No se pudo registrar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  }

  async function openHistorial(nombre) {
    Cmp.modal('Historial de movimientos', '<div id="historial-modal">' + Cmp.skeleton(2) + '</div>');
    const target = U.$('#historial-modal');
    const rows = await Sheets.getHistorial(nombre);
    target.innerHTML = rows.length ? rows.map(function (h) {
      return '<article class="entity-card"><div class="entity-top"><h3>' + U.escapeHTML(h.insumo) + '</h3>' + Cmp.badge(U.fechaRelativa(h.timestamp), '') + '</div>' +
        '<p class="entity-meta">' + U.escapeHTML(h.tipoMovimiento || h.tipo || 'Movimiento') + ' · ' + U.escapeHTML(h.cantidad) + ' ' + U.escapeHTML(h.unidad || '') + '</p>' +
        '<p class="entity-meta">Voluntario: ' + U.escapeHTML(h.voluntario || 'Anónimo') + '</p></article>';
    }).join('') : Cmp.empty('Sin historial', 'Todavía no hay movimientos registrados para este centro.');
  }

  function bindReportForm() {
    const panel = U.$('#report-panel');
    const form = U.$('#form-reportar-centro');
    U.$$('[data-open-report]').forEach(function (btn) { btn.addEventListener('click', function () { panel.classList.remove('hidden'); panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    U.$$('[data-close-report]').forEach(function (btn) { btn.addEventListener('click', function () { panel.classList.add('hidden'); }); });
    if (!form) return;
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa los campos obligatorios.', 'error');
      const data = U.formData(form);
      data.cantidadNecesaria = U.numero(data.cantidadNecesaria, 0);
      try {
        U.setBusy(form, true);
        await Sheets.registrarCentro(data);
        U.setFormStatus(form, 'Reporte guardado.', 'success');
        Cmp.toast('Reporte guardado.', 'success');
        form.reset();
        await Donaciones.load();
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  }

  Donaciones.load = async function () {
    const grid = U.$('#centros-grid');
    if (grid) grid.innerHTML = Cmp.skeleton(3);
    Donaciones.state.centros = await Sheets.listCentros();
    renderCategorias();
    Donaciones.render();
  };

  Donaciones.init = function () {
    bindReportForm();
    U.$$('.segmented-btn[data-centro-tipo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Donaciones.state.tipo = btn.dataset.centroTipo;
        U.$$('.segmented-btn[data-centro-tipo]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        Donaciones.render();
      });
    });
    const search = U.$('#centro-busqueda');
    if (search) search.addEventListener('input', U.debounce(function () { Donaciones.state.busqueda = search.value; Donaciones.render(); }, 180));
    const category = U.$('#centro-categoria');
    if (category) category.addEventListener('change', function () { Donaciones.state.categoria = category.value; Donaciones.render(); });
    const grid = U.$('#centros-grid');
    if (grid) grid.addEventListener('click', function (ev) {
      const mov = ev.target.closest('[data-movimiento]');
      const hist = ev.target.closest('[data-historial]');
      if (mov) openMovimiento(mov.dataset.movimiento);
      if (hist) openHistorial(hist.dataset.historial);
    });
  };

  App.Donaciones = Donaciones;
})(window.Humanitaria);
