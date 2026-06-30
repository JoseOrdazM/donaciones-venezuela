# Respuesta Humanitaria Venezuela

Plataforma ciudadana de respuesta ante emergencias para coordinar busqueda familiar, centros de ayuda, donaciones, voluntariado, rescatistas y transporte solidario en Venezuela.

La app es estatica y no usa framework, bundler ni dependencias de Node. La fuente principal de datos es Google Sheets mediante Google Apps Script.

## Funcionalidades

- Portada institucional con estadisticas dinamicas.
- Busqueda de familiares por nombre o cedula.
- Centros de ayuda, hospitales, refugios y necesidades por insumo.
- Registro de movimientos de suministros.
- Registro, listado, busqueda, filtro y actualizacion de voluntarios.
- Registro, listado, busqueda, filtro y actualizacion de rescatistas.
- Ranking de motorizados/transportistas, trayectos y donaciones.
- Secciones de como ayudar, necesidades urgentes y mapa preparado para Leaflet.
- Modo demo con datos locales si Apps Script aun no esta configurado.

## Fuente de datos

Spreadsheet principal:

```text
1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco
```

Hojas esperadas:

- `centros_necesidades`
- `motorizados`
- `trayectos`
- `historial_movimientos`
- `donaciones_motorizados`
- `voluntarios`
- `rescatistas`
- `personas_registradas`
- `necesidades_urgentes`

La comunicacion del frontend con datos esta centralizada en `src/services/sheets.js`. Los modulos de UI no deben llamar `fetch` directamente.

## Configuracion

1. Copia `apps-script/codigo.gs` en Google Apps Script.
2. Despliega como Web App con:
   - Ejecutar como: `Yo`
   - Acceso: `Cualquier usuario`
3. Copia la URL `/exec`.
4. Reemplaza `appsScriptUrl` en `src/config.js`.
5. Sube el proyecto a Vercel o a cualquier hosting estatico.

Mientras `appsScriptUrl` mantenga el placeholder, la app corre en modo demo usando `data/ejemplo.json` y cache local.

## Desarrollo local

Abrir directamente:

```text
file:///ruta/al/proyecto/index.html
```

O servir por HTTP para probar carga de JSON local:

```bash
python3 -m http.server 8000
```

Luego abrir:

```text
http://localhost:8000
```

## Estructura

```text
/
├── index.html
├── apps-script/codigo.gs
├── data/
├── src/
│   ├── app.js
│   ├── config.js
│   ├── services/sheets.js
│   ├── utils/dom.js
│   ├── ui/components.js
│   ├── modules/
│   └── styles/app.css
├── README-ARQUITECTURA.md
├── vercel.json
├── robots.txt
└── sitemap.xml
```

## Documentacion tecnica

Ver `README-ARQUITECTURA.md` para:

- Arquitectura completa.
- Flujo de datos.
- Esquema de hojas.
- Endpoints de Apps Script.
- Como agregar hojas y modulos.
- Reglas de mantenimiento y seguridad.

## Despliegue

`git push origin main` activa el redeploy automatico en Vercel si el repositorio esta conectado.

Al cambiar `apps-script/codigo.gs`, crea una nueva version dentro de la misma implementacion de Apps Script para conservar la URL `/exec`.
