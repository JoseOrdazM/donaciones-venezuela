/**
 * Respuesta Humanitaria Venezuela - Backend Google Apps Script
 * Fuente central: Google Spreadsheet
 * ID: 1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco
 */

const SHEET_ID = "1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco";
const CENTROS_SHEET = "centros_necesidades";
const MOTORIZADOS_SHEET = "motorizados";
const TRAYECTOS_SHEET = "trayectos";
const HISTORIAL_SHEET = "historial_movimientos";
const DONACIONES_SHEET = "donaciones_motorizados";
const VOLUNTARIOS_SHEET = "voluntarios";
const RESCATISTAS_SHEET = "rescatistas";
const PERSONAS_SHEET = "personas_registradas";
const URGENTES_SHEET = "necesidades_urgentes";

const HEADERS = {
  centros: ["Tipo", "Nombre", "Ubicacion", "Telefono", "Insumo", "Categoria", "CantidadNecesaria", "CantidadRecibida", "Urgencia", "Unidad", "Actualizado"],
  motorizados: ["ID", "Nombre", "TipoVehiculo", "Telefono", "OperaEn", "Placa", "Estado", "FechaRegistro", "TotalTrayectos", "TotalKm", "AporteDonado", "Verificado", "UltimoTrayecto"],
  trayectos: ["Timestamp", "IDMotorizado", "NombreMotorizado", "Origen", "Destino", "KmRecorridos", "TiempoMinutos", "Insumo", "Cantidad", "Unidad", "Foto", "Notas", "Verificado"],
  historial: ["Timestamp", "TipoCentro", "Centro", "Insumo", "TipoMovimiento", "Cantidad", "Unidad", "Voluntario", "CantidadAcumulada", "Observaciones"],
  donaciones: ["Timestamp", "IDMotorizado", "NombreMotorizado", "Monto", "Tipo", "DonanteName", "Mensaje", "Ciudad"],
  voluntarios: ["ID", "Nombre", "Apellido", "Telefono", "Estado", "Ciudad", "Profesion", "Disponibilidad", "Tipo", "Observaciones", "FechaRegistro", "Actualizado"],
  rescatistas: ["ID", "Nombre", "Organizacion", "Telefono", "Especialidad", "Estado", "Ciudad", "Disponibilidad", "Observaciones", "FechaRegistro", "Actualizado"],
  personas: ["ID", "Nombre", "Cedula", "Estado", "Ubicacion", "Fuente", "Actualizado", "Notas"],
  urgentes: ["Categoria", "Prioridad", "CantidadRequerida", "Unidad", "Cubierto"]
};

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const accion = params.accion || "dashboard";

    if (accion === "centros") return jsonResponse({ centros: construirCentros(), lugares: construirCentros() });
    if (accion === "motorizados") return jsonResponse({ motorizados: construirMotorizados() });
    if (accion === "perfil_motorizado") return obtenerPerfilMotorizado(params.id);
    if (accion === "trayectos") return jsonResponse({ trayectos: construirTrayectos(params.motorizado || params.motorizadoId || null) });
    if (accion === "historial") return jsonResponse(construirHistorial(params.centro || params.lugar || null));
    if (accion === "voluntarios") return jsonResponse({ voluntarios: construirVoluntarios() });
    if (accion === "rescatistas") return jsonResponse({ rescatistas: construirRescatistas() });
    if (accion === "buscar_persona") return jsonResponse({ resultados: buscarPersonas(params.q || params.query || "") });
    if (accion === "estadisticas") return jsonResponse({ estadisticas: construirEstadisticas() });

    const data = construirDashboard();
    return jsonResponse(data);
  } catch (err) {
    return jsonResponse({ error: errorMessage(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const accion = payload.accion || "registrar_centro";

    if (accion === "registrar_centro" || accion === "agregar_lugar_insumo") return registrarCentro(payload);
    if (accion === "registrar_movimiento") return registrarMovimiento(payload);
    if (accion === "registrar_trayecto") return registrarTrayecto(payload);
    if (accion === "donar_motorizado") return donarMotorizado(payload);
    if (accion === "registrar_motorizado") return registrarMotorizado(payload);
    if (accion === "registrar_voluntario") return guardarVoluntario(payload, false);
    if (accion === "actualizar_voluntario") return guardarVoluntario(payload, true);
    if (accion === "registrar_rescatista") return guardarRescatista(payload, false);
    if (accion === "actualizar_rescatista") return guardarRescatista(payload, true);

    return jsonResponse({ error: "Accion no reconocida" });
  } catch (err) {
    return jsonResponse({ error: errorMessage(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj || {})).setMimeType(ContentService.MimeType.JSON);
}

function ss() { return SpreadsheetApp.openById(SHEET_ID); }
function sheet(name) { return ss().getSheetByName(name); }
function ensureSheet(name, headers) {
  let sh = sheet(name);
  if (!sh) sh = ss().insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function values(name) {
  const sh = sheet(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getDataRange().getValues().slice(1);
}
function text(v) { return String(v == null ? "" : v).trim(); }
function num(v, fallback) { const n = Number(v); return isNaN(n) ? (fallback || 0) : n; }
function norm(v) { return text(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function iso(v) { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? String(v) : d.toISOString(); }
function yes(v) { const n = norm(v); return v === true || n === "si" || n === "sí" || n === "true"; }
function errorMessage(err) { return String(err && err.message ? err.message : err); }
function nextId(prefix, existing) {
  const used = {};
  (existing || []).forEach(function (row) { if (row[0]) used[String(row[0])] = true; });
  let id = "";
  do { id = prefix + (Math.floor(Math.random() * 100000)).toString().padStart(5, "0"); } while (used[id]);
  return id;
}

function construirDashboard() {
  const data = {
    centros: construirCentros(),
    motorizados: construirMotorizados(),
    voluntarios: construirVoluntarios(),
    rescatistas: construirRescatistas(),
    personas: construirPersonas(),
    urgentes: construirUrgentes()
  };
  data.lugares = data.centros;
  data.estadisticas = construirEstadisticas(data);
  return data;
}

function construirEstadisticas(data) {
  data = data || construirDashboardSinStats();
  return {
    personasRegistradas: data.personas.length,
    centrosAyuda: data.centros.length,
    hospitales: data.centros.filter(function (c) { return norm(c.tipo).indexOf("hospital") === 0; }).length,
    voluntariosActivos: data.voluntarios.filter(function (v) { return norm(v.disponibilidad).indexOf("no disponible") !== 0; }).length,
    rescatistasRegistrados: data.rescatistas.length,
    motorizados: data.motorizados.length
  };
}

function construirDashboardSinStats() {
  return {
    centros: construirCentros(),
    motorizados: construirMotorizados(),
    voluntarios: construirVoluntarios(),
    rescatistas: construirRescatistas(),
    personas: construirPersonas(),
    urgentes: construirUrgentes()
  };
}

function construirCentros() {
  const rows = values(CENTROS_SHEET);
  const map = {};
  rows.forEach(function (row) {
    if (!row[1]) return;
    const tipo = text(row[0]);
    const nombre = text(row[1]);
    const key = norm(tipo + "|" + nombre);
    if (!map[key]) {
      map[key] = { tipo: tipo, nombre: nombre, ubicacion: text(row[2]), telefono: text(row[3]), necesita: [], cubiertos: [], tiene_disponible: [], no_acepta: [], actualizado: iso(row[10]) };
    }
    const necesaria = num(row[6], 0);
    const recibida = Math.max(0, num(row[7], 0));
    const finalRecibida = necesaria > 0 ? Math.min(recibida, necesaria) : recibida;
    const item = {
      nombre: text(row[4]), categoria: text(row[5]) || "Otros", cantidadNecesaria: necesaria,
      cantidadRecibida: finalRecibida, urgencia: text(row[8]) || "Normal", unidad: text(row[9]) || "unidades",
      porcentaje: necesaria > 0 ? Math.round((finalRecibida / necesaria) * 100) : 0,
      yaCubierto: necesaria > 0 && finalRecibida >= necesaria,
      coincidencias: []
    };
    if (!item.nombre) return;
    if (item.yaCubierto) map[key].cubiertos.push(item); else map[key].necesita.push(item);
    if (row[10]) map[key].actualizado = iso(row[10]);
  });
  return Object.keys(map).map(function (k) { return map[k]; });
}

function registrarCentro(payload) {
  if (!payload.tipo || !payload.nombre || !payload.insumo) throw new Error("Faltan campos obligatorios: tipo, nombre, insumo");
  const sh = ensureSheet(CENTROS_SHEET, HEADERS.centros);
  sh.appendRow([
    text(payload.tipo), text(payload.nombre), text(payload.ubicacion), text(payload.telefono), text(payload.insumo),
    text(payload.categoria) || "Otros", num(payload.cantidadNecesaria, 0), num(payload.cantidadRecibida, 0),
    text(payload.urgencia) || "Normal", text(payload.unidad) || "unidades", new Date()
  ]);
  return jsonResponse({ success: true, exito: true });
}

function registrarMovimiento(payload) {
  if (!payload.nombreLugar || !payload.insumo || !payload.tipoMovimiento) throw new Error("Faltan campos obligatorios");
  const cantidad = num(payload.cantidad, 0);
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");
  const centroSheet = ensureSheet(CENTROS_SHEET, HEADERS.centros);
  const histSheet = ensureSheet(HISTORIAL_SHEET, HEADERS.historial);
  const data = centroSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (norm(data[i][1]) === norm(payload.nombreLugar) && norm(data[i][4]) === norm(payload.insumo)) {
      const actual = num(data[i][7], 0);
      const necesaria = num(data[i][6], 0);
      let nueva = norm(payload.tipoMovimiento) === "salida" ? Math.max(0, actual - cantidad) : actual + cantidad;
      if (necesaria > 0) nueva = Math.min(nueva, necesaria);
      centroSheet.getRange(i + 1, 8).setValue(nueva);
      centroSheet.getRange(i + 1, 11).setValue(new Date());
      histSheet.appendRow([new Date(), text(payload.tipoLugar) || text(data[i][0]), text(payload.nombreLugar), text(payload.insumo), text(payload.tipoMovimiento), cantidad, text(payload.unidad) || text(data[i][9]) || "unidades", text(payload.nombreVoluntario) || "Anonimo", nueva, text(payload.observaciones)]);
      return jsonResponse({ success: true, exito: true, nuevaCantidad: nueva });
    }
  }
  return jsonResponse({ error: "Insumo no encontrado" });
}

function construirHistorial(centro) {
  let rows = values(HISTORIAL_SHEET).filter(function (row) { return !centro || norm(row[2]) === norm(centro); });
  rows.sort(function (a, b) { return new Date(b[0]) - new Date(a[0]); });
  const movimientos = rows.slice(0, centro ? 50 : 100).map(function (row) {
    return { timestamp: iso(row[0]), tipoCentro: row[1], tipoLugar: row[1], centro: row[2], lugar: row[2], insumo: row[3], tipo: row[4], tipoMovimiento: row[4], cantidad: row[5], unidad: row[6], voluntario: row[7], cantidadAcumulada: row[8], observaciones: row[9] || "" };
  });
  return { movimientos: movimientos, historial: movimientos, total: movimientos.length };
}

function construirMotorizados() {
  const motors = values(MOTORIZADOS_SHEET);
  const trayectos = values(TRAYECTOS_SHEET);
  const totals = {};
  trayectos.forEach(function (row) {
    const id = text(row[1]);
    if (!id) return;
    if (!totals[id]) totals[id] = { trayectos: 0, km: 0 };
    totals[id].trayectos += 1;
    totals[id].km += num(row[5], 0);
  });
  const out = motors.filter(function (row) { return row[0]; }).map(function (row) {
    const id = text(row[0]);
    const total = totals[id] || { trayectos: num(row[8], 0), km: num(row[9], 0) };
    const estado = text(row[6]) || "Activo";
    return { id: id, nombre: row[1], tipoVehiculo: row[2], telefono: row[3], operaEn: row[4], zonaOperacion: row[4], placa: row[5], estado: estado, activo: norm(estado) !== "inactivo", fechaRegistro: iso(row[7]), totalTrayectos: total.trayectos, totalKm: Math.round(total.km * 10) / 10, aporteDonado: num(row[10], 0), verificado: yes(row[11]), ultimoTrayecto: iso(row[12]) };
  });
  out.sort(function (a, b) { return b.totalKm - a.totalKm; });
  return out;
}

function obtenerPerfilMotorizado(id) {
  const motorizado = construirMotorizados().filter(function (m) { return String(m.id) === String(id); })[0];
  if (!motorizado) return jsonResponse({ error: "Motorizado no encontrado" });
  return jsonResponse({ motorizado: motorizado, trayectos: construirTrayectos(id), donaciones: construirDonacionesMotorizado(id) });
}

function registrarMotorizado(payload) {
  if (!payload.nombre || !payload.tipoVehiculo || !(payload.operaEn || payload.zonaOperacion)) throw new Error("Faltan campos obligatorios");
  const sh = ensureSheet(MOTORIZADOS_SHEET, HEADERS.motorizados);
  const id = nextId("MOTO", sh.getDataRange().getValues().slice(1));
  sh.appendRow([id, text(payload.nombre), text(payload.tipoVehiculo), text(payload.telefono), text(payload.operaEn || payload.zonaOperacion), text(payload.placa), "Activo", new Date(), 0, 0, 0, "No", null]);
  return jsonResponse({ success: true, exito: true, id: id });
}

function construirTrayectos(motorizado) {
  let rows = values(TRAYECTOS_SHEET).filter(function (row) { return !motorizado || String(row[1]) === String(motorizado); });
  rows.sort(function (a, b) { return new Date(b[0]) - new Date(a[0]); });
  return rows.map(function (row) {
    const insumo = text(row[7]);
    const amount = [text(row[8]), text(row[9])].filter(Boolean).join(" ");
    return { timestamp: iso(row[0]), idMotorizado: row[1], motorizadoId: row[1], nombreMotorizado: row[2], motorizadoNombre: row[2], origen: row[3], destino: row[4], km: row[5], kmRecorridos: row[5], minutos: row[6], tiempoMinutos: row[6], insumo: insumo, insumoTransportado: [insumo, amount].filter(Boolean).join(" · ") || "Varios", cantidad: row[8], unidad: row[9], foto: row[10], notas: row[11] || "", observaciones: row[11] || "", verificado: yes(row[12]) };
  });
}

function registrarTrayecto(payload) {
  const id = text(payload.idMotorizado || payload.motorizadoId);
  if (!id || !payload.origen || !payload.destino) throw new Error("Faltan campos obligatorios");
  const km = num(payload.km != null ? payload.km : payload.kmRecorridos, 0);
  if (km <= 0) throw new Error("Los km recorridos deben ser mayores a 0");
  const traj = ensureSheet(TRAYECTOS_SHEET, HEADERS.trayectos);
  const motor = ensureSheet(MOTORIZADOS_SHEET, HEADERS.motorizados);
  const data = motor.getDataRange().getValues();
  let rowIndex = -1;
  let name = text(payload.nombreMotorizado);
  let totalTrayectos = 0;
  let totalKm = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i + 1;
      name = name || text(data[i][1]);
      totalTrayectos = num(data[i][8], 0) + 1;
      totalKm = num(data[i][9], 0) + km;
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Motorizado no encontrado");
  const now = new Date();
  traj.appendRow([now, id, name, text(payload.origen), text(payload.destino), km, num(payload.tiempoMinutos || payload.minutos, 0) || "", text(payload.insumo || payload.insumoTransportado) || "Varios", payload.cantidad || "", text(payload.unidad), text(payload.foto), text(payload.notas || payload.observaciones), "No"]);
  motor.getRange(rowIndex, 9).setValue(totalTrayectos);
  motor.getRange(rowIndex, 10).setValue(totalKm);
  motor.getRange(rowIndex, 13).setValue(now);
  return jsonResponse({ success: true, exito: true, totalTrayectos: totalTrayectos, totalKm: Math.round(totalKm * 10) / 10 });
}

function donarMotorizado(payload) {
  const id = text(payload.idMotorizado || payload.motorizadoId);
  const monto = num(payload.monto, 0);
  if (!id || monto <= 0) throw new Error("Faltan campos obligatorios");
  const don = ensureSheet(DONACIONES_SHEET, HEADERS.donaciones);
  const motor = ensureSheet(MOTORIZADOS_SHEET, HEADERS.motorizados);
  const data = motor.getDataRange().getValues();
  let rowIndex = -1;
  let total = monto;
  let name = text(payload.nombreMotorizado);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i + 1;
      name = name || text(data[i][1]);
      total = num(data[i][10], 0) + monto;
      break;
    }
  }
  if (rowIndex === -1) return jsonResponse({ error: "Motorizado no encontrado" });
  don.appendRow([new Date(), id, name, monto, text(payload.tipo) || "Aporte", text(payload.donanteName) || "Anonimo", text(payload.mensaje), text(payload.ciudad)]);
  motor.getRange(rowIndex, 11).setValue(total);
  return jsonResponse({ success: true, exito: true, aporteDonado: total });
}

function construirDonacionesMotorizado(id) {
  return values(DONACIONES_SHEET).filter(function (row) { return String(row[1]) === String(id); }).map(function (row) {
    return { timestamp: iso(row[0]), idMotorizado: row[1], nombreMotorizado: row[2], monto: row[3], tipo: row[4], donante: row[5], mensaje: row[6], ciudad: row[7] };
  });
}

function construirVoluntarios() {
  return values(VOLUNTARIOS_SHEET).filter(function (row) { return row[0] || row[1]; }).map(function (row) {
    return { id: row[0], nombre: row[1], apellido: row[2], telefono: row[3], estado: row[4], ciudad: row[5], profesion: row[6], disponibilidad: row[7], tipo: row[8], observaciones: row[9], fechaRegistro: iso(row[10]), actualizado: iso(row[11]) };
  });
}

function guardarVoluntario(payload, update) {
  const sh = ensureSheet(VOLUNTARIOS_SHEET, HEADERS.voluntarios);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  let id = text(payload.id);
  if (update && id) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sh.getRange(i + 1, 2, 1, 11).setValues([[text(payload.nombre), text(payload.apellido), text(payload.telefono), text(payload.estado), text(payload.ciudad), text(payload.profesion), text(payload.disponibilidad), text(payload.tipo), text(payload.observaciones), data[i][10] || now, now]]);
        return jsonResponse({ success: true, exito: true, id: id });
      }
    }
  }
  id = id || nextId("VOL", data.slice(1));
  sh.appendRow([id, text(payload.nombre), text(payload.apellido), text(payload.telefono), text(payload.estado), text(payload.ciudad), text(payload.profesion), text(payload.disponibilidad), text(payload.tipo), text(payload.observaciones), now, now]);
  return jsonResponse({ success: true, exito: true, id: id });
}

function construirRescatistas() {
  return values(RESCATISTAS_SHEET).filter(function (row) { return row[0] || row[1]; }).map(function (row) {
    return { id: row[0], nombre: row[1], organizacion: row[2], telefono: row[3], especialidad: row[4], estado: row[5], ciudad: row[6], disponibilidad: row[7], observaciones: row[8], fechaRegistro: iso(row[9]), actualizado: iso(row[10]) };
  });
}

function guardarRescatista(payload, update) {
  const sh = ensureSheet(RESCATISTAS_SHEET, HEADERS.rescatistas);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  let id = text(payload.id);
  if (update && id) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sh.getRange(i + 1, 2, 1, 10).setValues([[text(payload.nombre), text(payload.organizacion), text(payload.telefono), text(payload.especialidad), text(payload.estado), text(payload.ciudad), text(payload.disponibilidad), text(payload.observaciones), data[i][9] || now, now]]);
        return jsonResponse({ success: true, exito: true, id: id });
      }
    }
  }
  id = id || nextId("RES", data.slice(1));
  sh.appendRow([id, text(payload.nombre), text(payload.organizacion), text(payload.telefono), text(payload.especialidad), text(payload.estado), text(payload.ciudad), text(payload.disponibilidad), text(payload.observaciones), now, now]);
  return jsonResponse({ success: true, exito: true, id: id });
}

