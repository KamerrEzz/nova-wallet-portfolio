# NOVA Wallet

> **Proyecto de portafolio frontend (mid/senior).** Demo completa de una banca digital construida con React 18, TypeScript estricto, Redux Toolkit + RTK Query, MSW como BFF simulado y un design system propio con CSS Modules + tokens. Toda la interfaz está en español.
>
> Incluye landing "phygital" con animaciones, autenticación JWT con refresco silencioso, dashboard con widgets, explorador de movimientos, asistente de transferencias, gestión de tarjetas físicas/virtuales, bóvedas de ahorro con metas, portafolio de inversiones, centro de notificaciones, ayuda/FAQ y command palette (Cmd+K).
>
> Desplegado en: `https://kamerrezz.github.io/nova-wallet-portfolio/`

---

## Inicio rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` y entra con las credenciales demo:

| Email           | Contraseña |
| --------------- | ---------- |
| `demo@nova.app` | `demo1234` |

Otros usuarios sembrados: `maria@nova.app / maria1234`, `diego@nova.app / diego1234`.

### Scripts

| Comando          | Descripción                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Servidor de desarrollo Vite (con MSW activo) |
| `npm test`       | Suite Jest + Testing Library                 |
| `npm run build`  | `tsc` + build de producción en `dist/`       |
| `npm run preview`| Sirve el build de producción                 |
| `npm run lint`   | ESLint sobre todo el proyecto                |
| `npm run format` | Prettier                                     |

---

## Mapa de requisitos → código

| Requisito                      | Dónde vive |
| ------------------------------ | ---------- |
| React 18 + TS strict           | `tsconfig.json` (`strict: true`), `src/main.tsx`, `src/App.tsx` |
| Hooks avanzados                | `src/shared/hooks/`: `useDebounce`, `useInView`, `useTilt`, `useScrollProgress`, `useElementScrollProgress`, `useCountUp`, `useMediaQuery`, `usePrefersReducedMotion`, `useLocalStorage`, `useClickOutside` |
| Context API (tema)             | `src/shared/theme/ThemeContext.tsx` + `tokens.css` / `global.css` |
| Redux Toolkit                  | `src/app/store.ts`, `src/features/auth/authSlice.ts`, `src/features/ui/uiSlice.ts` |
| RTK Query + reauth JWT         | `src/shared/api/baseApi.ts` (`baseQueryWithReauth` con mutex de refresh), `src/shared/api/apiSlice.ts` (endpoints) |
| BFF / API REST                 | `src/mocks/handlers.ts` (`/api/auth/*`, `/api/me`, `/api/balance`, `/api/cards`, `/api/transactions`, `/api/recipients`, `/api/transfers`, `/api/profile`, `/api/vaults`, `/api/goals`, `/api/investments`, `/api/notifications`, `/api/insights/spending`, `/api/export/transactions.csv`, `/api/support/contact`) con datos deterministas en `src/mocks/db.ts` y JWT real en `src/mocks/jwt.ts` |
| Operaciones asíncronas         | Login/register/refresh/transfer vía RTK Query con latencia y errores simulados en el BFF |
| Formularios + validaciones     | `react-hook-form` + `zod`: `src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `src/pages/transfers/transferSchema.ts`, `src/pages/profile/EditProfileForm.tsx` |
| Manejo de errores en UI        | `src/app/ErrorBoundary.tsx`, `src/app/RouteError.tsx`, `src/shared/ui/ErrorState`, toasts en `src/features/ui/ToastViewport.tsx`, errores inline 422 en transferencias |
| Componentización / design system | `src/shared/ui/`: `Avatar`, `Badge`, `Button`, `Card`, `CommandPalette`, `Drawer`, `EmptyState`, `ErrorState`, `Input`, `Modal`, `Progress`, `SegmentedControl`, `Select`, `Skeleton`, `Spinner`, `Stat`, `Switch`, `Tabs`, `Textarea`, `ThemeToggle`, `Tooltip` |
| HTML5/CSS3 responsive          | CSS Modules por componente, tokens en `src/shared/theme/tokens.css`, layouts fluidos con `clamp()`, grid/flex |
| Optimización de renders        | `React.memo` en `WalletCard` y `TransactionRow`, `useMemo`/`useCallback` en listas y filtros (`src/pages/transactions/TransactionList.tsx`, `RecentActivity.tsx`) |
| lazy / Suspense                | Rutas lazy en `src/app/router.tsx` con fallback `src/app/FullScreenLoader.tsx` (code splitting por página) |
| JWT                            | Access token en memoria (Redux), refresh token en cookie httpOnly simulada por el BFF (`src/mocks/jwt.ts`, `handlers.ts`); restauración de sesión en `src/features/auth/RequireAuth.tsx` |
| Accesibilidad / motion         | `prefers-reduced-motion` global (`global.css`), `MotionConfig reducedMotion="user"` en `src/app/providers.tsx`, roles/aria en componentes |
| Testing                        | Jest + RTL + MSW: `src/pages/__tests__/`, entorno `test/JsdomFetchEnvironment.cjs` |

---

## Arquitectura

### Mapa de carpetas

```
src/
├── app/            # store, router (lazy routes), providers, ErrorBoundary, layout
├── features/
│   ├── auth/       # authSlice (credenciales en memoria) + RequireAuth
│   └── ui/         # uiSlice (toasts) + ToastViewport
├── mocks/          # BFF simulado: handlers MSW, db determinista, JWT
├── pages/          # Landing, Login, Register, Dashboard, Transactions,
│   │               # Transfers, Cards, Savings, Investments, Notifications,
│   │               # Help, Profile, NotFound (+ subcomponentes por página)
│   └── __tests__/  # suites de integración por página
├── shared/
│   ├── api/        # baseApi (reauth) + apiSlice (endpoints RTK Query)
│   ├── hooks/      # hooks reutilizables
│   ├── lib/        # cn(), formatters (moneda, fechas)
│   ├── theme/      # ThemeContext, tokens.css, global.css
│   ├── types/      # modelos de dominio (User, Transaction, Balance, CardModel)
│   └── ui/         # design system
└── test/           # entorno Jest custom + file mocks
```

### Flujo de datos y reauth

```
Componente ──dispatch──▶ RTK Query (apiSlice)
                              │
                    baseQueryWithReauth
                              │
                    fetchBaseQuery + Authorization: Bearer <accessToken>
                              │
                         BFF (MSW)
                              │
                    ┌── 200 ──┴── 401 ──┐
                    ▼                   ▼
               datos al slice    refresh mutex (1 sola petición
                    │            /api/auth/refresh con cookie httpOnly)
                    │                   │
                    │             ┌─ ok ─┴─ falla ─┐
                    │             ▼                ▼
                    │      setCredentials    clearCredentials
                    │      + reintento       → redirect /login
                    ▼
              re-render suscrito
