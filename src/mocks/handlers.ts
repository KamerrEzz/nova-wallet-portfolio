import { delay, http, HttpResponse } from 'msw';
import type { DefaultBodyType, PathParams } from 'msw';
import type { CardModel, Transaction, User } from '@/shared/types';
import {
  addTransaction,
  createUser,
  findUserByEmail,
  findUserById,
  getBalanceFor,
  getCardsFor,
  getOtherUsers,
  getTransactionById,
  getTransactionsFor,
  toPublicUser,
  updateUser,
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
    '/api/auth/login',
    async ({ request }) => {
    const body = (await request.json()) as LoginBody;
    const invalid = () =>
      HttpResponse.json<ErrorBody>({ message: 'Credenciales incorrectas' }, { status: 401 });

    if (!body?.email || !body?.password) return invalid();
    const user = findUserByEmail(body.email);
    if (!user || user.password !== body.password) return invalid();

    return authSuccessResponse(user);
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | AuthSuccessBody>('/api/auth/register', async ({ request }) => {
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

  http.post<PathParams, DefaultBodyType, ErrorBody | AuthSuccessBody>('/api/auth/refresh', async ({ request }) => {
    const token = readCookie(request, REFRESH_COOKIE);
    if (!token) return unauthorized();

    const result = verifyToken(token);
    if (!result.valid || !result.payload) return unauthorized();

    const user = findUserById(result.payload.sub);
    if (!user) return unauthorized();

    // Rotate the refresh token alongside the new access token.
    return authSuccessResponse(user);
  }),

  http.post('/api/auth/logout', async () => {
    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': clearRefreshCookieHeader() },
    });
  }),

  /* --------------------------- protected -------------------------- */

  http.get<PathParams, DefaultBodyType, ErrorBody | User>('/api/me', async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<User>(toPublicUser(auth.user));
  }),

  http.get('/api/balance', async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json(getBalanceFor(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | CardModel[]>('/api/cards', async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();
    return HttpResponse.json<CardModel[]>(getCardsFor(auth.user.id));
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | PaginatedResult<Transaction>>('/api/transactions', async ({ request }) => {
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

  http.get<PathParams, DefaultBodyType, ErrorBody | Transaction>('/api/transactions/:id', async ({ request, params }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    const tx = getTransactionById(auth.user.id, params.id as string);
    if (!tx) {
      return HttpResponse.json<ErrorBody>({ message: 'Transacción no encontrada' }, { status: 404 });
    }
    return HttpResponse.json<Transaction>(tx);
  }),

  http.get<PathParams, DefaultBodyType, ErrorBody | User[]>('/api/recipients', async ({ request }) => {
    const auth = requireAuth(request);
    if (isAuthFailure(auth)) return auth;
    await realisticDelay();

    return HttpResponse.json<User[]>(getOtherUsers(auth.user.id));
  }),

  http.post<PathParams, DefaultBodyType, ErrorBody | Transaction>('/api/transfers', async ({ request }) => {
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

  http.patch<PathParams, DefaultBodyType, ErrorBody | User>('/api/profile', async ({ request }) => {
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
];

/**
 * Extra handlers for failure-path tests — NOT registered by default.
 * Use e.g. `server.use(...errorHandlers)` inside a specific test.
 */
export const errorHandlers = [
  http.get('/api/balance', () => {
    return HttpResponse.json<ErrorBody>({ message: 'Error interno del servidor' }, { status: 500 });
  }),
  http.get('/api/transactions', () => {
    return HttpResponse.json<ErrorBody>({ message: 'Error interno del servidor' }, { status: 500 });
  }),
];
