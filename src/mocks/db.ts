import type { Balance, CardModel, Transaction, User } from '@/shared/types';

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
      { id: 'c-001', label: 'Nómina', last4: '4821', holder: 'ALEX NOVA', expiry: '09/28', gradient: 'lime' },
      { id: 'c-002', label: 'Ahorro', last4: '9374', holder: 'ALEX NOVA', expiry: '02/27', gradient: 'violet' },
      { id: 'c-003', label: 'Viajes', last4: '1150', holder: 'ALEX NOVA', expiry: '11/26', gradient: 'mono' },
    ],
  ],
  ['u-002', [{ id: 'c-004', label: 'Personal', last4: '6620', holder: 'MARIA TORRES', expiry: '05/27', gradient: 'violet' }]],
  ['u-003', [{ id: 'c-005', label: 'Personal', last4: '3088', holder: 'DIEGO RAMOS', expiry: '08/28', gradient: 'mono' }]],
]);

export function getCardsFor(userId: string): CardModel[] {
  return cardsByUser.get(userId) ?? [];
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
