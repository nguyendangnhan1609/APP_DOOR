import type { C_API } from '../constants';
import type { TOption } from './option';

/**
 * Represents the configuration options for retrieving data from a table.
 */
export type TApi<T> = {
  readonly keyApi?: keyof typeof C_API;
  readonly method?: string;
  readonly format?: (item: T) => TOption;
  readonly params?: (props: {
    fullTextSearch: string;
    value?: unknown | null;
  }) => Record<string, unknown>;
  readonly data?: () => T;
  readonly keepUnusedDataFor?: number;
};