```

## Cómo funciona el BFF simulado con MSW

> Para una explicación paso a paso (ideal para aprender o para recruiters), lee [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

MSW (Mock Service Worker) intercepta las peticiones de red antes de que salgan del navegador. En este proyecto actúa como un backend de mentira pero completamente funcional.

### Archivos clave

| Archivo | Qué hace | Por qué importa |
| --- | --- | --- |
| `public/mockServiceWorker.js` | Service Worker generado por `npx msw init public/`. Es el "espía" que captura los `fetch`. | Sin él MSW no puede interceptar nada en el navegador. Se copia tal cual a `dist/` en el build. |
| `src/mocks/handlers.ts` | Define las rutas: `POST /api/auth/login`, `GET /api/balance`, etc. | Es como un Express/Fastify miniatura. Devuelve `HttpResponse.json()` o errores con status. |
| `src/mocks/db.ts` | Base de datos en memoria: usuarios, tarjetas, transacciones. | Determinista (semilla fija) para que la demo y los tests siempre den lo mismo. |
| `src/mocks/jwt.ts` | Firma y verifica tokens fake (base64url + hash). | Simula access token (15 min) y refresh token (7 días) sin necesidad de backend real. |
| `src/mocks/browser.ts` | `setupWorker(...handlers)` para el navegador. | Arranca el worker en `main.tsx` tanto en dev como en producción para este demo. |
| `src/mocks/server.ts` | `setupServer(...handlers)` para Node. | Se usa en Jest para testear con los mismos handlers del BFF. |

### Flujo de una petición

```txt
Componente ──▶ useLoginMutation() ──▶ RTK Query
                                          │
                                          ▼
                                   fetch("api/auth/login")
                                          │
                                          ▼
                              MSW intercepta la petición
                                          │
                                          ▼
                         handlers.ts → HttpResponse.json({ accessToken, user })
                                          │
                                          ▼
                                  RTK Query resuelve la mutación
