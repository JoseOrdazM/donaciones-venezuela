# CLAUDE.md

Guia para agentes que trabajen en este repositorio.

## Principios del proyecto

- App estatica vanilla: sin framework, sin bundler y sin dependencias de Node.
- La fuente principal de datos es el Spreadsheet `1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco`.
- El backend es Google Apps Script en `apps-script/codigo.gs`.
- El frontend solo debe leer o escribir datos mediante `src/services/sheets.js`.
- Todo dato externo que se renderice con `innerHTML` debe pasar por `App.Utils.escapeHTML`.
- No hardcodear secretos en archivos publicos. Si N8N o cualquier API requiere token, usar proxy backend.

## Arquitectura actual

```text
index.html                 Shell semantico y vistas principales
src/config.js              Configuracion publica y datos fallback
src/services/sheets.js     Capa unica de acceso a datos
src/utils/dom.js           Helpers DOM, sanitizacion, formularios y fechas
src/ui/components.js       Componentes reutilizables: cards, badges, modal, toast
src/modules/*              Modulos de dominio
src/styles/app.css         Sistema visual responsive
apps-script/codigo.gs      API de Google Apps Script para Sheets
```

Modulos principales:

- `donaciones`: centros, hospitales, refugios, necesidades y movimientos.
- `personas`: busqueda familiar.
- `voluntarios`: crear, listar, buscar, filtrar y actualizar voluntarios.
- `rescatistas`: crear, listar, buscar, filtrar y actualizar rescatistas.
- `motorizados`: registro, ranking, trayectos y donaciones.
- `hospitales` y `refugios`: helpers de dominio para tarjetas especializadas.

## Google Sheets

Hojas soportadas:

- `centros_necesidades`
- `motorizados`
- `trayectos`
- `historial_movimientos`
- `donaciones_motorizados`
- `voluntarios`
- `rescatistas`
- `personas_registradas`
- `necesidades_urgentes`

Los encabezados y acciones estan documentados en `README-ARQUITECTURA.md`.

## Verificacion

No hay test runner. Usar checks puntuales:

```bash
node --check src/app.js
node --check src/services/sheets.js
node --check src/modules/donaciones/donaciones.js
python3 -m json.tool data/ejemplo.json
python3 -m json.tool data/familiares-ejemplo.json
git diff --check
```

Para prueba visual headless:

```bash
/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome --headless --no-sandbox --window-size=1440,1100 --virtual-time-budget=9000 --screenshot=/tmp/donaciones-home.png file:///root/donaciones-venezuela/index.html
```

## Gotchas

- Apps Script `POST` usa `mode: no-cors`, por lo que la respuesta del navegador es opaca aunque la escritura ocurra.
- Si se agrega un dominio externo, actualizar `vercel.json` CSP.
- Para actualizar Apps Script, usar nueva version dentro de la misma implementacion. No crear otra implementacion salvo que tambien se actualice `src/config.js`.
- `src/config.js` es publico. Los placeholders deben quedar vacios o demo; nunca secrets reales.
