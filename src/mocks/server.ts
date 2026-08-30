import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW server for Jest / node test environments. */
export const server = setupServer(...handlers);