```

Si una petición no coincide con ningún handler, MSW la deja pasar (`onUnhandledRequest: 'bypass'`).

### ¿Por qué MSW en lugar de un backend real?

- **Demo lista para ejecutar**: clona, `npm install`, `npm run dev` y funciona.
- **Tests reales**: los tests de Jest usan exactamente el mismo BFF que el navegador.
- **Errores controlados**: podemos devolver 401, 422 o 500 a voluntad para probar el manejo de errores en UI.
- **Sin dependencias externas**: no hace falta levantar Docker ni una API remota para que un recruiter revise el código.

---

## Cómo funciona `src/shared/api/` (RTK Query)

> Para una explicación detallada con ejemplos, lee [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

Aquí vive toda la comunicación con el servidor. Está dividida en dos capas.

### 1. `baseApi.ts` — transporte + reauth

- **`baseQuery`**: instancia de `fetchBaseQuery` con:
  - `baseUrl`: `'api'` en el navegador (relativo, funciona bajo `/repo-name/`) y `/api` en tests.
  - `prepareHeaders`: añade `Authorization: Bearer <accessToken>` si existe en el slice de auth.
- **`baseQueryWithReauth`**: envuelve a `baseQuery`. Si una respuesta es **401**, intenta un `POST /auth/refresh` una sola vez, actualiza el access token y reintenta la petición original.
- **Mutex de refresh**: si dos peticiones fallan con 401 a la vez, solo se hace **una** petición de refresh; la otra espera el resultado.

```txt
200 OK ──▶ devuelve datos
 401     ──▶ /auth/refresh ──▶ ok? setCredentials + retry
                    │
                    └──▶ falla? clearCredentials → redirect /login
```

### 2. `apiSlice.ts` — endpoints de dominio

Usa `baseApi.injectEndpoints` para declarar los recursos:

- Auth: `login`, `register`, `logout`, `refresh`.
- Datos: `getMe`, `getBalance`, `getCards`, `getTransactions`, `getRecipients`, `getVaults`, `getGoals`, `getInvestments`, `getNotifications`, `getSpendingInsight`.
- Mutaciones: `createTransfer`, `updateProfile`, `createVirtualCard`, `updateCard`, `createDisposableCard`, `createVault`, `updateVault`, `transferToVault`, `createGoal`, `markNotificationRead`, `markAllNotificationsRead`, `exportTransactions`, `contactSupport`.

Cada endpoint genera hooks (`useGetBalanceQuery`, `useCreateTransferMutation`, etc.) que los componentes usan directamente.

### Cómo añadir un nuevo endpoint

```ts
// src/shared/api/apiSlice.ts
endpoints: (builder) => ({
  getExample: builder.query<Example, void>({
    query: () => 'example',
    providesTags: ['Example'],
  }),
  updateExample: builder.mutation<Example, Partial<Example>>({
    query: (body) => ({ url: 'example', method: 'PATCH', body }),
    invalidatesTags: ['Example'],
  }),
}),
```

Después en el componente:

```ts
const { data } = useGetExampleQuery()
const [update] = useUpdateExampleMutation()
```

---

### Decisiones justificadas

- **Context API para el tema, Redux para lo demás.** El tema es estado de UI puro, de baja frecuencia de cambio y sin derivados de servidor: un `ThemeContext` con `useLocalStorage` es suficiente y evita meter en el store global algo que no necesita devtools ni middleware. El estado de autenticación y los datos de servidor sí viven en Redux/RTK Query: caché, invalidación por tags y estados de petición (`isLoading`/`isError`) resueltos.
- **Access token en memoria + refresh httpOnly.** El access token solo existe en el slice de auth (nunca en `localStorage`), lo que elimina el vector de robo por XSS persistente. El refresh viaja en cookie `httpOnly` (simulada por el BFF) y `RequireAuth` restaura la sesión al recargar pidiendo un nuevo access token. El refresco usa un **mutex a nivel de módulo** para que 401s concurrentes compartan una única petición de refresh.
- **MSW como BFF.** Los handlers MSW (`src/mocks/`) implementan una API REST realista — JWT firmados, latencia, errores 401/422/409, paginación — y sirven tanto en desarrollo (Service Worker) como en tests (node). La db es determinista (PRNG con semilla) para que la demo y los tests sean estables; el saldo demo queda en ≈ **+4.576 €**.
- **CSS Modules + tokens.** Estilos co-localizados por componente sin colisiones ni runtime CSS-in-JS; los tokens de color/espaciado/tipografía en `tokens.css` permiten tema claro/oscuro con variables CSS.

---

## Testing

Jest + Testing Library + MSW (node) con un entorno jsdom custom (`test/JsdomFetchEnvironment.cjs`) que añade `fetch`/`Request`/`Response`/`Headers` de Node 18+ al entorno de tests.

- **9 suites / 31 tests** en `src/pages/__tests__/`: Landing, Login, Dashboard, Transactions, Transfers y Profile.
- Los tests son de integración a nivel de página: store real (`setupStore`), router en memoria, y el servidor MSW real (`src/mocks/server.ts`) con los mismos handlers que el BFF de desarrollo — incluyendo latencia y validaciones de saldo del endpoint de transferencias.

```bash
npm test          # toda la suite
npx jest --ci     # modo CI
```
