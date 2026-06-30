window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;
  const Motorizados = { state: { items: [], tipo: 'todos' } };

  function normalize(item) {
    return Object.assign({}, item, {
      zonaOperacion: item.zonaOperacion || item.operaEn || '',
      operaEn: item.operaEn || item.zonaOperacion || '',
      totalTrayectos: U.numero(item.totalTrayectos, 0),
      totalKm: U.numero(item.totalKm, 0),
      aporteDonado: U.numero(item.aporteDonado, 0),
      estado: item.estado || (item.activo === false ? 'Inactivo' : 'Activo')
    });
  }

  function filtered() {
    return Motorizados.state.items.filter(function (item) {
      if (Motorizados.state.tipo === 'todos') return true;
      return U.normalizar(item.tipoVehiculo).indexOf(U.normalizar(Motorizados.state.tipo)) === 0;
    }).sort(function (a, b) { return b.totalKm - a.totalKm; });
  }

  function card(item) {
    const phone = U.soloDigitos(item.telefono);
    return '<article class="entity-card"><div class="entity-top"><div><div class="badge-row">' + Cmp.badge(item.tipoVehiculo || 'Vehículo', 'blue') + Cmp.badge(item.estado || 'Activo', U.normalizar(item.estado).indexOf('inactivo') === 0 ? '' : 'success') + (item.verificado ? Cmp.badge('Verificado', 'success') : '') + '</div><h3>' + U.escapeHTML(item.nombre) + '</h3></div>' + Cmp.badge('#' + U.escapeHTML(item.id || ''), '') + '</div>' +
      '<p class="entity-meta">Opera en: ' + U.escapeHTML(item.zonaOperacion || 'Por confirmar') + '</p>' +
      (item.placa ? '<p class="entity-meta">Placa: ' + U.escapeHTML(item.placa) + '</p>' : '') +
      '<div class="mini-stats-grid">' +
      '<div class="stat-card"><span>Trayectos</span><strong>' + item.totalTrayectos + '</strong></div>' +
      '<div class="stat-card"><span>Kilómetros</span><strong>' + item.totalKm + '</strong></div>' +
      '<div class="stat-card"><span>Aportes</span><strong>' + item.aporteDonado + '</strong></div></div>' +
      '<p class="entity-meta">Último trayecto: ' + U.escapeHTML(U.fechaRelativa(item.ultimoTrayecto)) + '</p>' +
      '<div class="entity-actions"><button class="btn btn-primary" type="button" data-trayectos="' + U.escapeHTML(item.id) + '">Trayectos</button>' +
      '<button class="btn btn-secondary" type="button" data-donar-moto="' + U.escapeHTML(item.id) + '">Donar</button>' +
      (phone ? '<a class="btn btn-muted" href="https://wa.me/' + phone + '" target="_blank" rel="noopener">WhatsApp</a>' : '') + '</div></article>';
  }

  Motorizados.render = function () {
    const grid = U.$('#motorizados-grid');
    const count = U.$('#motorizados-conteo');
    if (!grid) return;
    const rows = filtered();
    if (count) count.textContent = 'Mostrando ' + rows.length + ' de ' + Motorizados.state.items.length + ' transportistas';
    grid.innerHTML = rows.length ? rows.map(card).join('') : Cmp.empty('Sin transportistas', 'Registra el primer transportista o cambia el filtro.');
  };

  Motorizados.load = async function () {
    const grid = U.$('#motorizados-grid');
    if (grid) grid.innerHTML = Cmp.skeleton(2);
    Motorizados.state.items = (await Sheets.listMotorizados()).map(normalize);
    Motorizados.render();
  };

  function find(id) {
    return Motorizados.state.items.find(function (item) { return String(item.id) === String(id); });
  }

  async function openTrayectos(id) {
    const moto = find(id);
    if (!moto) return;
    Cmp.modal('Trayectos de ' + moto.nombre, '<div id="trayectos-modal">' + Cmp.skeleton(2) + '</div>');
    const target = U.$('#trayectos-modal');
    const rows = await Sheets.getTrayectos(id);
    target.innerHTML = (rows.length ? rows.map(function (t) {
      return '<article class="entity-card"><div class="entity-top"><h3>' + U.escapeHTML(t.origen) + ' → ' + U.escapeHTML(t.destino) + '</h3>' + Cmp.badge(U.fechaRelativa(t.timestamp), '') + '</div>' +
        '<p class="entity-meta">' + U.escapeHTML(t.kmRecorridos || t.km || 0) + ' km · ' + U.escapeHTML(t.tiempoMinutos || t.minutos || '—') + ' min</p>' +
        '<p class="entity-meta">Insumo: ' + U.escapeHTML(t.insumoTransportado || t.insumo || 'Varios') + '</p></article>';
    }).join('') : Cmp.empty('Sin trayectos', 'Aún no hay trayectos registrados.')) +
      '<form id="form-trayecto" class="form-stack" novalidate><h3>Registrar nuevo trayecto</h3>' +
      '<label class="field"><span>Origen</span><input name="origen" required /></label>' +
      '<label class="field"><span>Destino</span><input name="destino" required /></label>' +
      '<label class="field"><span>Kilómetros</span><input name="km" type="number" min="0.1" step="0.1" required /></label>' +
      '<label class="field"><span>Tiempo en minutos</span><input name="tiempoMinutos" type="number" min="1" step="1" /></label>' +
      '<label class="field"><span>Insumo</span><input name="insumo" /></label>' +
      '<label class="field"><span>Cantidad</span><input name="cantidad" type="number" min="0" step="1" /></label>' +
      '<label class="field"><span>Unidad</span><input name="unidad" /></label>' +
      '<label class="field"><span>Notas</span><textarea name="notas" rows="2"></textarea></label>' +
      '<div class="form-actions"><button class="btn btn-primary" type="submit">Guardar trayecto</button><p class="form-status" aria-live="polite"></p></div></form>';
    const form = U.$('#form-trayecto');
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa origen, destino y kilómetros.', 'error');
      const data = U.formData(form);
      data.idMotorizado = id;
      data.nombreMotorizado = moto.nombre;
      data.km = U.numero(data.km, 0);
      try {
        U.setBusy(form, true);
        await Sheets.registrarTrayecto(data);
        Cmp.toast('Trayecto registrado.', 'success');
        Cmp.closeModal();
        await Motorizados.load();
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  }

  function openDonacion(id) {
    const moto = find(id);
    if (!moto) return;
    Cmp.modal('Donar a ' + moto.nombre, '<form id="form-donar-mot" class="form-stack" novalidate>' +
      '<label class="field"><span>Monto o valor estimado</span><input name="monto" type="number" min="1" step="1" required /></label>' +
      '<label class="field"><span>Tipo</span><select name="tipo"><option>Pago móvil</option><option>Efectivo</option><option>Combustible</option><option>Repuesto</option><option>Otro</option></select></label>' +
      '<label class="field"><span>Donante</span><input name="donanteName" placeholder="Anónimo" /></label>' +
      '<label class="field"><span>Ciudad</span><input name="ciudad" /></label>' +
      '<label class="field"><span>Mensaje</span><textarea name="mensaje" rows="3"></textarea></label>' +
      '<div class="form-actions"><button class="btn btn-primary" type="submit">Registrar donación</button><button class="btn btn-muted" type="button" data-modal-cancel>Cancelar</button><p class="form-status" aria-live="polite"></p></div></form>');
    const form = U.$('#form-donar-mot');
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Indica un monto.', 'error');
      const data = U.formData(form);
      data.idMotorizado = id;
      data.nombreMotorizado = moto.nombre;
      data.monto = U.numero(data.monto, 0);
      try {
        U.setBusy(form, true);
        await Sheets.donarMotorizado(data);
        Cmp.toast('Donación registrada.', 'success');
        Cmp.closeModal();
        await Motorizados.load();
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
  }

  Motorizados.init = function () {
    U.$$('.segmented-btn[data-moto-tipo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Motorizados.state.tipo = btn.dataset.motoTipo;
        U.$$('.segmented-btn[data-moto-tipo]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        Motorizados.render();
      });
    });
    const form = U.$('#form-motorizado');
    if (form) form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (!U.validateRequired(form)) return U.setFormStatus(form, 'Completa los campos obligatorios.', 'error');
      const data = U.formData(form);
      try {
        U.setBusy(form, true);
        const res = await Sheets.registrarMotorizado(data);
        Motorizados.state.items.unshift(normalize(Object.assign({}, data, { id: res.id, estado: 'Activo', totalTrayectos: 0, totalKm: 0, aporteDonado: 0, fechaRegistro: new Date().toISOString() })));
        form.reset();
        Motorizados.render();
        Cmp.toast('Transportista registrado.', 'success');
      } catch (err) {
        U.setFormStatus(form, 'No se pudo guardar: ' + err.message, 'error');
      } finally { U.setBusy(form, false); }
    });
    const grid = U.$('#motorizados-grid');
    if (grid) grid.addEventListener('click', function (ev) {
      const tray = ev.target.closest('[data-trayectos]');
      const donar = ev.target.closest('[data-donar-moto]');
      if (tray) openTrayectos(tray.dataset.trayectos);
      if (donar) openDonacion(donar.dataset.donarMoto);
    });
  };

  App.Motorizados = Motorizados;
})(window.Humanitaria);
