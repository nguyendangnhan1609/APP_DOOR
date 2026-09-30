import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  EffectRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  Column,
  ColumnDef,
  ColumnPinningState,
  createAngularTable,
  FilterFn,
  Table,
  TableOptions,
} from '@tanstack/angular-table';
import {
  AngularVirtualizer,
  defaultRangeExtractor,
  injectVirtualizer,
  Range,
} from '@tanstack/angular-virtual';

import { ServiceTranslate } from '@/core/services';
import { EIcon } from '@/shared/enums';
import type { TTableState } from '@/shared/types';
import { generateRangeNumber } from '@/shared/utils';
import Icon from '../../../atoms/icon/icon.component';
import Pagination from '../../../molecules/pagination/pagination.component';
import utils from '../utils';
import TableBody from './body/body.component';
import TableHeader from './header/header.component';

@Component({
  selector: 'app-t-table',
  standalone: true,
  imports: [CommonModule, Icon, Pagination, TableBody, TableHeader],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #refContainer
      [ngClass]="['overflow-auto', className()]"
      (scroll)="
        handleScroll.emit({
          event: $event,
          table: table(),
          columnVirtualizer: columnVirtualizer,
          rowVirtualizer: rowVirtualizer,
        })
      ">
      <ng-content select="[firstItem]"></ng-content>
      <table class="c-virtual-scroll" [ngStyle]="fnInitializeColumnSizes()">
        <ng-container *ngIf="table().getRowCount() > 0; else emptyState">
          <app-t-header
            [header]="header()"
            [table]="table()"
            [columnVirtualizer]="columnVirtualizer"
            [stateTanstack]="stateTanstack()"
            [refVirtualPaddingLeft]="refVirtualPaddingLeft"
            [translate]="translate()"
            [getCommonPinningStyles]="fnGetCommonPinningStyles"
            [isAsynchronous]="body()?.checkbox?.isAsynchronous"
            [refHeaderGroups]="refHeaderGroups"
            (setStateTanstack)="setStateTanstack($event)" />
          <app-t-body
            [body]="body()"
            [table]="table()"
            [columnVirtualizer]="columnVirtualizer"
            [refVirtualPaddingLeft]="refVirtualPaddingLeft"
            [getCommonPinningStyles]="fnGetCommonPinningStyles"
            [rowVirtualizer]="rowVirtualizer" />
        </ng-container>
        <ng-template #emptyState>
          <caption class="empty">
            <app-icon class="size-8" [name]="EIcon.Confirm" />
            <p>{{ t('NoSearchResultsFound') }}</p>
          </caption>
        </ng-template>
      </table>
    </div>
    <app-pagination
      *ngIf="pagination()"
      [total]="pagination()?.total ?? table().getRowCount()"
      [page]="pagination()?.page ?? table().getState().pagination.pageIndex + 1"
      [perPage]="pagination()?.perPage ?? pageSize()"
      [description]="pagination()?.description ?? defaultDescription"
      (handleChange)="fnChangePagination($event)" />
  `,
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class TTable<TData> {
  EIcon = EIcon;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t(key: string, params?: Record<string, string>) {
    return this.#serviceTranslate?.t()(key, params);
  }
  defaultDescription = (from: number, to: number, total: number) => `${from} - ${to} of ${total}`;

  readonly columns = input<ColumnDef<TData>[]>([]);
  readonly data = input<TData[]>([]);
  readonly handleChange = output<Table<TData>>();
  readonly filterGlobal = input<FilterFn<TData>>();
  readonly header = input<{
    readonly width?: number;
    readonly maxWidth?: number;
    readonly pinning?: ColumnPinningState;
    readonly isNotResizing?: boolean;
    readonly isNotRightClick?: boolean;
  }>();
  readonly body = input<{
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
  }>();
  readonly pagination = input<{
    readonly total?: number;
    readonly perPage?: number;
    readonly page?: number;
    readonly handleChange?: (props: { page: number; perPage: number }) => void;
    readonly description?: (from: number, to: number, total: number) => string;
  }>();

  readonly keyId = input<string>('id');
  readonly className = input<string>();
  readonly defaultColumn = input<Partial<ColumnDef<TData>>>();
  readonly handleScroll = output<{
    readonly table: Table<TData>;
    readonly columnVirtualizer: AngularVirtualizer<HTMLElement, HTMLElement>;
    readonly rowVirtualizer: AngularVirtualizer<HTMLElement, HTMLElement>;
    readonly event: Event;
  }>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();

  readonly pageSize = input<number>(0);
  readonly maxSize = input<number>(0);
  readonly isFilter = input<boolean>(false);
  readonly firstItemTpl = contentChild<TemplateRef<HTMLElement>>('firstItem');

  readonly stateTanstack = signal<TTableState>({
    globalFilter: '',
    columnFilters: [],
    sorting: [],
    columnVisibility: {},
    rowSelection:
      this.body()?.ids?.reduce((acc: Record<string, boolean>, id: string) => {
        acc[id] = true;
        return acc;
      }, {}) ?? {},
    expanded: {},
    pagination: {
      pageIndex: 0,
      pageSize: this.pageSize(),
    },
    columnPinning: this.header()?.pinning ?? {},
  });

  setStateTanstack = (val: TTableState) => {
    this.stateTanstack.set({ ...this.stateTanstack(), ...val });
  };

  readonly table = createAngularTable<TData>(() => ({
    ...utils.generateOption<TData>({
      columns: this.columns(),
      data: this.data(),
      filterGlobal: this.filterGlobal(),
      header: this.header(),
      body: this.body(),
      isPagination: !!this.pagination(),
      keyId: this.keyId(),
      maxSize: this.maxSize(),
      isFilter: this.isFilter(),
      stateTanstack: this.stateTanstack(),
      setStateTanstack: this.setStateTanstack,
    }),
    defaultColumn: this.defaultColumn(),
  }));

  refTimeout: number | undefined;
  fnZoom = (event: string) => {
    if (this.refTimeout) clearTimeout(this.refTimeout);
    this.refTimeout = window.setTimeout(() => {
      if (event !== 'mouseup' || this.stateTanstack().isDragResize) {
        this.setStateTanstack({
          ...this.stateTanstack(),
          isRerender: !this.stateTanstack().isRerender,
        });
      }
    }, 100);
  };

  readonly #fnEffectZoom: EffectRef;
  readonly #fnEffectFilter: EffectRef;
  readonly #fnEffectRowSelection: EffectRef;
  readonly #destroyRef = inject(DestroyRef);

  refHeaderGroups = this.table.getHeaderGroups();
  isFirstLoad = false;
  readonly #fnEffectTable: EffectRef;
  constructor() {
    this.#fnEffectZoom = effect(() => {
      this.fnZoom('init');
      window.addEventListener('resize', () => this.fnZoom('zoom'));
      window.addEventListener('mouseup', () => this.fnZoom('mouseup'));
    });
    this.#fnEffectFilter = effect(() => {
      if (this.stateTanstack().columnFilters || this.stateTanstack().globalFilter) {
        this.handleChange.emit(this.table);
        if (this.refTimeout) clearTimeout(this.refTimeout);
        this.refTimeout = window.setTimeout(() => {
          this.setStateTanstack({
            ...this.stateTanstack(),
            isRerender: !this.stateTanstack().isRerender,
          });
        }, 100);
      }
    });
    this.#fnEffectRowSelection = effect(() => {
      if (this.body()?.checkbox?.handleChange) {
        this.body()!.checkbox!.handleChange!(Object.keys(this.stateTanstack().rowSelection));
      }
    });
    this.#fnEffectTable = effect(() => {
      const option: TableOptions<TData> = this.table.options;
      if (option.columns !== this.columns()) {
        this.refHeaderGroups = this.table.getHeaderGroups();
      }
      if (!this.isFirstLoad) {
        this.setStateTanstack({
          ...this.stateTanstack(),
          rowSelection:
            this.body()?.ids?.reduce((acc: Record<string, boolean>, id: string) => {
              acc[id] = true;
              return acc;
            }, {}) ?? {},
          pagination: {
            pageIndex: 0,
            pageSize: this.pageSize() ?? 0,
          },
          columnPinning: this.header()?.pinning ?? {},
        });

        if (this.pagination()) {
          setTimeout(() => this.table.setPageSize(this.pageSize()));
        }

        this.isFirstLoad = true;
      } else {
        this.table.setOptions({
          ...this.table.options,
          columns: this.columns(),
          data: this.data(),
        });
      }
    });

    this.#destroyRef.onDestroy(() => {
      this.#fnEffectZoom.destroy();
      window.removeEventListener('resize', () => this.fnZoom('zoom'));
      window.removeEventListener('mouseup', () => this.fnZoom('mouseup'));

      this.#fnEffectFilter.destroy();
      this.#fnEffectRowSelection.destroy();
      this.#fnEffectTable.destroy();
    });
  }

  readonly refContainer = viewChild<ElementRef<HTMLElement>>('refContainer');
  readonly rowVirtualizer = injectVirtualizer(() => ({
    count: this.table().getRowModel().rows?.length ?? 0,
    scrollElement: this.refContainer(),
    estimateSize: () => this.body()?.height ?? 28,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element: HTMLElement) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  }));

  readonly columnVirtualizer = injectVirtualizer(() => ({
    horizontal: true,
    count: this.table().getVisibleLeafColumns().length,
    scrollElement: this.refContainer(),
    estimateSize: (index: number) => this.table().getVisibleLeafColumns()[index].getSize(),
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element: HTMLElement) => element?.getBoundingClientRect().width
        : undefined,
    rangeExtractor: (range: Range) => {
      const { columnPinning } = this.stateTanstack();
      return [
        ...generateRangeNumber({
          start: columnPinning?.left?.length ? 0 : undefined,
          end: columnPinning?.left?.length ? columnPinning.left.length - 1 : undefined,
        }),
        ...defaultRangeExtractor(range),
        ...generateRangeNumber({
          start: this.table().getVisibleLeafColumns().length - (columnPinning?.right ?? []).length,
          end: columnPinning?.right?.length
            ? this.table().getVisibleLeafColumns().length - 1
            : undefined,
        }),
      ]
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort((a, b) => a - b);
    },
  }));

  refFirstResizing = false;
  fnInitializeColumnSizes = computed(() => {
    if (this.stateTanstack().isDragResize && !this.refFirstResizing) {
      this.refFirstResizing = true;
      this.table().setOptions({
        ...this.table().options,
        columns: this.columns().map(c => {
          c.size ??=
            this.refContainer()?.nativeElement?.querySelector(`th#${c.id}`)?.getBoundingClientRect()
              .width ?? 0;
          return c;
        }),
        data: this.data() ?? [],
      });
    }
    const headers = this.table().getFlatHeaders();
    const colSizes: Record<string, number | string> = {
      width: !this.stateTanstack().isDragResize ? '100%' : this.table().getTotalSize() + 'px',
    };

    const arrayWidthColumn = this.columns().map(column => column.size ?? 0);
    const totalWidthColumns = arrayWidthColumn.reduce((prve, next) => prve + next, 0);
    const width = this.refContainer()?.nativeElement?.getBoundingClientRect().width ?? 0;
    const percentCell =
      (((width - totalWidthColumns) / width) * 100) / arrayWidthColumn.filter(c => !c).length + '%';

    for (const header of headers) {
      let headerSize = '';
      let colSize = '';
      if (!this.stateTanstack().isDragResize) {
        const size = this.columns().find(c => c.id === header.id)?.size;
        headerSize = size ? size + 'px' : percentCell;
        colSize = size ? size + 'px' : percentCell;
      } else {
        headerSize = header.getSize() + 'px';
        colSize = header.column.getSize() + 'px';
      }

      colSizes[`--header-${header.id.replaceAll(' ', '-')}-size`] = headerSize;
      colSizes[`--col-${header.column.id.replaceAll(' ', '-')}-size`] = colSize;
    }

    return colSizes;
  });

  fnGetCommonPinningStyles = (column: Column<TData>): Partial<CSSStyleDeclaration> => {
    if (!column) return {};
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');
    const styleRight = isFirstRightPinnedColumn ? '4px 0 4px -4px gray inset' : undefined;
    return {
      boxShadow: isLastLeftPinnedColumn ? '-4px 0 4px -4px gray inset' : styleRight,
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      borderLeft: isPinned === 'left' ? '1px solid #e0e0e0' : undefined,
      position: isPinned ? 'sticky' : 'relative',
      zIndex: isPinned ? '1' : '0',
    };
  };

  refVirtualPaddingLeft = utils.getPaddingLeft({
    old: 0,
    virtualColumns: this.columnVirtualizer.getVirtualItems(),
    pinLeft: this.stateTanstack().columnPinning?.left,
  });

  fnChangePagination({ perPage, page }: { perPage: number; page: number }) {
    this.table().setPagination({ pageIndex: page - 1, pageSize: perPage });
    this.pagination()?.handleChange?.({ perPage, page });
  }
}
