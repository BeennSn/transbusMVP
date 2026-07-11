# TransBus (busmvp) — Contexto completo del proyecto

## Descripción general

App web **mobile-first** para seguimiento colaborativo de buses en **Trujillo, Perú**. Los usuarios reportan cuando se suben a un bus y ven en tiempo real la ubicación estimada gracias a los reportes de la comunidad.

## Stack técnico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2.6 | UI |
| Vite | 8.0.x | Build tool |
| Tailwind CSS | 4.3.1 | Estilos (via `@tailwindcss/vite`) — la mayoría de componentes usan `style={{}}` inline en vez de clases |
| Firebase | 12.15 | Auth (Google) + Firestore |
| Leaflet / react-leaflet | 1.9.4 / 5.0.0 | Mapas interactivos |
| React Router DOM | 7.18.0 | Routing SPA |
| @tabler/icons-react | 3.44.0 | Iconos |
| ESLint | 10.3.0 | Linting (flat config, `react-hooks` + `react-refresh`) |
| @vitejs/plugin-react | 6.0.1 | React Refresh |

**Vitest** para tests unitarios de funciones puras (`npm test`). Cobertura actual: `utils/geo.js`, `utils/rutasParser.js`, `getTierConfianza` (Mapa.jsx). Sin tests de componentes/integración todavía.

## Configuración del proyecto

- **Alias `@`** → `src/` (vite.config.js)
- **Mobile-first**: ancho máximo `430px`, centrado, padding-bottom `64px` por el BottomNav
- **Fuente**: Plus Jakarta Sans (Google Fonts)
- **Deploy**: Vercel con SPA rewrites (vercel.json) — las env vars de Firebase viven en el dashboard de Vercel, **no** en `.env` (ese es solo para `npm run dev` local y está gitignored)
- **Firebase**: proyecto `transbus-trujillo`. Reglas de seguridad en `firestore.rules`, índices en `firestore.indexes.json`, ambos referenciados desde `firebase.json`. Deploy manual: `firebase deploy --only firestore:rules`

## Estructura de archivos

```
src/
├── main.jsx                              # Entry point
├── App.jsx                               # AuthProvider → UbicacionProvider → AppRouter
├── index.css                             # Tailwind + design tokens + animaciones
│
├── router/
│   └── AppRouter.jsx                     # 5 rutas + BottomNav condicional (oculto en "/")
│
├── context/
│   ├── AuthContext.jsx                   # AuthProvider (componente) — el hook vive en hooks/useAuth.js
│   └── UbicacionContext.jsx              # UbicacionProvider (componente) — el hook vive en hooks/useUbicacion.js
│
├── services/
│   ├── firebase.js                       # initializeApp + auth + db + GoogleProvider
│   ├── authService.js                    # signInWithGoogle, signOut, onAuthChanged
│   ├── rutasService.js                   # getRutas(), getRutaById() (lee rutas.json, enriquece con paradas)
│   └── reportesService.js                # CRUD reportes + contadores + cooldown anti-spam en Firestore
│
├── hooks/
│   ├── useAuth.js                        # Crea AuthContext + hook useAuth (Fast Refresh: contexts fuera de archivos de componente)
│   ├── useUbicacion.js                   # Crea UbicacionContext + hook useUbicacion
│   ├── useReportesEnVivo.js              # onSnapshot reportes activos (15 min) de una ruta
│   └── useReportesUsuario.js             # onSnapshot reportes por uid + filtro "esta semana"
│
├── utils/
│   ├── rutasParser.js                    # Parsea recorrido string → array de paradas
│   └── geo.js                            # normalizarCoordenada, Haversine (distancia entre puntos / total)
│
├── data/
│   ├── rutas.json                        # 99 rutas: 2 curadas a mano (B1, H) + 97 desde GTFS Trujillo-OMUS
│   └── paraderos.json                    # 6 paraderos
│
├── pages/
│   ├── Bienvenida/Bienvenida.jsx         # Onboarding en "/", solo la primera vez (localStorage)
│   ├── Mapa/Mapa.jsx                     # Mapa + bottom sheet + selector de ruta con búsqueda + reporte + cooldown
│   ├── Rutas/Rutas.jsx                   # Lista de rutas estáticas con búsqueda
│   ├── Paraderos/Paraderos.jsx           # Lista de paraderos por seguridad
│   └── Perfil/Perfil.jsx                 # Login, stats, historial, logout
│
└── components/
    ├── common/
    │   ├── BottomNav.jsx                 # Nav inferior fija (4 tabs), oculta en Bienvenida
    │   └── LoginModal.jsx                # Modal login con Google
    ├── mapa/
    │   ├── MapaLeaflet.jsx               # MapContainer + TileLayer + Polyline + MarkerBus + MapController (fitBounds)
    │   ├── MarkerBus.jsx                 # Marcador animado con pulse-ring
    │   └── ModalReporteExito.jsx         # Modal post-reporte exitoso
    ├── rutas/
    │   ├── RutaCard.jsx                  # Tarjeta expandible con timeline + botones "ver todas las paradas" por sentido
    │   ├── ParadasModal.jsx              # Modal con lista completa de paradas de un sentido
    │   └── RecorridoMapa.jsx             # Mapa del recorrido con Polyline
    └── paraderos/
        └── ParaderoCard.jsx              # Tarjeta con indicador de seguridad

scripts/
└── importarGtfsOmus.js                   # Regenera src/data/rutas.json desde el GTFS de Trujillo-OMUS (ver sección abajo)
```

