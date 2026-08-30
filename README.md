# NOVA Wallet

SPA de banca digital (demo) construida con **React 18 + TypeScript estricto**, **Vite 5**, **Redux Toolkit + RTK Query**, **MSW 2** como BFF simulado y un sistema de diseño propio con **CSS Modules + tokens**. Toda la interfaz está en español.

Incluye landing "phygital" con animaciones, autenticación JWT con refresco silencioso, dashboard con saldo y gráfico de gasto, explorador de movimientos con búsqueda/filtros/paginación, asistente de transferencias en 4 pasos y perfil con preferencias de tema.

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
| BFF / API REST                 | `src/mocks/handlers.ts` (`/api/auth/*`, `/api/me`, `/api/balance`, `/api/cards`, `/api/transactions`, `/api/recipients`, `/api/transfers`, `/api/profile`) con datos deterministas en `src/mocks/db.ts` y JWT real en `src/mocks/jwt.ts` |
| Operaciones asíncronas         | Login/register/refresh/transfer vía RTK Query con latencia y errores simulados en el BFF |
| Formularios + validaciones     | `react-hook-form` + `zod`: `src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `src/pages/transfers/transferSchema.ts`, `src/pages/profile/EditProfileForm.tsx` |
| Manejo de errores en UI        | `src/app/ErrorBoundary.tsx`, `src/app/RouteError.tsx`, `src/shared/ui/ErrorState`, toasts en `src/features/ui/ToastViewport.tsx`, errores inline 422 en transferencias |
| Componentización / design system | `src/shared/ui/`: `Avatar`, `Badge`, `Button`, `Card`, `EmptyState`, `ErrorState`, `Input`, `Modal`, `Select`, `Skeleton`, `Spinner`, `Stat`, `Textarea`, `ThemeToggle` |
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
│   │               # Transfers, Profile, NotFound (+ subcomponentes por página)
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
