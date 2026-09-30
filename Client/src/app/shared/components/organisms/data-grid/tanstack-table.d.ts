import '@tanstack/angular-table';

import type { ETableAlign, ETableFilterType } from '@/shared/enums';

declare module '@tanstack/angular-table' {
  interface ColumnMeta<TData extends RowData> {
    onCell?: (data: TData) => { className?: string; rowSpan?: number; style?: CSSProperties };
    sorter?: boolean;
    align?: ETableAlign;
    filter?: ETableFilterType;
    isHeaderHide?: boolean;
    isDateTime?: boolean;
  }

  interface FilterFns {
    global: FilterFn<unknown>;
    blank: FilterFn<unknown>;
    notBlank: FilterFn<unknown>;
    includeText: FilterFn<unknown>;
    notIncludeText: FilterFn<unknown>;
    startText: FilterFn<unknown>;
    endText: FilterFn<unknown>;
    sameText: FilterFn<unknown>;
    sameDate: FilterFn<unknown>;
    beforeDate: FilterFn<unknown>;
    afterDate: FilterFn<unknown>;
    greaterNumber: FilterFn<unknown>;
    greaterEqualNumber: FilterFn<unknown>;
    lessNumber: FilterFn<unknown>;
    lessEqualNumber: FilterFn<unknown>;
    equalNumber: FilterFn<unknown>;
    notEqualNumber: FilterFn<unknown>;
    middleNumber: FilterFn<unknown>;
    notMiddleNumber: FilterFn<unknown>;
  }
}
