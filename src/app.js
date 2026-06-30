window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const Cmp = App.Components;
  const Sheets = App.Sheets;

  function setRoute(route) {
    U.$$('.view').forEach(function (view) { view.classList.toggle('active', view.dataset.view === route); });
    U.$$('[data-route]').forEach(function (btn) {
      const active = btn.dataset.route === route;
      btn.classList.toggle('active', active);
      if (btn.classList.contains('nav-link') || btn.classList.contains('bottom-link')) {
        btn.setAttribute('aria-current', active ? 'page' : 'false');
      }
    });
    const view = U.$('[data-view="' + route + '"]');
    if (view) view.scrollIntoView({ block: 'start' });
    U.announce('Sección ' + route + ' abierta.');
  }

  function renderStats(stats) {
    const target = U.$('#stats-grid');
    if (!target) return;
    target.innerHTML = [
      Cmp.statCard('Personas registradas', stats.personasRegistradas || 0),
      Cmp.statCard('Centros de ayuda', stats.centrosAyuda || 0),
      Cmp.statCard('Hospitales', stats.hospitales || 0),
      Cmp.statCard('Voluntarios activos', stats.voluntariosActivos || 0),
      Cmp.statCard('Rescatistas', stats.rescatistasRegistrados || 0)
    ].join('');
  }

  function renderHelpActions() {
    const target = U.$('#help-actions');
    if (!target) return;
    const items = [
      { icon: '1', title: 'Donar suministros', text: 'Revisa necesidades por centro, contacta al responsable y registra entregas para mantener inventario actualizado.', cta: 'Ver centros', route: 'donaciones' },
      { icon: '2', title: 'Registrarse como voluntario', text: 'Suma capacidades médicas, logísticas, técnicas o de apoyo remoto para coordinar tareas verificadas.', cta: 'Registrarme', route: 'voluntarios' },
      { icon: '3', title: 'Reportar información verificada', text: 'Comparte datos de centros, hospitales, refugios o insumos con trazabilidad y contacto local.', cta: 'Reportar', route: 'donaciones' }
    ];
    target.innerHTML = items.map(Cmp.actionCard).join('');
  }

  function renderUrgentes(items) {
    const target = U.$('#urgent-grid');
    if (!target) return;
    target.innerHTML = (items || []).map(function (item) {
      const required = U.numero(item.cantidadRequerida, 0);
      const covered = U.numero(item.cubierto, 0);
      const pct = required ? Math.min(100, Math.round((covered / required) * 100)) : 0;
      return '<article class="entity-card urgent-card" data-priority="' + U.escapeHTML(item.prioridad || 'Normal') + '">' +
        '<div class="entity-top"><h3>' + U.escapeHTML(item.categoria) + '</h3>' + Cmp.badge(item.prioridad || 'Normal', item.prioridad === 'Alta' ? 'critical' : 'warning') + '</div>' +
        '<p class="entity-meta">Requerido: ' + required + ' ' + U.escapeHTML(item.unidad || 'unidades') + '</p>' +
        '<p class="entity-meta">Cubierto: ' + covered + ' ' + U.escapeHTML(item.unidad || 'unidades') + '</p>' +
        '<div class="progress" aria-label="' + pct + '% cubierto"><span style="--value:' + pct + '%"></span></div></article>';
    }).join('');
  }

  async function loadInitial() {
    renderStats({});
    renderHelpActions();
    const dashboard = await Sheets.loadDashboard();
    renderStats(dashboard.estadisticas || {});
    renderUrgentes(dashboard.urgentes || []);
    await Promise.all([
      App.Donaciones.load(),
      App.Motorizados.load(),
      App.Voluntarios.load(),
      App.Rescatistas.load()
    ]);
    if (Sheets.isSandbox()) {
      Cmp.toast('Modo demo: conecta la URL /exec de Apps Script para datos en vivo.', '');
    }
  }

  function initNavigation() {
    document.addEventListener('click', function (ev) {
      const trigger = ev.target.closest('[data-route]');
      if (!trigger) return;
      ev.preventDefault();
      setRoute(trigger.dataset.route);
    });
  }

  function initKeyboardTabs() {
    const navItems = U.$$('.desktop-nav .nav-link');
    navItems.forEach(function (btn, index) {
      btn.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        const next = ev.key === 'ArrowRight' ? index + 1 : index - 1;
        const target = navItems[(next + navItems.length) % navItems.length];
        target.focus();
      });
    });
  }

  function init() {
    initNavigation();
    initKeyboardTabs();
    App.Donaciones.init();
    App.Personas.init();
    App.Voluntarios.init();
    App.Rescatistas.init();
    App.Motorizados.init();
    loadInitial().catch(function (err) {
      Cmp.toast('No se pudieron cargar todos los datos: ' + err.message, 'error');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.Humanitaria);
