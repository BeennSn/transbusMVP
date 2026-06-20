# TransBus (busmvp) — Contexto completo del proyecto

## Descripción general

App web **mobile-first** para seguimiento colaborativo de buses en **Trujillo, Perú**. Los usuarios reportan cuando se suben a un bus y ven en tiempo real la ubicación estimada gracias a los reportes de la comunidad.

## Stack técnico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2.6 | UI |
| Vite | 8.0.12 | Build tool |
| Tailwind CSS | 4.3.1 | Estilos (via `@tailwindcss/vite`) |
| Firebase | 12.15 | Auth + Firestore |
| Leaflet / react-leaflet | 1.9.4 / 5.0.0 | Mapas interactivos |
| React Router DOM | 7.18.0 | Routing SPA |
| @tabler/icons-react | 3.44.0 | Iconos |
| ESLint | 10.3.0 | Linting |
| @vitejs/plugin-react | 6.0.1 | React Refresh |

## Configuración del proyecto

- **Alias `@`** → `src/` (vite.config.js)
- **Mobile-first**: ancho máximo `430px`, centrado, padding-bottom `64px` por el BottomNav
- **Fuente**: Plus Jakarta Sans (Google Fonts)
- **Deploy**: Vercel con SPA rewrites (vercel.json)

## Estructura de archivos

```
src/
├── main.jsx                              # Entry point
├── App.jsx                               # AuthProvider → AppRouter
├── index.css                             # Tailwind + design tokens + animaciones
│
├── router/
│   └── AppRouter.jsx                     # 4 rutas + BottomNav global
│
├── context/
│   └── AuthContext.jsx                   # Provider + useAuth hook
│
├── services/
│   ├── firebase.js                       # initializeApp + auth + db + GoogleProvider
│   ├── authService.js                    # signInWithGoogle, signOut, onAuthChanged
│   ├── rutasService.js                   # getRutas(), getRutaById() (desde JSON)
│   └── reportesService.js                # CRUD reportes en Firestore
│
├── hooks/
│   ├── useAuth.js                        # Re-export de AuthContext
│   ├── useReportesEnVivo.js              # onSnapshot reportes activos (15 min)
│   └── useReportesUsuario.js             # onSnapshot reportes por uid + filtro semanal
│
├── utils/
│   └── rutasParser.js                    # Parsea recorrido string → array de paradas
│
├── data/
│   ├── rutas.json                        # 2 rutas: B1 y H
│   └── paraderos.json                    # 6 paraderos
│
├── pages/
│   ├── Mapa/Mapa.jsx                     # Mapa + bottom sheet + reporte
│   ├── Rutas/Rutas.jsx                   # Lista de rutas estáticas
│   ├── Paraderos/Paraderos.jsx           # Lista de paraderos por seguridad
│   └── Perfil/Perfil.jsx                 # Login, stats, historial, logout
│
└── components/
    ├── common/
    │   ├── BottomNav.jsx                 # Nav inferior fija (4 tabs)
    │   └── LoginModal.jsx                # Modal login con Google
    ├── mapa/
    │   ├── MapaLeaflet.jsx               # MapContainer + TileLayer + MarkerBus
    │   ├── MarkerBus.jsx                 # Marcador animado con pulse-ring
    │   └── ModalReporteExito.jsx         # Modal post-reporte exitoso
    ├── rutas/
    │   ├── RutaCard.jsx                  # Tarjeta expandible con timeline
    │   ├── ParadasModal.jsx              # Modal con lista completa de paradas
    │   └── RecorridoMapa.jsx             # Mapa del recorrido con Polyline
    └── paraderos/
        └── ParaderoCard.jsx              # Tarjeta con indicador de seguridad
```

## Rutas (React Router)

| Ruta | Página | Descripción |
|---|---|---|
| `/` | — | Redirige a `/mapa` |
| `/mapa` | Mapa.jsx | Mapa Leaflet + bottom sheet + selector de ruta + reporte en vivo + tier de confianza |
| `/rutas` | Rutas.jsx | Lista de RutaCard expandibles |
| `/paraderos` | Paraderos.jsx | Lista de ParaderoCard ordenada por seguridad |
| `/perfil` | Perfil.jsx | Login/logout, stats, historial de reportes |

## Modelos de datos

### Firestore — Colección `reportes`
```js
{
  rutaId:    string,      // ej. "b1-nuevo-california"
  uid:       string,      // Firebase Auth UID
  estado:    string|null, // "lleno" | "vacio" | "cambio_ruta" | null
  lat:       number|null,
  lng:       number|null,
  timestamp: serverTimestamp()
}
```