## Rutas (React Router)

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Bienvenida.jsx | Onboarding, solo la primera vez (`localStorage.transbus_bienvenida_vista`); luego redirige a `/mapa` |
| `/mapa` | Mapa.jsx | Mapa Leaflet + bottom sheet + selector de ruta con búsqueda + reporte en vivo + tier de confianza + cooldown |
| `/rutas` | Rutas.jsx | Lista de RutaCard expandibles con búsqueda por código/nombre/universidad |
| `/paraderos` | Paraderos.jsx | Lista de ParaderoCard ordenada por seguridad |
| `/perfil` | Perfil.jsx | Login/logout, stats, historial de reportes |

## Modelos de datos (Firestore)

### Colección `reportes`
```js
{
  rutaId:    string,
  uid:       string,
  estado:    string|null,   // "lleno" | "vacio" | "cambio_ruta" | null
  lat:       number|null,
  lng:       number|null,
  timestamp: serverTimestamp()
}
```
Inmutable (no update/delete). Lectura pública (necesaria para el contador "en vivo" sin login).

### Colección `contadores/{rutaId}`
```js
{ total: number }   // incrementado de a 1 vía increment(1)
```

### Colección `ultimosReportes/{uid}_{rutaId}`
```js
{ uid: string, rutaId: string, timestamp: serverTimestamp() }
```
Solo existe para hacer cumplir el **cooldown de 3 min** entre reportes del mismo usuario+ruta (`firestore.rules`, función `cooldownMin()`). No se lee desde la UI.

### Índices compuestos (`firestore.indexes.json`)
1. `reportes`: `rutaId ASC` + `timestamp DESC`
2. `reportes`: `uid ASC` + `timestamp DESC`

### `src/data/rutas.json` (99 rutas)
Dos orígenes distintos, mezclados en el mismo array:

