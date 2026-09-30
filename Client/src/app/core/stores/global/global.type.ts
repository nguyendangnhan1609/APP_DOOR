import type TStateAuth from '@/modules/auth/context/type';

/**
 * Represents the global state of the application.
 */
export type TStateGlobal = TStateAuth & {
  language?: string;
};
