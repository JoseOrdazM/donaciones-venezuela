# Arquitectura técnica - Respuesta Humanitaria Venezuela

Documento técnico para operar y extender la plataforma ciudadana de respuesta humanitaria.

## Objetivo

La aplicación coordina búsqueda familiar, centros de ayuda, donaciones, voluntarios, rescatistas y transporte solidario durante emergencias en Venezuela. Es una aplicación estática, sin framework y sin paso de build, respaldada por Google Sheets mediante Google Apps Script.

## Principios de arquitectura

- **Fuente de datos centralizada:** el Spreadsheet `1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco` es el repositorio principal.
- **Capa única de acceso:** el frontend solo debe leer o escribir datos a través de `src/services/sheets.js`.
- **Vanilla JS:** no hay Node, bundler, TypeScript ni framework pesado.
- **Resiliencia:** si Apps Script falla o no está configurado, la app usa cache local y datos demo.
- **Accesibilidad:** navegación por teclado, labels, focus visible, live regions y estructura semántica.

## Estructura de carpetas

```text
/
├── index.html
├── apps-script/
│   └── codigo.gs
├── data/
│   ├── ejemplo.json
│   ├── familiares-ejemplo.json
│   └── lugares.csv
├── src/
│   ├── app.js
│   ├── config.js
│   ├── services/
│   │   └── sheets.js
│   ├── utils/
│   │   └── dom.js
│   ├── ui/
│   │   └── components.js
│   ├── modules/
│   │   ├── donaciones/
│   │   ├── hospitales/
│   │   ├── motorizados/
│   │   ├── personas/
│   │   ├── refugios/
│   │   ├── rescatistas/
│   │   └── voluntarios/
│   └── styles/
│       └── app.css
├── vercel.json
├── robots.txt
└── sitemap.xml
```

## Flujo de datos

1. `src/app.js` inicia la aplicación y pide el dashboard a `Sheets.loadDashboard()`.
2. `src/services/sheets.js` decide si usa Apps Script, cache local o `data/ejemplo.json`.
3. Los módulos consumen métodos del servicio:
   - `listCentros()`
   - `listMotorizados()`
   - `listVoluntarios()`
   - `listRescatistas()`
   - `buscarPersona(query)`
   - `registrarCentro(payload)`
   - `registrarMovimiento(payload)`
   - `registrarMotorizado(payload)`
   - `registrarTrayecto(payload)`
   - `donarMotorizado(payload)`
   - `guardarVoluntario(payload)`
   - `guardarRescatista(payload)`
4. Apps Script recibe `GET ?accion=...` o `POST { accion, ...payload }`.
5. Apps Script lee o escribe en Google Sheets.

## Hojas de Google Sheets

### `centros_necesidades`

| Columna | Campo |
|---|---|
| A | Tipo |
| B | Nombre |
| C | Ubicacion |
| D | Telefono |
| E | Insumo |
| F | Categoria |
| G | CantidadNecesaria |
| H | CantidadRecibida |
| I | Urgencia |
| J | Unidad |
| K | Actualizado |

Uso: centros, hospitales, refugios y puntos de distribución. Una fila representa una necesidad de un lugar.

### `motorizados`

| Columna | Campo |
|---|---|
| A | ID |
| B | Nombre |
| C | TipoVehiculo |
| D | Telefono |
| E | OperaEn |
| F | Placa |
| G | Estado |
| H | FechaRegistro |
| I | TotalTrayectos |
| J | TotalKm |
| K | AporteDonado |
| L | Verificado |
| M | UltimoTrayecto |

Uso: ranking y perfil operativo de transportistas.

### `trayectos`

| Columna | Campo |
|---|---|
| A | Timestamp |
| B | IDMotorizado |
| C | NombreMotorizado |
| D | Origen |
| E | Destino |
| F | KmRecorridos |
| G | TiempoMinutos |
| H | Insumo |
| I | Cantidad |
| J | Unidad |
| K | Foto |
| L | Notas |
| M | Verificado |

Uso: historial de traslados y cálculo de kilómetros.

### `historial_movimientos`

| Columna | Campo |
|---|---|
| A | Timestamp |
| B | TipoCentro |
| C | Centro |
| D | Insumo |
| E | TipoMovimiento |
| F | Cantidad |
| G | Unidad |
| H | Voluntario |
| I | CantidadAcumulada |
| J | Observaciones |

Uso: auditoría de entradas y salidas de suministros.

### `donaciones_motorizados`

