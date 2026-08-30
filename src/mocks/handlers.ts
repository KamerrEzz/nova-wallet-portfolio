import { delay, http, HttpResponse } from 'msw';
import type { DefaultBodyType, PathParams } from 'msw';
import type { CardModel, Goal, Investment, NotificationItem, SpendingInsight, Transaction, User, Vault } from '@/shared/types';
import {
  addTransaction,
  createCard,
  createGoal,
  createUser,
  createVault,
  exportTransactionsCsv,
  findUserByEmail,
  findUserById,
  getBalanceFor,
  getCardsFor,
  getGoalsFor,
  getInvestmentsFor,
  getNotificationsFor,
  getOtherUsers,
  getPortfolioPerformance,
  getVaultsFor,
  getSpendingInsight,
  getTransactionById,
  getTransactionsFor,
  markAllNotificationsRead,
  markNotificationRead,
  toPublicUser,
  transferToVault,
  updateCard,
  updateUser,
  updateVault,
  type PaginatedResult,
  type StoredUser,
} from './db';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt';

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const REFRESH_COOKIE = 'nova_refresh';
const REFRESH_COOKIE_PATH = '/api/auth';

function refreshCookieHeader(token: string): string {
  return `${REFRESH_COOKIE}=${token}; HttpOnly; Path=${REFRESH_COOKIE_PATH}; SameSite=Strict`;
}

