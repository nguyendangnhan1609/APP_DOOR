import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EffectRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  flexRenderComponent,
  type AccessorKeyColumnDef,
  type ColumnDef,
  type ColumnPinningState,
  type FilterFn,
  type Table,
} from '@tanstack/angular-table';

import { CommonModule } from '@angular/common';
import { AngularVirtualizer } from '@tanstack/angular-virtual';
import Spin from '../../molecules/spin/spin.component';
import TTable from './table/table.component';
import templates from './templates';
import utils from './utils';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, Spin, TTable],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="data-grid" #refOuterDiv>
      <app-spin [isLoading]="!!isLoading()">
        <app-t-table
          #refTable
          *ngIf="!!stateDataGrid().columns && !!data() && pageSize() > 0"
          [data]="data()!"
          [columns]="stateDataGrid().columns"
          [isFilter]="isFilter()"
          [maxSize]="maxSize()"
          [pageSize]="pageSize()"
          [body]="body()"
          [header]="header()"
          [filterGlobal]="filterGlobal()"
          [pagination]="pagination()"
          [keyId]="keyId()"
          [className]="className()"
          [defaultColumn]="defaultColumn()"
          [translate]="translate()"
          (handleScroll)="handleScroll.emit($event)"
          (handleChange)="fnOnChange($event)">
          <ng-container *ngIf="firstItemTpl()">
            <ng-template #firstItem>
              <ng-container *ngTemplateOutlet="firstItemTpl()!"></ng-container>
            </ng-template>
          </ng-container>
        </app-t-table>
      </app-spin>
    </div>
  `,
  styleUrls: ['./data-grid.component.scss'],
})
export default class DataGrid<TData> {
  readonly isLoading = input<boolean>();
  readonly handleExpand = output<TData>();

  readonly columns = input.required<ColumnDef<TData>[]>();
  readonly data = input<TData[]>();
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
  readonly keyId = input.required<string>();
  readonly className = input<string>();
  readonly defaultColumn = input<Partial<ColumnDef<TData>>>();
  readonly handleScroll = output<{
    readonly table: Table<TData>;
    readonly columnVirtualizer: AngularVirtualizer<HTMLElement, HTMLElement>;
    readonly rowVirtualizer: AngularVirtualizer<HTMLElement, HTMLElement>;
    readonly event: Event;
  }>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();
  readonly firstItemTpl = contentChild<TemplateRef<HTMLElement>>('firstItem');

  readonly refOuterDiv = viewChild<ElementRef<HTMLElement>>('refOuterDiv');
  readonly stateDataGrid = signal<{ columns: ColumnDef<TData>[] }>({ columns: [] });

  fnUpdateColumns = () => {
    setTimeout(() => {
      if (this.refOuterDiv()) {
        const originalColumns = [...this.columns()];
        if (this.body()?.isExpanded && originalColumns.length > 0) {
          originalColumns[0] = {
            ...originalColumns[0],
            cell: () =>
              flexRenderComponent(templates.ExpandedCell, {
                outputs: {
                  handleExpand: this.handleExpand.emit,
                },
              }),
            meta: originalColumns[0].meta ?? {},
          };
        }

        if (this.body()?.checkbox && !originalColumns.find(col => col.id === '_ROW_CHECKBOX_')) {
          originalColumns.unshift({
            id: '_ROW_CHECKBOX_',
            size: this.body()?.checkbox?.width ?? 44,
            header: () => flexRenderComponent(templates.CheckboxHeader),
            cell: () => flexRenderComponent(templates.CheckboxCell),
            meta: { isHeaderHide: true },
          });
        }
        const newColumns = originalColumns.map(column => this.fnFormatColumn({ column }));
        if (JSON.stringify(this.stateDataGrid().columns) !== JSON.stringify(newColumns)) {
          this.stateDataGrid.set({ columns: newColumns });
        }
      }
    }, 140);
  };

  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      if (this.columns()) {
        this.fnUpdateColumns();
      }
    });
    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
    });
  }

  fnFormatColumn = ({ column }: { column: ColumnDef<TData> }) => {
    if (column.meta?.isDateTime && !column.cell) {
      column.cell = () => flexRenderComponent(templates.DateCell);
    }

    return {
      ...column,
      id: column.id ?? (column as AccessorKeyColumnDef<TData>).accessorKey?.toString(),
      size: this.stateDataGrid().columns?.find(col => col.id === column.id)?.size ?? column.size,
    };
  };

  refTimeout?: ReturnType<typeof setTimeout> | undefined;
  fnOnChange = (table: Table<TData>) => {
    if (this.refTimeout) clearTimeout(this.refTimeout);
    this.refTimeout = setTimeout(() => {
      this.handleChange.emit(table);
    }, 200);
  };

  readonly isFilter = computed(
    () =>
      !!this.filterGlobal() ||
      this.columns().some(obj => obj.meta && Object.keys(obj.meta).includes('filter')),
  );
  readonly maxSize = computed(
    () =>
      this.header()?.maxWidth ??
      this.refOuterDiv()?.nativeElement?.getBoundingClientRect()?.width ??
      1200,
  );
  readonly pageSize = computed(
    () =>
      this.pagination()?.perPage ??
      utils.getSizePageByHeight({
        height: this.body()?.height,
        element: this.refOuterDiv()!.nativeElement,
      }),
  );

  readonly refTable = viewChild<Table<TData>>('refTable');
}