- **2 rutas curadas a mano** (`b1-nuevo-california`, `h-huanchaco`): tienen `pasaje` (rango real en soles) y `frecuenciaMin` reales, cargados manualmente.
- **97 rutas generadas desde GTFS** (`scripts/importarGtfsOmus.js`, fuente [trufi-association/Trujillo-OMUS](https://github.com/trufi-association/Trujillo-OMUS), GPL-3.0, datos OpenStreetMap): `pasaje` y `frecuenciaMin` son `null` — el feed no trae tarifa ni horarios reales, solo un trip sintético por ruta. 5 de estas rutas tienen 2 `sentidos` (ida/vuelta con `route_id` distintos en el GTFS); el resto son circulares (`sentido: "circular"`).

Reejecutar el importador (`node scripts/importarGtfsOmus.js`) vuelve a descargar el feed y **sobreescribe** las 97 rutas GTFS, preservando las 2 curadas a mano.

Campos por ruta: `id, codigo, nombre, operador, tipo, pasaje, pasajeNota?, duracionMin, frecuenciaMin, color, sentido, origen, destino, totalParadas, sentidos[], paraderosDestacados[], nota`.
Cada `sentido`: `{ id, nombre, orden, origen, destino, recorrido (string), coordenadas }`.

### `src/data/paraderos.json` (6 paraderos)
```js
{ paraderos: [{ id, nombre, referencia, rutas: string[], nivelSeguridad: 1-5, notas, horarioPico }] }
```

## Flujo de autenticación

1. Firebase Auth con Google (`signInWithPopup`, `prompt: 'select_account'`)
2. `AuthProvider` (en `context/AuthContext.jsx`) envuelve la app en `App.jsx`; el hook `useAuth` vive en `hooks/useAuth.js` (separado del Provider por requisito de Fast Refresh de `eslint-plugin-react-refresh`)
3. Muestra "Cargando…" hasta que Firebase confirma estado inicial
4. `LoginModal` aparece al querer reportar sin sesión

## Flujo de reporte (Mapa.jsx)

1. Usuario toca **"Acabo de subir a este bus"**
2. Si no hay sesión → `LoginModal`
3. Si está en cooldown (< 3 min desde su último reporte en esa ruta) → botón deshabilitado mostrando cuenta regresiva, cooldown persistido en `localStorage` por ruta
4. Obtiene geolocalización (`enableHighAccuracy`, timeout 8s) del `UbicacionContext` — opcional, se guarda como `lat/lng` del reporte
5. `crearReporte()`: crea documento en `reportes`, incrementa `contadores/{rutaId}`, y registra `ultimosReportes/{uid}_{rutaId}` (cooldown server-side)
6. Si Firestore rechaza por cooldown activo (`permission-denied`), muestra mensaje específico en vez del genérico
7. Muestra `ModalReporteExito` con stats (cantidad activa, total histórico)

## Anti-abuso (`firestore.rules`)

- **Reportes**: solo el usuario autenticado puede crear a su propio nombre; inmutables; cooldown de 3 min por usuario+ruta vía `ultimosReportes`.
- **Contadores**: solo pueden incrementar de a 1 (nunca saltar ni decrementar).
- Todo lo demás: denegado por defecto (`match /{document=**} { allow read, write: if false }`).
- Limitación conocida: la creación de `reportes` y el incremento de `contadores` **no son atómicos** (dos escrituras separadas desde el cliente); un usuario autenticado podría en teoría incrementar el contador sin crear el reporte. Cerrar esto del todo requeriría una Cloud Function (plan Blaze).
- Nota de privacidad: los reportes son de lectura pública (`uid`, `lat/lng`, `estado` visibles vía SDK/REST de Firestore), necesario para el contador "en vivo" sin login.

## Sistema de tiers (confianza de estimación)

| Cantidad reportes (15 min) | Label | Tiempo estimado | Color |
|---|---|---|---|
| 0 | Sin reportes recientes | ~25 min | Gris `#64748b` |
| 1 | Estimación inicial | ~22 min | Ámbar `#b45309` |
| 2-3 | Estimación moderada | ~20 min | Ámbar `#b45309` |
| 4+ | Estimación de alta confianza | ~18 min | Verde `#15803d` |

## Diseño / Paleta de colores (Tailwind @theme)

- `--color-primary`: `#1d6fe8`
- `--color-primary-light`: `#e8f0fd`
- `--color-primary-dark`: `#1558c0`
- `--color-surface`: `#ffffff`
- `--color-bg`: `#f5f7fa`
- `--color-border`: `#e2e8f0`
- `--color-text-main`: `#0f172a`
- `--color-text-muted`: `#64748b`
- `--color-success`: `#16a34a`
- `--color-warning`: `#d97706`
- `--color-danger`: `#dc2626`
- `--font-sans`: `'Plus Jakarta Sans', system-ui, sans-serif`
- `--radius-card`: `14px`
- `--radius-pill`: `999px`

La mayoría de componentes (`Mapa.jsx`, `RutaCard.jsx`, `LoginModal.jsx`, etc.) usan `style={{}}` inline en vez de estas clases de Tailwind — deuda de consistencia conocida, no bloqueante.

## Componentes clave

### BottomNav.jsx
Fijo abajo, 4 tabs: Mapa, Rutas, Paraderos, Perfil. Oculto en `/` (Bienvenida). `max-width: 430px`, `height: 64px`.

### MapaLeaflet.jsx
`MapContainer` centrado en Trujillo `[-8.1116, -79.0288]`, `TileLayer` OSM, `Polyline` del sentido activo, `MarkerBus`, marcador "tú estás aquí", y `MapController` (hijo con `useMap()`) que llama `fitBounds` solo cuando cambia la ruta/sentido o aparece la ubicación por primera vez.

### MarkerBus.jsx
Icono SVG de bus con `divIcon` de Leaflet, animación CSS `pulse-ring`. Color por ruta (`rutaColor` > mapa fijo B1/H > azul default).

### rutasParser.js
`parseRecorridoToParadas(recorrido)`: split del string de recorrido por " - ", asigna `~1.5 min` por parada. `enrichRutasWithParadas(rutas)`: agrega `paradas[]` a cada sentido — usado por `ParadasModal` y por los chips de "paradas" en `Mapa.jsx` como fallback si `totalParadas` no está definido.

### geo.js
`normalizarCoordenada`: acepta tanto `{latitude, longitude}` (formato antiguo, rutas B1/H) como `[lat, lng]` (formato GTFS/OMUS). `calcularDistanciaEntreDosPuntos` / `calcularDistanciaTotal`: Haversine.

## Importador GTFS (`scripts/importarGtfsOmus.js`)

Descarga el feed GTFS de [trufi-association/Trujillo-OMUS](https://github.com/trufi-association/Trujillo-OMUS) (`agency.txt`, `routes.txt`, `trips.txt`, `stops.txt`, `stop_times.txt`, `shapes.txt`) y regenera `src/data/rutas.json`:

- Agrupa rutas por `route_short_name` (5 líneas tienen ida/vuelta como dos `route_id` separados → se combinan en una ruta con 2 `sentidos`).
- Simplifica cada polilínea a máx. 150 puntos (controla el peso del JSON — sin esto, el bundle final crecería varios MB).
- Deja `pasaje`/`frecuenciaMin` en `null` con nota "Por confirmar" en vez de inventar valores — el feed no trae esos datos.
- Preserva `b1-nuevo-california` y `h-huanchaco` sin tocarlos (curadas a mano, tienen datos reales que no están en el GTFS).

Uso: `node scripts/importarGtfsOmus.js`. Requiere conexión a internet (descarga de GitHub raw).

## Bugs conocidos / deuda técnica

1. **Bundle grande**: `dist/assets/index-*.js` pesa ~2.16 MB (478 KB gzip), principalmente por las 99 rutas con polilíneas bundleadas directamente vía `import` de JSON. Mitigación futura: lazy-load de rutas por demanda en vez de cargar las 99 de una.
2. **Reportes/contadores no atómicos** (ver sección Anti-abuso arriba).
3. **Tests parciales** — cubiertos `rutasParser.js`, `geo.js` y `getTierConfianza`; sin cobertura el importador GTFS, `reportesService.js`, ni componentes/hooks con Firestore.
4. **Estilos inline** en la mayoría de componentes en vez de las clases Tailwind ya definidas en `index.css`.

## Scripts disponibles

```bash
npm run dev      # Vite dev server
npm run build    # Vite build
npm run preview  # Vite preview
npm run lint     # ESLint (0 errores al momento de este documento)
npm test         # Vitest (tests unitarios de utils/ y getTierConfianza)
node scripts/importarGtfsOmus.js   # Regenera rutas.json desde el GTFS de Trujillo-OMUS
```

## Variables de entorno (`.env`, gitignored — no confundir con las de Vercel)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
