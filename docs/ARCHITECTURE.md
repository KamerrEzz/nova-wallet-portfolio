# Arquitectura del BFF simulado y la capa de API

> Este documento explica **cómo NOVA Wallet simula un backend real** con MSW (Mock Service Worker) y cómo la aplicación se comunica con él a través de `src/shared/api/`. Está escrito para que un recruiter, un compañero de equipo o tú mismo dentro de seis meses lo entienda sin adivinar.

---

## Índice

1. [¿Qué es MSW?](#qué-es-msw)
2. [¿Por qué usamos MSW aquí?](#por-qué-usamos-msw-aquí)
3. [Archivos del BFF simulado](#archivos-del-bff-simulado)
4. [Flujo de una petición](#flujo-de-una-petición)
5. [El problema del subpath en GitHub Pages](#el-problema-del-subpath-en-github-pages)
6. [`src/shared/api/` paso a paso](#srcsharedapi-paso-a-paso)
7. [Cómo agregar un endpoint nuevo](#cómo-agregar-un-endpoint-nuevo)
8. [Testing con MSW](#testing-con-msw)
9. [Glosario rápido](#glosario-rápido)

---

## ¿Qué es MSW?

**MSW** = [Mock Service Worker](https://mswjs.io/).

Es una librería que intercepta las peticiones de red **antes de que salgan del navegador** (mediante un *Service Worker*) o **antes de que lleguen a la red real** en Node (mediante `setupServer`).

No es un backend real, pero se comporta como uno: recibe `fetch`, decide qué responder y devuelve un objeto `Response` exactamente igual que haría un servidor.

### Dos caras de MSW

| Entorno | API de MSW | Archivo en este proyecto | Para qué sirve |
| ------- | ---------- | ------------------------ | -------------- |
| Navegador | `setupWorker(...handlers)` | `src/mocks/browser.ts` | Demo en `npm run dev` y en GitHub Pages. |
| Node / jsdom | `setupServer(...handlers)` | `src/mocks/server.ts` | Tests con Jest. |

Ambos usan **los mismos handlers** (`src/mocks/handlers.ts`), así que el comportamiento del BFF es idéntico en desarrollo, producción y tests.

---

## ¿Por qué usamos MSW aquí?

1. **Demo lista para usar.** Clonas, instalas dependencias, `npm run dev` y ya puedes hacer login, transferencias, etc.
2. **Tests de integración reales.** Los tests de Jest no mockean a mano cada endpoint; usan el mismo BFF que el navegador.
3. **Errores bajo control.** Podemos devolver 401, 422 o 500 a voluntad para probar el manejo de errores en la UI.
4. **Sin infraestructura externa.** No hace falta Docker, una API remota ni una base de datos para que un recruiter ejecute el proyecto.

---

## Archivos del BFF simulado

```
src/mocks/
├── browser.ts      # setupWorker para el navegador
├── server.ts       # setupServer para Node/tests
├── handlers.ts     # rutas del BFF (lo más parecido a un Express miniatura)
├── db.ts           # "base de datos" en memoria
└── jwt.ts          # tokens fake con firma/verificación deterministicas
```

### `handlers.ts`

Define cada endpoint como una función que recibe la `request` y devuelve un `HttpResponse`:

```ts
http.post('/api/auth/login', async ({ request }) => {
  const body = await request.json()
  // ...validar...
  return HttpResponse.json({ accessToken, user })
})
```

MSW compara la URL de la petición contra el patrón que le pasas. Si coincide, ejecuta tu función. Si no, deja pasar la petición (en nuestro caso nunca pasa porque usamos `onUnhandledRequest: 'bypass'`).

### `db.ts`

Usuarios, tarjetas y transacciones en memoria. Es **determinista**: la semilla del generador de datos es fija, por lo que la demo y los tests siempre dan el mismo resultado. El usuario demo siempre tiene el mismo saldo y los mismos movimientos.

### `jwt.ts`

Firma y verifica tokens fake. No es criptografía real, pero simula:

- **Access token:** dura 15 minutos, va en memoria (Redux).
- **Refresh token:** dura 7 días, viaja en una cookie `HttpOnly` simulada.

Esto permite probar flujos realistas de autenticación JWT sin backend.

---

## Flujo de una petición

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Componente │────▶│ useLoginMutation │────▶│  RTK Query  │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                    │
                                                    ▼
┌─────────────┐     ┌─────────────┐          ┌─────────────┐
│ HttpResponse│◀────│    MSW      │◀─────────│ fetch(url)  │
└──────┬──────┘     │  handlers   │          └─────────────┘
       │            └─────────────┘
       ▼
┌─────────────┐
│  Redux RTK  │──▶ datos al componente
└─────────────┘
```

Pasos:

1. El componente llama al hook generado por RTK Query, por ejemplo `useLoginMutation()`.
2. RTK Query construye la URL y hace `fetch`.
3. MSW intercepta el `fetch` y ejecuta el handler correspondiente.
4. El handler devuelve un `HttpResponse` con status, headers y body.
5. RTK Query resuelve la mutación/query y actualiza el store.
6. El componente recibe `data`, `isLoading`, `error`, etc.

---

## El problema del subpath en GitHub Pages

### ¿Qué pasa?

GitHub Pages sirve el proyecto en una subruta:

```
https://kamerrezz.github.io/nova-wallet-portfolio/
```

Cuando la app hace login, la URL real de la petición es:

```
https://kamerrezz.github.io/nova-wallet-portfolio/api/auth/login
```

MSW compara esa URL contra el patrón del handler. Si el handler está definido como:

```ts
http.post('/api/auth/login', ...)
```

MSW busca un pathname **exactamente** `/api/auth/login`. Pero el pathname real es `/nova-wallet-portfolio/api/auth/login`, así que **no hace match**.

La petición escapa de MSW, llega a GitHub Pages, y GitHub Pages devuelve **405 Method Not Allowed** porque no acepta `POST` en archivos estáticos.

### La solución: `apiPath()`

En `src/mocks/handlers.ts` tenemos un helper:

```ts
function apiPath(path: string): RegExp {
  const escaped = path.replace(/\//g, '\\/').replace(/:\w+/g, '[^/]+')
  return new RegExp(`${escaped}(?:\\?.*)?$`)
}
```

Convierte `/api/auth/login` en una expresión regular que coincide con **cualquier URL que termine en `/api/auth/login`**, permitiendo un prefijo arbitrario y query params:

```ts
http.post(apiPath('/api/auth/login'), ...)
```

Ahora matchea:

- `http://localhost:5173/nova-wallet-portfolio/api/auth/login` (dev)
- `https://kamerrezz.github.io/nova-wallet-portfolio/api/auth/login` (producción)
- `http://localhost/api/auth/login` (tests sin subpath)

### ¿Y los parámetros de ruta?

Cuando usas un string como `/api/transactions/:id`, MSW rellena `params.id` automáticamente. Al usar una regex perdemos esa comodidad, así que extraemos el `id` a mano:

```ts
http.get(apiPath('/api/transactions/:id'), async ({ request }) => {
  const id = lastPathSegment(request.url)
  const tx = getTransactionById(auth.user.id, id)
  // ...
})
```

`lastPathSegment` toma el último segmento del pathname de la URL.

---

## `src/shared/api/` paso a paso

La carpeta `src/shared/api/` contiene toda la comunicación con el servidor. Está dividida en dos capas.

### 1. `baseApi.ts` — transporte + reautenticación

#### `baseQuery`

```ts
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE, // 'api' en navegador, '/api' en tests
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})
```

- **`baseUrl: 'api'`** (relativo) hace que las peticiones se resuelvan correctamente bajo cualquier base path.
- **`prepareHeaders`** añade el `Authorization: Bearer <accessToken>` si el usuario está autenticado.

#### `baseQueryWithReauth`

```ts
export const baseQueryWithReauth: BaseQueryFn<...> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  // Evita bucles infinitos en /auth/refresh
  if (requestUrl(args) === '/auth/refresh') {
    api.dispatch(clearCredentials())
    return result
  }

  // Mutex: si hay varias peticiones 401 a la vez, solo se hace un refresh
  let pending = refreshPromise
  if (!pending) {
    pending = Promise.resolve(
      refreshQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions),
    ).finally(() => {
      refreshPromise = null
    })
    refreshPromise = pending
  }

  const refreshResult = await pending

  if (refreshResult.data) {
    api.dispatch(setCredentials(refreshResult.data as AuthResponse))
    result = await baseQuery(args, api, extraOptions) // reintenta la petición original
  } else {
    api.dispatch(clearCredentials())
  }

  return result
}
```

Flujo:

```
200 OK  ──▶ devuelve datos
 401    ──▶ POST /auth/refresh
              │
              ├─ ok ──▶ setCredentials + reintento original
              │
              └─ fail ──▶ clearCredentials ──▶ redirect /login
```

#### `baseApi`

```ts
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Balance', 'Transactions', 'Transaction', 'Cards', 'Recipients', 'User'],
  endpoints: () => ({}),
})
```

`createApi` crea el slice de Redux, el middleware de caché y la infraestructura para inyectar endpoints.

### 2. `apiSlice.ts` — endpoints de dominio

Usa `baseApi.injectEndpoints` para declarar recursos:

```ts
export const api = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBalance: build.query<Balance, void>({
      query: () => '/balance',
      providesTags: ['Balance'],
    }),

    createTransfer: build.mutation<Transaction, TransferRequest>({
      query: (body) => ({ url: '/transfers', method: 'POST', body }),
      invalidatesTags: ['Balance', 'Transactions'],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          api.util.updateQueryData('getBalance', undefined, (draft) => {
            draft.total -= body.amount
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})
```

Conceptos clave:

- **`query`** para leer datos, **`mutation`** para escribir datos.
- **`providesTags`** marca qué datos cachea este endpoint.
- **`invalidatesTags`** invalida esos datos cuando la mutación tiene éxito, forzando una recarga.
- **`onQueryStarted`** permite optimistic updates: actualizamos la UI antes de que el servidor responda y hacemos rollback si falla.

---

## Cómo agregar un endpoint nuevo

Supongamos que necesitamos un endpoint `GET /api/notifications`.

### Paso 1: añadir el tipo

```ts
// src/shared/types/index.ts (o donde estén los tipos)
export interface Notification {
  id: string
  title: string
  read: boolean
  createdAt: string
}
```

### Paso 2: añadir el handler de MSW

```ts
// src/mocks/handlers.ts
http.get(apiPath('/api/notifications'), async ({ request }) => {
  const auth = requireAuth(request)
  if (isAuthFailure(auth)) return auth
  await realisticDelay()

  return HttpResponse.json<Notification[]>([
    { id: 'n-1', title: 'Bienvenido a NOVA', read: false, createdAt: new Date().toISOString() },
  ])
})
```

### Paso 3: añadir el tag y el endpoint

```ts
// src/shared/api/baseApi.ts
tagTypes: [..., 'Notifications'],
```

```ts
// src/shared/api/apiSlice.ts
getNotifications: build.query<Notification[], void>({
  query: () => '/notifications',
  providesTags: ['Notifications'],
}),

markNotificationAsRead: build.mutation<void, string>({
  query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
  invalidatesTags: ['Notifications'],
}),
```

### Paso 4: exportar los hooks

```ts
export const {
  ...,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = api
```

### Paso 5: usar en un componente

```tsx
const { data: notifications, isLoading } = useGetNotificationsQuery()
const [markAsRead] = useMarkNotificationAsReadMutation()
```

---

## Testing con MSW

Los tests usan `src/mocks/server.ts`:

```ts
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Sobreescribir un handler en un test específico

```ts
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

it('muestra error 500', async () => {
  server.use(
    http.get(apiPath('/api/balance'), () => {
      return HttpResponse.json({ message: 'Error interno' }, { status: 500 })
    }),
  )

  // render + assertions...
})
```

`server.use(...)` añade handlers temporales que se resetean en `afterEach`.

---

## Glosario rápido

| Término | Significado |
| ------- | ----------- |
| **BFF** | Backend For Frontend. Aquí es el backend simulado que consume la SPA. |
| **MSW** | Mock Service Worker. Interceptor de red para desarrollo y tests. |
| **Handler** | Función que define una ruta y su respuesta en MSW. |
| **RTK Query** | Librería de gestión de datos de servidor incluida en Redux Toolkit. |
| **Endpoint** | Definición de un recurso HTTP en RTK Query (`query` o `mutation`). |
| **Tag** | Etiqueta de caché en RTK Query. Permite invalidar datos automáticamente. |
| **Optimistic update** | Actualizar la UI antes de recibir la respuesta del servidor. |
| **Reauth** | Reintentar una petición 401 tras refrescar el access token. |
| **Service Worker** | Script que el navegador ejecuta en segundo plano; MSW lo usa para interceptar fetch. |