### Firestore — Colección `contadores`
Documento por `rutaId`:
```js
{ total: number }  // se incrementa con increment(1)
```

### Firestore — Índices compuestos (firestore.indexes.json)
1. `reportes`: `rutaId ASC` + `timestamp DESC`
2. `reportes`: `uid ASC` + `timestamp DESC`

### JSON estático — `src/data/rutas.json`
```js
{
  rutas: [{
    id: string, codigo: string, nombre: string, operador: string,
    tipo: string, pasaje: number|string, duracionMin: number, frecuenciaMin: number,
    horarios: string, intervaloFrecuencia: string,
    sentido: string, origen: string, destino: string, totalParadas: number,
    sentidos: [{ id, nombre, orden, origen, destino, recorrido (string), coordenadas }],
    paraderosDestacados: [{ orden, nombre, minutosDesdeInicio }],
    nota: string
  }]
}
```

Actualmente **2 rutas**:
- **B1**: "La Esperanza / Víctor Larco Herrera" — Micro, pasaje S/1.00-4.50, 45 min, c/7 min
- **H**: "Huanchaco / Trujillo" — Micro, pasaje S/1.00-4.00, 50 min, c/7 min

### JSON estático — `src/data/paraderos.json`
```js
{
  paraderos: [{
    id: string, nombre: string, referencia: string,
    rutas: string[], nivelSeguridad: 1-5, notas: string, horarioPico: string
  }]
}
```

Actualmente **6 paraderos**:
| Paradero | Rutas | Seguridad |
|---|---|---|
| Óvalo Grau | B1, H | 5/5 |
| Mall Aventura Plaza | B1 | 5/5 |
| Av. América Norte | B1 | 4/5 |
| Huanchaco Centro | H | 4/5 |
| Plaza Mayor de Trujillo | B1, H | 5/5 |
| Av. Víctor Larco Herrera | B1 | 3/5 |

## Flujo de autenticación

1. Firebase Auth con Google (`signInWithPopup`, `prompt: 'select_account'`)
2. `AuthProvider` envuelve toda la app en `App.jsx`
3. Muestra "Cargando…" hasta que Firebase confirma estado inicial
4. `LoginModal` aparece al querer reportar sin sesión
5. Perfil muestra login CTA si no hay sesión

## Flujo de reporte (Mapa.jsx)

1. Usuario toca **"Acabo de subir a este bus"**
2. Si no hay sesión → `LoginModal`
3. Obtiene geolocalización (`enableHighAccuracy`, timeout 8s) — opcional
4. Crea documento en `reportes` con `serverTimestamp()`
5. Incrementa contador atómico en `contadores/{rutaId}` con `increment(1)`
6. Muestra `ModalReporteExito` con stats (cantidad activa, total histórico)

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

## Componentes clave

### BottomNav.jsx
- Fijo abajo, 4 tabs: Mapa, Rutas, Paraderos, Perfil
- Ancho `100%`, `max-width: 430px`, `height: 64px`
- NavLink con estilo activo (fondo azul claro + icono relleno)

### MapaLeaflet.jsx
- `MapContainer` con centro en Trujillo `[-8.1116, -79.0288]`
- `TileLayer` de OpenStreetMap, `ZoomControl` arriba a la derecha
- Renderiza `MarkerBus` invisible si no hay posición

### MarkerBus.jsx
- Icono SVG de bus con `divIcon` de Leaflet
- Animación CSS `pulse-ring` (onda expansiva)
- Colores por ruta: B1 = azul `#1d6fe8`, H = rosado `#be185d`
- Popup con "Reportado en vivo · En servicio"

### RutasParser.js
- `parseRecorridoToParadas(recorrido)`: split por " - ", asigna `~1.5 min` por parada
- `enrichRutasWithParadas(rutas)`: agrega `paradas[]` a cada sentido

### RecorridoMapa.jsx
- Mapa Leaflet con `Polyline` del recorrido, `CircleMarker` en paradas (cada 5), inicio (verde) y fin (rojo)
- Calcula distancia total con fórmula de Haversine

## Bugs conocidos

1. **`.env` tiene trailing commas** en cada línea → Firebase falla al inicializar
2. **`IconConfetti` importado pero no usado** en `ModalReporteExito.jsx`
3. **`MarkerBus.jsx` ejecuta `crearIconoBus()`** incluso cuando `invisible=true` (debería retornar null antes)

## Scripts disponibles

```bash
npm run dev      # Vite dev server
npm run build    # Vite build
npm run preview  # Vite preview
npm run lint     # ESLint
```

## Variables de entorno (`.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
