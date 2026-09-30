import type { Table } from '@tanstack/angular-table';
import type { Virtualizer } from '@tanstack/angular-virtual';

import type { TTableState } from '@/shared/types';

type Props<TData> = {
  readonly table: Table<TData>;
  readonly columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  readonly setStateTanstack: (val: TTableState) => void;
  readonly stateTanstack: TTableState;
  readonly refVirtualPaddingLeft: number;
  readonly translate: (key: string, options?: Record<string, string>) => string;
};
export default Props;