function construirPersonas() {
  return values(PERSONAS_SHEET).filter(function (row) { return row[0] || row[1]; }).map(function (row) {
    return { id: row[0], nombre: row[1], cedula: row[2], estado: row[3], ubicacion: row[4], fuente: row[5], actualizado: iso(row[6]), notas: row[7] };
  });
}

function buscarPersonas(query) {
  const qn = norm(query);
  const qd = text(query).replace(/[^0-9]/g, "");
  if (!qn && !qd) return [];
  return construirPersonas().filter(function (p) {
    return norm(p.nombre).indexOf(qn) !== -1 || (qd && text(p.cedula).replace(/[^0-9]/g, "").indexOf(qd) !== -1);
  }).slice(0, 50);
}

function construirUrgentes() {
  const rows = values(URGENTES_SHEET);
  if (rows.length) {
    return rows.filter(function (row) { return row[0]; }).map(function (row) {
      return { categoria: row[0], prioridad: row[1], cantidadRequerida: num(row[2], 0), unidad: row[3], cubierto: num(row[4], 0) };
    });
  }
  const totals = {};
  construirCentros().forEach(function (centro) {
    (centro.necesita || []).forEach(function (item) {
      const key = item.categoria || item.nombre;
      if (!totals[key]) totals[key] = { categoria: key, prioridad: item.urgencia || "Normal", cantidadRequerida: 0, unidad: item.unidad || "unidades", cubierto: 0 };
      totals[key].cantidadRequerida += num(item.cantidadNecesaria, 0);
      totals[key].cubierto += num(item.cantidadRecibida, 0);
      if (norm(item.urgencia).indexOf("critico") === 0) totals[key].prioridad = "Alta";
    });
  });
  return Object.keys(totals).map(function (key) { return totals[key]; }).slice(0, 6);
}
