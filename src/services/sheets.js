window.Humanitaria = window.Humanitaria || {};
(function (App) {
  'use strict';

  const U = App.Utils;
  const C = App.Config;
  const Sheets = {};

  function isSandbox() {
    return !C.appsScriptUrl || C.sandboxPattern.test(C.appsScriptUrl);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || null));
  }

  function cacheSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* ignore */ }
  }

  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function fallback() {
    return clone(C.fallbackData || {});
  }

  function buildUrl(action, params) {
    const url = new URL(C.appsScriptUrl);
    if (action) url.searchParams.set('accion', action);
    Object.keys(params || {}).forEach(function (key) {
      if (params[key] != null && params[key] !== '') url.searchParams.set(key, params[key]);
    });
    return url.toString();
  }

  async function getJson(action, params) {
    if (isSandbox()) throw new Error('Modo demo');
    const resp = await fetch(buildUrl(action, params), { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  async function postJson(payload, optimistic) {
    if (isSandbox()) {
      await new Promise(function (resolve) { setTimeout(resolve, 180); });
      return Object.assign({ success: true, demo: true }, optimistic || {});
    }
    await fetch(C.appsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });
    return Object.assign({ success: true, opaque: true }, optimistic || {});
  }

  function computeStats(data) {
    const centros = data.centros || data.lugares || [];
    const motorizados = data.motorizados || [];
    const voluntarios = data.voluntarios || [];
    const rescatistas = data.rescatistas || [];
    const personas = data.personas || [];
    const hospitals = centros.filter(function (c) { return U.normalizar(c.tipo).indexOf('hospital') === 0; });
    return {
      personasRegistradas: personas.length,
      centrosAyuda: centros.length,
      hospitales: hospitals.length,
      voluntariosActivos: voluntarios.filter(function (v) { return U.normalizar(v.disponibilidad).indexOf('no disponible') === -1; }).length,
      rescatistasRegistrados: rescatistas.length,
      motorizados: motorizados.length
    };
  }

  Sheets.isSandbox = isSandbox;

  Sheets.loadDashboard = async function () {
    const key = C.cacheKeys.dashboard;
    try {
      let data;
      if (isSandbox() && location.protocol !== 'file:') {
        const resp = await fetch('data/ejemplo.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        data = await resp.json();
      } else if (isSandbox()) {
        data = fallback();
      } else {
        data = await getJson(null, null);
      }
      data.centros = data.centros || data.lugares || [];
      data.personas = data.personas || [];
      data.voluntarios = data.voluntarios || [];
      data.rescatistas = data.rescatistas || [];
      data.urgentes = data.urgentes || fallback().urgentes || [];
      data.estadisticas = data.estadisticas || computeStats(data);
      cacheSet(key, data);
      return data;
    } catch (err) {
      const cached = cacheGet(key);
      if (cached) return cached;
      const data = fallback();
      data.estadisticas = computeStats(data);
      return data;
    }
  };

  Sheets.listCentros = async function () {
    const key = C.cacheKeys.centros;
    try {
      const data = isSandbox() ? await Sheets.loadDashboard() : await getJson('centros');
      const centros = data.centros || data.lugares || [];
      cacheSet(key, centros);
      return centros;
    } catch (err) {
      return cacheGet(key) || fallback().centros || [];
    }
  };

  Sheets.listMotorizados = async function () {
    const key = C.cacheKeys.motorizados;
    try {
      const data = isSandbox() ? await Sheets.loadDashboard() : await getJson('motorizados');
      const items = data.motorizados || [];
      cacheSet(key, items);
      return items;
    } catch (err) {
      return cacheGet(key) || fallback().motorizados || [];
    }
  };

  Sheets.listVoluntarios = async function () {
    const key = C.cacheKeys.voluntarios;
    try {
      const data = isSandbox() ? await Sheets.loadDashboard() : await getJson('voluntarios');
      const items = data.voluntarios || [];
      cacheSet(key, items);
      return items;
    } catch (err) {
      return cacheGet(key) || fallback().voluntarios || [];
    }
  };

  Sheets.listRescatistas = async function () {
    const key = C.cacheKeys.rescatistas;
    try {
      const data = isSandbox() ? await Sheets.loadDashboard() : await getJson('rescatistas');
      const items = data.rescatistas || [];
      cacheSet(key, items);
      return items;
    } catch (err) {
      return cacheGet(key) || fallback().rescatistas || [];
    }
  };

  Sheets.getHistorial = function (centro) {
    return getJson('historial', { centro: centro }).then(function (data) {
      return data.movimientos || data.historial || [];
    }).catch(function () { return []; });
  };

  Sheets.getTrayectos = function (id) {
    const demoTrayectos = [
      { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), motorizadoId: 'MOTO001', motorizadoNombre: 'Carlos Rodríguez', origen: 'Centro San José', destino: 'Hospital Vargas', kmRecorridos: 18, tiempoMinutos: 42, insumoTransportado: 'Agua embotellada · 20 cajas' },
      { timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), motorizadoId: 'MOTO002', motorizadoNombre: 'María González', origen: 'Chacao', destino: 'Hospital El Algodonal', kmRecorridos: 22, tiempoMinutos: 55, insumoTransportado: 'Sueros fisiológicos' },
      { timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), motorizadoId: 'MOTO003', motorizadoNombre: 'Luis Herrera', origen: 'Catia', destino: 'La Pastora', kmRecorridos: 11, tiempoMinutos: 24, insumoTransportado: 'Pañales y agua' }
    ];
    if (isSandbox()) return Promise.resolve(demoTrayectos.filter(function (t) { return String(t.motorizadoId) === String(id); }));
    return getJson('trayectos', { motorizado: id }).then(function (data) { return data.trayectos || []; }).catch(function () { return []; });
  };

  Sheets.buscarPersona = async function (query) {
    const q = String(query || '').trim();
    if (!q) return { resultados: [], demo: isSandbox() };
    try {
      if (!isSandbox()) {
        const data = await getJson('buscar_persona', { q: q });
        if ((data.resultados || []).length) return { resultados: data.resultados, demo: false };
      }
    } catch (err) { /* fallback below */ }

    if (C.buscarWebhookUrl) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (C.buscarWebhookToken) headers.Authorization = 'Bearer ' + C.buscarWebhookToken;
        const resp = await fetch(C.buscarWebhookUrl, { method: 'POST', headers: headers, body: JSON.stringify({ query: q }) });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        return { resultados: data.resultados || [], demo: false };
      } catch (err) { /* fallback below */ }
    }

    const qn = U.normalizar(q);
    const qd = U.soloDigitos(q);
    let records = fallback().personas || [];
    if (!records.length && location.protocol !== 'file:') {
      try {
        const resp = await fetch('data/familiares-ejemplo.json', { cache: 'no-store' });
        const data = await resp.json();
        records = data.registros || [];
      } catch (err) { /* ignore */ }
    }
    return {
      resultados: records.filter(function (r) {
        return U.normalizar(r.nombre).includes(qn) || (qd && U.soloDigitos(r.cedula).includes(qd));
      }),
      demo: true
    };
  };

  Sheets.registrarCentro = function (payload) {
    return postJson(Object.assign({ accion: 'registrar_centro' }, payload));
  };

  Sheets.registrarMovimiento = function (payload) {
    return postJson(Object.assign({ accion: 'registrar_movimiento' }, payload));
  };

  Sheets.registrarMotorizado = function (payload) {
    return postJson(Object.assign({ accion: 'registrar_motorizado' }, payload), { id: 'MOTO' + String(Date.now()).slice(-4) });
  };

  Sheets.registrarTrayecto = function (payload) {
    return postJson(Object.assign({ accion: 'registrar_trayecto' }, payload));
  };

  Sheets.donarMotorizado = function (payload) {
    return postJson(Object.assign({ accion: 'donar_motorizado' }, payload));
  };

  Sheets.guardarVoluntario = function (payload) {
    const accion = payload.id ? 'actualizar_voluntario' : 'registrar_voluntario';
    return postJson(Object.assign({ accion: accion }, payload), { id: payload.id || ('VOL' + String(Date.now()).slice(-5)) });
  };

  Sheets.guardarRescatista = function (payload) {
    const accion = payload.id ? 'actualizar_rescatista' : 'registrar_rescatista';
    return postJson(Object.assign({ accion: accion }, payload), { id: payload.id || ('RES' + String(Date.now()).slice(-5)) });
  };

  App.Sheets = Sheets;
})(window.Humanitaria);