function clearRefreshCookieHeader(): string {
  return `${REFRESH_COOKIE}=; HttpOnly; Path=${REFRESH_COOKIE_PATH}; SameSite=Strict; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

interface ErrorBody {
  message: string;
  fields?: Record<string, string>;
}

function unauthorized(): HttpResponse<ErrorBody> {
  return HttpResponse.json({ message: 'No autorizado' }, { status: 401 });
}

type AuthSuccess = { user: StoredUser };
type AuthFailure = HttpResponse<ErrorBody>;

/**
 * Reads `Authorization: Bearer <token>`, verifies it, and resolves the user.
 * Returns either `{ user }` or a ready-to-return 401 response.
 */
function requireAuth(request: Request): AuthSuccess | AuthFailure {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return unauthorized();

  const result = verifyToken(header.slice('Bearer '.length).trim());
  if (!result.valid || !result.payload) return unauthorized();

  const user = findUserById(result.payload.sub);
  if (!user) return unauthorized();

  return { user };
}

function isAuthFailure(result: AuthSuccess | AuthFailure): result is AuthFailure {
  return result instanceof HttpResponse;
}

/** Realistic latency for GET endpoints (150–400ms). */
async function realisticDelay(): Promise<void> {
  await delay(150 + Math.floor(Math.random() * 251));
}

interface AuthSuccessBody {
  accessToken: string;
  user: User;
}

function authSuccessResponse(user: StoredUser): HttpResponse<AuthSuccessBody> {
  const accessToken = signAccessToken({ sub: user.id, name: user.name, email: user.email });
  const refreshToken = signRefreshToken(user.id);
  return HttpResponse.json(
    { accessToken, user: toPublicUser(user) },
    { headers: { 'Set-Cookie': refreshCookieHeader(refreshToken) } },
  );
}

/**
 * Builds a regex that matches an API path by its suffix.
 *
 * The app can be served under a base path (e.g. `/nova-wallet-portfolio/` on
 * GitHub Pages), so absolute strings like `/api/auth/login` do not match.
 * A suffix regex works both at `/api/auth/login` and at
 * `/repo-name/api/auth/login`. Query strings are allowed.
 */
function apiPath(path: string): RegExp {
  const escaped = path.replace(/\//g, '\\/').replace(/:\w+/g, '[^/]+');
  return new RegExp(`${escaped}(?:\\?.*)?$`);
}

/** Returns the last segment of a URL pathname (used when regex matching disables MSW params). */
function lastPathSegment(url: string): string {
  return new URL(url).pathname.split('/').pop() ?? '';
}

/* ------------------------------------------------------------------ */
/* Request body types                                                  */
/* ------------------------------------------------------------------ */

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface TransferBody {
  recipientId: string;
  amount: number;
  concept?: string;
}

interface UpdateProfileBody {
  name?: string;
  avatarUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Handlers                                                            */
/* ------------------------------------------------------------------ */

export const handlers = [
  /* ------------------------------ auth ---------------------------- */

  http.post<PathParams, DefaultBodyType, ErrorBody | AuthSuccessBody>(
    apiPath('/api/auth/login'),
    async ({ request }) => {
    const body = (await request.json()) as LoginBody;
    const invalid = () =>
      HttpResponse.json<ErrorBody>({ message: 'Credenciales incorrectas' }, { status: 401 });

    if (!body?.email || !body?.password) return invalid();
    const user = findUserByEmail(body.email);
    if (!user || user.password !== body.password) return invalid();

    return authSuccessResponse(user);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | AuthSuccessBody>(apiPath('/api/auth/register'), async ({ request }) => {
    const body = (await request.json()) as RegisterBody;

    if (!body?.name?.trim() || !body?.email?.trim() || !body?.password) {
      return HttpResponse.json<ErrorBody>(
        {
          message: 'Datos de registro incompletos',
          fields: {
            ...(!body?.name?.trim() ? { name: 'El nombre es obligatorio' } : {}),
            ...(!body?.email?.trim() ? { email: 'El email es obligatorio' } : {}),
            ...(!body?.password ? { password: 'La contraseña es obligatoria' } : {}),
          },
        },
        { status: 422 },
      );
    }

    if (findUserByEmail(body.email)) {
      return HttpResponse.json<ErrorBody>(
        { message: 'Ya existe una cuenta con este email', fields: { email: 'Email ya registrado' } },
        { status: 422 },
      );
    }

    const user = createUser(body.name.trim(), body.email, body.password);
    return authSuccessResponse(user);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | AuthSuccessBody>(apiPath('/api/auth/refresh'), async ({ request }) => {
    const token = readCookie(request, REFRESH_COOKIE);
    if (!token) return unauthorized();

    const result = verifyToken(token);
    if (!result.valid || !result.payload) return unauthorized();

    const user = findUserById(result.payload.sub);
    if (!user) return unauthorized();

    // Rotate the refresh token alongside the new access token.
    return authSuccessResponse(user);
  }),

  http.post(apiPath('/api/auth/logout'), async () => {
    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': clearRefreshCookieHeader() },
    });
  }),

  /* --------------------------- protected -------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | User>(apiPath('/api/me'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<User>(toPublicUser(auth.user));
  }),

  http.get(apiPath('/api/balance'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json(getBalanceFor(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | CardModel[]>(apiPath('/api/cards'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<CardModel[]>(getCardsFor(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | PaginatedResult<Transaction>>(apiPath('/api/transactions'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type');
    const pageParam = Number(url.searchParams.get('page'));
    const pageSizeParam = Number(url.searchParams.get('pageSize'));

    const result = getTransactionsFor(auth.user.id, {
      search: url.searchParams.get('search') ?? undefined,
      type:
        typeParam === 'income' || typeParam === 'expense' || typeParam === 'all'
          ? typeParam
          : 'all',
      category: url.searchParams.get('category') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
      page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
      pageSize: Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 10,
    });

    return HttpResponse.json<PaginatedResult<Transaction>>(result);
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | Transaction>(apiPath('/api/transactions/:id'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    const tx = getTransactionById(auth.user.id, lastPathSegment(request.url));
    if (!tx) {
      return HttpResponse.json<ErrorBody>({ message: 'Transacción no encontrada' }, { status: 404 });
    }
    return HttpResponse.json<Transaction>(tx);
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | User[]>(apiPath('/api/recipients'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    return HttpResponse.json<User[]>(getOtherUsers(auth.user.id));
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | Transaction>(apiPath('/api/transfers'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as TransferBody;

    if (typeof body?.amount !== 'number' || !Number.isFinite(body.amount) || body.amount <= 0) {
      return HttpResponse.json<ErrorBody>(
        { message: 'El importe debe ser mayor que cero', fields: { amount: 'Importe inválido' } },
        { status: 422 },
      );
    }

    const recipient = findUserById(body.recipientId);
    if (!recipient || recipient.id === auth.user.id) {
      return HttpResponse.json<ErrorBody>(
        { message: 'Destinatario no válido', fields: { recipientId: 'Destinatario no válido' } },
        { status: 422 },
      );
    }

    const balance = getBalanceFor(auth.user.id);
    if (body.amount > balance.total) {
      return HttpResponse.json<ErrorBody>(
        { message: 'Saldo insuficiente', fields: { amount: 'Saldo insuficiente' } },
        { status: 422 },
      );
    }

    // Longer delay so async/loading states are visible in the UI.
    await delay(800);

    const concept = body.concept?.trim();
    const tx = addTransaction(auth.user.id, {
      title: concept ? `Transferencia a ${recipient.name} · ${concept}` : `Transferencia a ${recipient.name}`,
      category: 'transferencias',
      amount: -Math.abs(body.amount),
      status: 'completed',
      counterparty: recipient.name,
    });
    addTransaction(recipient.id, {
      title: concept ? `Transferencia de ${auth.user.name} · ${concept}` : `Transferencia de ${auth.user.name}`,
      category: 'transferencias',
      amount: Math.abs(body.amount),
      status: 'completed',
      counterparty: auth.user.name,
    });

    return HttpResponse.json<Transaction>(tx, { status: 201 });
  }),

  http.patch<PathParams, DefaultBodyType, ErrorBody | User>(apiPath('/api/profile'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as UpdateProfileBody;

    if (body?.name !== undefined && !body.name.trim()) {
      return HttpResponse.json<ErrorBody>(
        { message: 'El nombre no puede estar vacío', fields: { name: 'El nombre no puede estar vacío' } },
        { status: 422 },
      );
    }

    const updated = updateUser(auth.user.id, {
      ...(body?.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body?.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
    });
    if (!updated) return unauthorized();

    return HttpResponse.json<User>(toPublicUser(updated));
  }),

  /* ----------------------------- cards ----------------------------- */

  http.post<PathParams, DefaultBodyType, ErrorBody | CardModel>(apiPath('/api/cards'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as Partial<CardModel>;
    const card = createCard(auth.user.id, { ...body, type: 'virtual' });
    await realisticDelay();
    return HttpResponse.json<CardModel>(card, { status: 201 });
  }),

  http.patch<PathParams, DefaultBodyType, ErrorBody | CardModel>(apiPath('/api/cards/:id'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as Partial<CardModel>;
    const updated = updateCard(auth.user.id, lastPathSegment(request.url), body);
    if (!updated) {
      return HttpResponse.json<ErrorBody>({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }
    await realisticDelay();
    return HttpResponse.json<CardModel>(updated);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | CardModel>(apiPath('/api/cards/:id/disposable'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const source = updateCard(auth.user.id, lastPathSegment(request.url), {});
    if (!source) {
      return HttpResponse.json<ErrorBody>({ message: 'Tarjeta no encontrada' }, { status: 404 });
    }

    const card = createCard(auth.user.id, {
      ...source,
      id: undefined,
      label: `${source.label} (desechable)`,
      type: 'virtual',
    });
    await realisticDelay();
    return HttpResponse.json<CardModel>(card, { status: 201 });
  }),

  /* ----------------------------- vaults ---------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | Vault[]>(apiPath('/api/vaults'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<Vault[]>(getVaultsFor(auth.user.id));
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | Vault>(apiPath('/api/vaults'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as Partial<Vault>;
    const vault = createVault(auth.user.id, body);
    await realisticDelay();
    return HttpResponse.json<Vault>(vault, { status: 201 });
  }),

  http.patch<PathParams, DefaultBodyType, ErrorBody | Vault>(apiPath('/api/vaults/:id'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as Partial<Vault>;
    const updated = updateVault(auth.user.id, lastPathSegment(request.url), body);
    if (!updated) {
      return HttpResponse.json<ErrorBody>({ message: 'Bóveda no encontrada' }, { status: 404 });
    }
    await realisticDelay();
    return HttpResponse.json<Vault>(updated);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | Vault>(apiPath('/api/vaults/:id/transfer'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as { amount?: number };
    if (typeof body.amount !== 'number' || !Number.isFinite(body.amount)) {
      return HttpResponse.json<ErrorBody>({ message: 'Importe inválido', fields: { amount: 'Importe inválido' } }, { status: 422 });
    }

    const updated = transferToVault(auth.user.id, lastPathSegment(request.url), body.amount);
    if (!updated) {
      return HttpResponse.json<ErrorBody>({ message: 'Bóveda no encontrada' }, { status: 404 });
    }
    await delay(600);
    return HttpResponse.json<Vault>(updated);
  }),

  /* ------------------------------ goals ----------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | Goal[]>(apiPath('/api/goals'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<Goal[]>(getGoalsFor(auth.user.id));
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | Goal>(apiPath('/api/goals'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as Partial<Goal>;
    const goal = createGoal(auth.user.id, body);
    await realisticDelay();
    return HttpResponse.json<Goal>(goal, { status: 201 });
  }),

  /* -------------------------- investments --------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | Investment[]>(apiPath('/api/investments'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<Investment[]>(getInvestmentsFor(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | { date: string; value: number }[]>(apiPath('/api/investments/performance'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json(getPortfolioPerformance(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | SpendingInsight>(apiPath('/api/insights/spending'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<SpendingInsight>(getSpendingInsight(auth.user.id));
  }),

  /* -------------------------- notifications ------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | NotificationItem[]>(apiPath('/api/notifications'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<NotificationItem[]>(getNotificationsFor(auth.user.id));
  }),

  http.patch<PathParams, DefaultBodyType, ErrorBody | NotificationItem>(apiPath('/api/notifications/:id/read'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const updated = markNotificationRead(auth.user.id, lastPathSegment(request.url));
    if (!updated) {
      return HttpResponse.json<ErrorBody>({ message: 'Notificación no encontrada' }, { status: 404 });
    }
    return HttpResponse.json<NotificationItem>(updated);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | null>(apiPath('/api/notifications/read-all'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    markAllNotificationsRead(auth.user.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ----------------------------- export ----------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | string>(apiPath('/api/export/transactions.csv'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    const csv = exportTransactionsCsv(auth.user.id);
    return new HttpResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nova-transactions.csv"',
      },
    });
  }),

  /* ----------------------------- support ---------------------------- */

  http.post<PathParams, DefaultBodyType, ErrorBody | { ticketId: string }>(apiPath('/api/support/contact'), async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;

    const body = (await request.json()) as { subject?: string; message?: string };
    if (!body.subject?.trim() || !body.message?.trim()) {
      return HttpResponse.json<ErrorBody>(
        { message: 'Asunto y mensaje son obligatorios' },
        { status: 422 },
      );
    }

    await delay(900);
    return HttpResponse.json({ ticketId: `TICKET-${Date.now()}` }, { status: 201 });
  }),
];

/**
 * Extra handlers for failure-path tests — NOT registered by default.
 * Use e.g. `server.use(...errorHandlers)` inside a specific test.
 */
export const errorHandlers = [
  http.get(apiPath('/api/balance'), () => {
    return HttpResponse.json<ErrorBody>({ message: 'Error interno del servidor' }, { status: 500 });
  }),
  http.get(apiPath('/api/transactions'), () => {
    return HttpResponse.json<ErrorBody>({ message: 'Error interno del servidor' }, { status: 500 });
  }),
];
