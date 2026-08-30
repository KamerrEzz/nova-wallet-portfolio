import type {
  Balance,
  CardModel,
  Goal,
  Investment,
  NotificationItem,
  SpendingInsight,
  Transaction,
  User,
  Vault,
} from '@/shared/types';

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export interface StoredUser extends User {
  password: string;
}

const users: StoredUser[] = [
  {
    id: 'u-001',
    name: 'Alex Nova',
    email: 'demo@nova.app',
    password: 'demo1234',
    avatarUrl: 'https://i.pravatar.cc/150?u=demo@nova.app',
  },
  {
    id: 'u-002',
    name: 'María Torres',
    email: 'maria@nova.app',
    password: 'maria1234',
    avatarUrl: 'https://i.pravatar.cc/150?u=maria@nova.app',
  },
  {
    id: 'u-003',
    name: 'Diego Ramos',
    email: 'diego@nova.app',
    password: 'diego1234',
    avatarUrl: 'https://i.pravatar.cc/150?u=diego@nova.app',
  },
];

/** Strip the password before exposing a user through the API. */
export function toPublicUser(user: StoredUser): User {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id);
}

export function createUser(name: string, email: string, password: string): StoredUser {
  const user: StoredUser = {
    id: `u-${String(users.length + 1).padStart(3, '0')}`,
    name,
    email: email.trim().toLowerCase(),
    password,
    avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email.trim().toLowerCase())}`,
  };
  users.push(user);
  return user;
}

export function getOtherUsers(excludeUserId: string): User[] {
  return users.filter((u) => u.id !== excludeUserId).map(toPublicUser);
}

export function updateUser(
  id: string,
  patch: Partial<Pick<User, 'name' | 'avatarUrl'>>,
): StoredUser | undefined {
  const user = findUserById(id);
  if (!user) return undefined;
  if (patch.name !== undefined) user.name = patch.name;
  if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl;
  return user;
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

const cardsByUser = new Map<string, CardModel[]>([
  [
    'u-001',
    [
      {
        id: 'c-001',
        label: 'Nómina',
        last4: '4821',
        holder: 'ALEX NOVA',
        expiry: '09/28',
        gradient: 'lime',
        type: 'physical',
        status: 'active',
        dailyLimit: 1200,
        monthlyLimit: 8000,
        contactless: true,
        onlinePayments: true,
      },
      {
        id: 'c-002',
        label: 'Ahorro',
        last4: '9374',
        holder: 'ALEX NOVA',
        expiry: '02/27',
        gradient: 'violet',
        type: 'physical',
        status: 'active',
        dailyLimit: 800,
        monthlyLimit: 4000,
        contactless: true,
        onlinePayments: true,
      },
      {
        id: 'c-003',
        label: 'Viajes',
        last4: '1150',
        holder: 'ALEX NOVA',
        expiry: '11/26',
        gradient: 'mono',
        type: 'virtual',
        status: 'frozen',
        dailyLimit: 500,
        monthlyLimit: 2000,
        contactless: false,
        onlinePayments: true,
      },
    ],
  ],
  [
    'u-002',
    [
      {
        id: 'c-004',
        label: 'Personal',
        last4: '6620',
        holder: 'MARIA TORRES',
        expiry: '05/27',
        gradient: 'violet',
        type: 'physical',
        status: 'active',
        dailyLimit: 600,
        monthlyLimit: 3000,
        contactless: true,
        onlinePayments: true,
      },
    ],
  ],
  [
    'u-003',
    [
      {
        id: 'c-005',
        label: 'Personal',
        last4: '3088',
        holder: 'DIEGO RAMOS',
        expiry: '08/28',
        gradient: 'mono',
        type: 'physical',
        status: 'active',
        dailyLimit: 500,
        monthlyLimit: 2500,
        contactless: true,
        onlinePayments: true,
      },
    ],
  ],
]);

export function getCardsFor(userId: string): CardModel[] {
  return cardsByUser.get(userId) ?? [];
}

export function getCardById(userId: string, cardId: string): CardModel | undefined {
  return getCardsFor(userId).find((card) => card.id === cardId);
}

export function createCard(userId: string, input: Partial<CardModel>): CardModel {
  const cards = cardsByUser.get(userId) ?? [];
  const user = findUserById(userId);
  const card: CardModel = {
    id: `c-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 1000)}`,
    label: input.label ?? 'Nueva tarjeta',
    last4: String(Math.floor(1000 + Math.random() * 9000)),
    holder: (user?.name ?? 'USUARIO').toUpperCase(),
    expiry: '12/29',
    gradient: input.gradient ?? 'violet',
    type: input.type ?? 'virtual',
    status: 'active',
    dailyLimit: input.dailyLimit ?? 500,
    monthlyLimit: input.monthlyLimit ?? 2000,
    contactless: input.contactless ?? true,
    onlinePayments: input.onlinePayments ?? true,
  };
  cards.push(card);
  cardsByUser.set(userId, cards);
  return card;
}

export function updateCard(userId: string, cardId: string, patch: Partial<CardModel>): CardModel | undefined {
  const cards = cardsByUser.get(userId);
  if (!cards) return undefined;
  const card = cards.find((c) => c.id === cardId);
  if (!card) return undefined;
  Object.assign(card, patch);
  return card;
}

/* ------------------------------------------------------------------ */
/* Transactions (deterministic, seeded)                                */
/* ------------------------------------------------------------------ */

/** Mulberry32 — small seeded PRNG so generated data is stable across runs/tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CURRENCY = 'EUR';

export const TRANSACTION_CATEGORIES = [
  'comida',
  'transporte',
  'hogar',
  'ocio',
  'salud',
  'ingresos',
  'transferencias',
] as const;

const EXPENSE_TITLES: Record<string, string[]> = {
  comida: ['Mercadona', 'Cafetería Central', 'Restaurante La Huerta', 'Glovo', 'Panadería Sol'],
  transporte: ['Metro de Madrid', 'Cabify', 'Repsol', 'BiciMAD', 'Renfe'],
  hogar: ['IKEA', 'Iberdrola', 'Movistar', 'Leroy Merlin', 'Amazon'],
  ocio: ['Netflix', 'Spotify', 'Cines Yelmo', 'Steam', 'FNAC'],
  salud: ['Farmacia López', 'Gimnasio Basic-Fit', 'Dentista Clínica Norte'],
};

const transactions: Transaction[] = [];
const txOwner = new Map<string, string>();
let txCounter = 0;

function pushTransaction(
  userId: string,
  partial: Omit<Transaction, 'id' | 'currency'>,
): Transaction {
  txCounter += 1;
  const tx: Transaction = {
    id: `t-${String(txCounter).padStart(4, '0')}`,
    currency: CURRENCY,
    ...partial,
  };
  transactions.push(tx);
  txOwner.set(tx.id, userId);
  return tx;
}

function seedTransactions(): void {
  const now = new Date();
  const rand = mulberry32(20240829);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
  const expenseCategories = ['comida', 'transporte', 'hogar', 'ocio', 'salud'] as const;

  // ~120 transactions for the demo user over the last 90 days.
  // Salary income lands near day 25 of each of the last 3 months.
  // Amounts are tuned so the demo balance lands clearly positive (~+4.500€),
  // keeping the transfers demo usable.
  const salaryDaysAgo = [25, 55, 85];
  for (const daysAgo of salaryDaysAgo) {
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    pushTransaction('u-001', {
      title: 'Nómina NOVA Labs',
      category: 'ingresos',
      amount: 3000,
      date: date.toISOString(),
      status: 'completed',
      counterparty: 'NOVA Labs SL',
    });
  }

  const expenseCount = 120 - salaryDaysAgo.length;
  for (let i = 0; i < expenseCount; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const hoursOffset = Math.floor(rand() * 24);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursOffset * 60 * 60 * 1000);

    // ~10% of expenses are transfers to the other seeded users.
    const isTransfer = rand() < 0.1;
    const category = isTransfer ? 'transferencias' : pick(expenseCategories);
    const title = isTransfer
      ? `Transferencia a ${pick(['María Torres', 'Diego Ramos'])}`
      : pick(EXPENSE_TITLES[category]);
    const amount = isTransfer
      ? -(20 + Math.floor(rand() * 120))
      : -(3 + Math.floor(rand() * 6000) / 100);

    const roll = rand();
    const status: Transaction['status'] = roll < 0.9 ? 'completed' : roll < 0.97 ? 'pending' : 'failed';

    pushTransaction('u-001', {
      title,
      category,
      amount: Math.round(amount * 100) / 100,
      date: date.toISOString(),
      status,
      ...(isTransfer ? { counterparty: title.replace('Transferencia a ', '') } : {}),
    });
  }

  // One incoming transfer on the recipient side so her history shows activity too.
  pushTransaction('u-002', {
    title: 'Transferencia de Alex Nova',
    category: 'transferencias',
    amount: 50,
    date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    counterparty: 'Alex Nova',
  });
}

seedTransactions();

/* ------------------------------------------------------------------ */
/* Queries / mutations                                                 */
/* ------------------------------------------------------------------ */

export interface TransactionFilters {
  search?: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
  /** ISO date (inclusive lower bound). */
  from?: string;
  /** ISO date (inclusive upper bound). */
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function isOwnedBy(tx: Transaction, userId: string): boolean {
  return txOwner.get(tx.id) === userId;
}

export function getTransactionsFor(
  userId: string,
  filters: TransactionFilters = {},
): PaginatedResult<Transaction> {
  const {
    search,
    type = 'all',
    category,
    from,
    to,
    page = 1,
    pageSize = 10,
  } = filters;

  let result = transactions.filter((tx) => isOwnedBy(tx, userId));

  if (search) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.counterparty?.toLowerCase().includes(q) ?? false),
    );
  }
  if (type !== 'all') {
    result = result.filter((tx) => (type === 'income' ? tx.amount > 0 : tx.amount < 0));
  }
  if (category) {
    result = result.filter((tx) => tx.category === category);
  }
  if (from) {
    const fromTime = new Date(from).getTime();
    result = result.filter((tx) => new Date(tx.date).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    result = result.filter((tx) => new Date(tx.date).getTime() <= toTime);
  }

  result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = result.length;
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: result.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export function getTransactionById(userId: string, id: string): Transaction | undefined {
  return transactions.find((tx) => tx.id === id && isOwnedBy(tx, userId));
}

export function getBalanceFor(userId: string): Balance {
  const owned = transactions.filter((tx) => tx.status !== 'failed' && isOwnedBy(tx, userId));
  const total = owned.reduce((sum, tx) => sum + tx.amount, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const monthNet = owned
    .filter((tx) => new Date(tx.date).getTime() >= monthStart)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const prevMonthNet = owned
    .filter((tx) => {
      const t = new Date(tx.date).getTime();
      return t >= prevMonthStart && t < monthStart;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyChangePct =
    prevMonthNet === 0
      ? 0
      : Math.round(((monthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 1000) / 10;

  return {
    total: Math.round(total * 100) / 100,
    currency: CURRENCY,
    monthlyChangePct,
  };
}

export interface NewTransactionInput {
  title: string;
  category: string;
  amount: number;
  status?: Transaction['status'];
  counterparty?: string;
  date?: string;
}

export function addTransaction(userId: string, input: NewTransactionInput): Transaction {
  return pushTransaction(userId, {
    title: input.title,
    category: input.category,
    amount: input.amount,
    date: input.date ?? new Date().toISOString(),
    status: input.status ?? 'completed',
    ...(input.counterparty ? { counterparty: input.counterparty } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* Vaults & Goals                                                       */
/* ------------------------------------------------------------------ */

const vaultsByUser = new Map<string, Vault[]>([
  [
    'u-001',
    [
      {
        id: 'v-001',
        name: 'Vacaciones Japón',
        targetAmount: 4000,
        currentAmount: 1250.5,
        currency: 'EUR',
        icon: '✈️',
        color: '#c6f24e',
        createdAt: '2025-11-10T09:00:00.000Z',
        locked: false,
      },
      {
        id: 'v-002',
        name: 'Fondo de emergencia',
        targetAmount: 10000,
        currentAmount: 4300,
        currency: 'EUR',
        icon: '🛡️',
        color: '#7c6cff',
        createdAt: '2025-08-01T12:00:00.000Z',
        locked: false,
      },
      {
        id: 'v-003',
        name: 'Nuevo portátil',
        currentAmount: 890,
        currency: 'EUR',
        icon: '💻',
        color: '#4ade80',
        createdAt: '2026-01-15T10:30:00.000Z',
        locked: false,
      },
    ],
  ],
]);

const goalsByUser = new Map<string, Goal[]>([
  [
    'u-001',
    [
      {
        id: 'g-001',
        vaultId: 'v-001',
        name: 'Vuelos + hotel',
        targetAmount: 2500,
        targetDate: '2026-12-15T00:00:00.000Z',
        autoRule: 'roundup',
      },
      {
        id: 'g-002',
        vaultId: 'v-002',
        name: 'Cobertura 3 meses',
        targetAmount: 10000,
        targetDate: '2027-06-30T00:00:00.000Z',
        autoRule: 'percentage',
        autoValue: 10,
      },
    ],
  ],
]);

export function getVaultsFor(userId: string): Vault[] {
  return vaultsByUser.get(userId) ?? [];
}

export function createVault(userId: string, input: Partial<Vault>): Vault {
  const vaults = vaultsByUser.get(userId) ?? [];
  const vault: Vault = {
    id: `v-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 1000)}`,
    name: input.name ?? 'Nueva bóveda',
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount ?? 0,
    currency: input.currency ?? 'EUR',
    icon: input.icon,
    color: input.color,
    createdAt: new Date().toISOString(),
    locked: input.locked ?? false,
  };
  vaults.push(vault);
  vaultsByUser.set(userId, vaults);
  return vault;
}

export function updateVault(userId: string, vaultId: string, patch: Partial<Vault>): Vault | undefined {
  const vaults = vaultsByUser.get(userId);
  if (!vaults) return undefined;
  const vault = vaults.find((v) => v.id === vaultId);
  if (!vault) return undefined;
  Object.assign(vault, patch);
  return vault;
}

export function transferToVault(userId: string, vaultId: string, amount: number): Vault | undefined {
  const vault = updateVault(userId, vaultId, {
    currentAmount: (getVaultById(userId, vaultId)?.currentAmount ?? 0) + amount,
  });
  if (!vault) return undefined;

  // Register the movement as a transaction so it appears in history.
  addTransaction(userId, {
    title: `Ahorro en ${vault.name}`,
    category: 'transferencias',
    amount: -Math.abs(amount),
    status: 'completed',
    counterparty: vault.name,
  });

  return vault;
}

export function getVaultById(userId: string, vaultId: string): Vault | undefined {
  return getVaultsFor(userId).find((v) => v.id === vaultId);
}

export function getGoalsFor(userId: string): Goal[] {
  return goalsByUser.get(userId) ?? [];
}

export function createGoal(userId: string, input: Partial<Goal>): Goal {
  const goals = goalsByUser.get(userId) ?? [];
  const goal: Goal = {
    id: `g-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 1000)}`,
    vaultId: input.vaultId ?? '',
    name: input.name ?? 'Nueva meta',
    targetAmount: input.targetAmount ?? 1000,
    targetDate: input.targetDate ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    autoRule: input.autoRule,
    autoValue: input.autoValue,
  };
  goals.push(goal);
  goalsByUser.set(userId, goals);
  return goal;
}

/* ------------------------------------------------------------------ */
/* Investments                                                          */
/* ------------------------------------------------------------------ */

const investmentsByUser = new Map<string, Investment[]>([
  [
    'u-001',
    [
      {
        id: 'i-001',
        symbol: 'VWCE',
        name: 'Vanguard FTSE All-World ETF',
        type: 'etf',
        quantity: 14,
        avgPrice: 118.4,
        currentPrice: 124.85,
        change24hPct: 0.42,
      },
      {
        id: 'i-002',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: 6,
        avgPrice: 178.2,
        currentPrice: 214.3,
        change24hPct: 1.24,
      },
      {
        id: 'i-003',
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        quantity: 0.028,
        avgPrice: 58000,
        currentPrice: 67400,
        change24hPct: 2.85,
      },
      {
        id: 'i-004',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        type: 'stock',
        quantity: 3,
        avgPrice: 402.1,
        currentPrice: 428.6,
        change24hPct: -0.38,
      },
    ],
  ],
]);

export function getInvestmentsFor(userId: string): Investment[] {
  return investmentsByUser.get(userId) ?? [];
}

export function getPortfolioPerformance(userId: string): { date: string; value: number }[] {
  const now = new Date();
  const result: { date: string; value: number }[] = [];
  // Derive the PRNG seed from the user id so each user gets a different but stable curve.
  const seed = Array.from(userId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rand = mulberry32(20250115 + seed);
  const baseValue = 4200;

  for (let i = 89; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const drift = 1 + (rand() - 0.45) * 0.012;
    const prev = result[result.length - 1]?.value ?? baseValue;
    result.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(prev * drift * 100) / 100,
    });
  }

  return result;
}

export function getSpendingInsight(userId: string): SpendingInsight {
  const owned = transactions.filter((tx) => tx.status === 'completed' && isOwnedBy(tx, userId) && tx.amount < 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const currentMonth = owned.filter((tx) => new Date(tx.date).getTime() >= monthStart);
  const prevMonth = owned.filter((tx) => {
    const t = new Date(tx.date).getTime();
    return t >= prevMonthStart && t < monthStart;
  });

  const totalSpent = Math.round(currentMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) * 100) / 100;
  const prevTotal = Math.round(prevMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) * 100) / 100;

  const byCategory: Record<string, number> = {};
  for (const tx of currentMonth) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + Math.abs(tx.amount);
  }

  return {
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    totalSpent,
    byCategory,
    vsPreviousPeriodPct: prevTotal === 0 ? 0 : Math.round(((totalSpent - prevTotal) / prevTotal) * 1000) / 10,
  };
}

/* ------------------------------------------------------------------ */
/* Notifications                                                        */
/* ------------------------------------------------------------------ */

const notificationsByUser = new Map<string, NotificationItem[]>([
  [
    'u-001',
    [
      {
        id: 'n-001',
        type: 'security',
        title: 'Nuevo inicio de sesión',
        body: 'Se ha detectado un acceso desde un dispositivo Windows en Madrid.',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'n-002',
        type: 'transaction',
        title: 'Transferencia recibida',
        body: 'María Torres te ha enviado 50,00 €.',
        read: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/app/transactions',
      },
      {
        id: 'n-003',
        type: 'promo',
        title: 'Nueva funcionalidad: Inversiones',
        body: 'Ya puedes seguir tu portafolio de inversiones desde NOVA.',
        read: true,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/app/investments',
      },
      {
        id: 'n-004',
        type: 'system',
        title: 'Mantenimiento programado',
        body: 'El 15 de agosto a las 03:00 habrá una ventana de mantenimiento de 15 minutos.',
        read: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'n-005',
        type: 'transaction',
        title: 'Pago rechazado',
        body: 'Tu pago de 89,99 € en Glovo no se pudo completar por fondos insuficientes.',
        read: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/app/transactions',
      },
    ],
  ],
]);

export function getNotificationsFor(userId: string): NotificationItem[] {
  return notificationsByUser.get(userId) ?? [];
}

export function markNotificationRead(userId: string, notificationId: string): NotificationItem | undefined {
  const list = notificationsByUser.get(userId);
  if (!list) return undefined;
  const notification = list.find((n) => n.id === notificationId);
  if (!notification) return undefined;
  notification.read = true;
  return notification;
}

export function markAllNotificationsRead(userId: string): void {
  const list = notificationsByUser.get(userId);
  if (!list) return;
  for (const n of list) n.read = true;
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

export function exportTransactionsCsv(userId: string): string {
  const owned = transactions.filter((tx) => isOwnedBy(tx, userId));
  const header = 'id,title,category,amount,currency,date,status,counterparty\n';
  const rows = owned
    .map((tx) =>
      [
        tx.id,
        `"${tx.title.replace(/"/g, '""')}"`,
        tx.category,
        tx.amount,
        tx.currency,
        tx.date,
        tx.status,
        tx.counterparty ? `"${tx.counterparty.replace(/"/g, '""')}"` : '',
      ].join(','),
    )
    .join('\n');
  return header + rows;
}