| Columna | Campo |
|---|---|
| A | Timestamp |
| B | IDMotorizado |
| C | NombreMotorizado |
| D | Monto |
| E | Tipo |
| F | DonanteName |
| G | Mensaje |
| H | Ciudad |

Uso: aportes directos registrados a transportistas.

### `voluntarios`

| Columna | Campo |
|---|---|
| A | ID |
| B | Nombre |
| C | Apellido |
| D | Telefono |
| E | Estado |
| F | Ciudad |
| G | Profesion |
| H | Disponibilidad |
| I | Tipo |
| J | Observaciones |
| K | FechaRegistro |
| L | Actualizado |

Uso: registro, listado, filtro y actualización de voluntarios.

### `rescatistas`

| Columna | Campo |
|---|---|
| A | ID |
| B | Nombre |
| C | Organizacion |
| D | Telefono |
| E | Especialidad |
| F | Estado |
| G | Ciudad |
| H | Disponibilidad |
| I | Observaciones |
| J | FechaRegistro |
| K | Actualizado |

Uso: directorio operativo de rescatistas y equipos.

### `personas_registradas`

| Columna | Campo |
|---|---|
| A | ID |
| B | Nombre |
| C | Cedula |
| D | Estado |
| E | Ubicacion |
| F | Fuente |
| G | Actualizado |
| H | Notas |

Uso: fuente principal para búsqueda familiar. Si no hay datos o no hay hoja, el frontend conserva el fallback N8N/mock.

### `necesidades_urgentes`

| Columna | Campo |
|---|---|
| A | Categoria |
| B | Prioridad |
| C | CantidadRequerida |
| D | Unidad |
| E | Cubierto |

Uso: prioridades operativas del hero. Si la hoja no existe, Apps Script deriva prioridades desde `centros_necesidades`.

## Endpoints de Apps Script

### GET

```text
?accion=dashboard
?accion=centros
?accion=motorizados
?accion=perfil_motorizado&id=MOTO001
?accion=trayectos&motorizado=MOTO001
?accion=historial&centro=Nombre
?accion=voluntarios
?accion=rescatistas
?accion=buscar_persona&q=texto
?accion=estadisticas
```

### POST

Todos los `POST` reciben JSON con `accion`:

```json
{ "accion": "registrar_voluntario", "nombre": "Ana", "apellido": "Pérez" }
```

Acciones soportadas:

- `registrar_centro`
- `registrar_movimiento`
- `registrar_motorizado`
- `registrar_trayecto`
- `donar_motorizado`
- `registrar_voluntario`
- `actualizar_voluntario`
- `registrar_rescatista`
- `actualizar_rescatista`

## Despliegue

1. Copia `apps-script/codigo.gs` en el proyecto de Apps Script conectado al Sheet.
2. Despliega como Web App:
   - Ejecutar como: `Yo`
   - Acceso: `Cualquier usuario`
3. Copia la URL `/exec`.
4. Reemplaza `appsScriptUrl` en `src/config.js`.
5. Publica en Vercel o cualquier hosting estático.

## Cómo agregar una nueva hoja

1. Agrega una constante en `apps-script/codigo.gs`.
2. Agrega encabezados en `HEADERS`.
3. Crea funciones `construirX`, `guardarX` o `actualizarX`.
4. Expón la acción en `doGet` o `doPost`.
5. Agrega un método en `src/services/sheets.js`.
6. Consume ese método desde un módulo en `src/modules/`.

## Cómo agregar un nuevo módulo de UI

1. Crea `src/modules/nombre/nombre.js`.
2. Usa `window.Humanitaria` como namespace.
3. No llames `fetch` directamente; usa `App.Sheets`.
4. Exporta al namespace: `App.NombreModulo = { init, load, render }`.
5. Carga el script en `index.html` antes de `src/app.js`.
6. Inicializa desde `src/app.js`.

## Mantenimiento futuro

La arquitectura queda preparada para:

- Leaflet y coordenadas por centro.
- Geolocalización y orden por cercanía.
- Panel administrativo.
- Exportación CSV desde Apps Script.
- Notificaciones y alertas.
- Dashboard analítico.
- Proxy de N8N si el webhook requiere secretos.

## Reglas de seguridad

- No hardcodear tokens privados en `src/config.js`; el frontend es público.
- Si N8N requiere secreto, usar Apps Script como proxy o un backend intermedio.
- Sanitizar todo dato antes de renderizar con `escapeHTML`.
- Mantener CSP actualizada en `vercel.json` si se agregan dominios externos.
