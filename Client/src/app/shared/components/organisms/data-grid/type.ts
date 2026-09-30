import type { ColumnDef, ColumnPinningState, FilterFn, Table } from '@tanstack/angular-table';
import type { Virtualizer } from '@tanstack/angular-virtual';

/**
 * Represents the properties for the button component.
 */
type Props<TData> = {
  readonly isLoading?: boolean;
  readonly handleExpand?: (row: TData) => void;

  readonly columns: ColumnDef<TData>[];
  readonly data?: TData[];
  readonly handleChange?: (table: Table<TData>) => void;
  readonly filterGlobal?: FilterFn<TData>;
  readonly header?: {
    readonly width?: number;
    readonly maxWidth?: number;
    readonly pinning?: ColumnPinningState;
    readonly isNotResizing?: boolean;
    readonly isNotRightClick?: boolean;
  };
  readonly body?: {
    readonly isExpanded?: boolean;
    readonly height?: number;
    readonly ids?: string[];
    readonly handleDoubleClick?: (id: string) => void;
    readonly handleClick?: (props: { ids: string[]; id: string }) => void;
    readonly checkbox?: {
      readonly handleChange?: (ids: string[]) => void;
      readonly width?: number;
      readonly isAsynchronous?: boolean;
    };
  };
  readonly pagination?: {
    readonly total?: number;
    readonly perPage?: number;
    readonly page?: number;
    readonly handleChange?: (props: { page: number; perPage: number }) => void;
    readonly description?: (from: number, to: number, total: number) => string;
  };

  readonly keyId: string;
  readonly className?: string;
  readonly defaultColumn?: Partial<ColumnDef<TData>>;
  readonly handleScroll?: (props: {
    readonly table: Table<TData>;
    readonly columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
    readonly rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
    readonly event: Event;
  }) => void;
  readonly translate: (key: string, options?: Record<string, string>) => string;
};
export default Props;
