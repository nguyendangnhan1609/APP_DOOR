import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  EffectRef,
  ElementRef,
  inject,
  input,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { Cell, Column, FlexRenderDirective, Row, Table } from '@tanstack/angular-table';
import type { AngularVirtualizer, VirtualItem } from '@tanstack/angular-virtual';

@Component({
  selector: 'app-t-body',
  standalone: true,
  imports: [CommonModule, FlexRenderDirective],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tbody [style.height.px]="rowVirtualizer().getTotalSize() + 2">
      <ng-container *ngFor="let virtualRow of rowVirtualizer().getVirtualItems()">
        <tr
          #refRow
          *ngIf="fnGetRow(virtualRow) as row"
          [attr.data-item]="true"
          [ngClass]="{
            children: row.getParentRow(),
            'bg-warning-200': body()?.ids?.includes(row.id),
            'cursor-pointer': !!body()?.handleClick || body()?.handleDoubleClick,
            'round-checkbox': !body()?.checkbox?.isAsynchronous,
          }"
          [attr.data-index]="virtualRow.index"
          [style.transform]="'translateY(' + virtualRow.start + 'px)'">
          <td *ngIf="refVirtualPaddingLeft()" [style.width.px]="refVirtualPaddingLeft()"></td>
          <ng-container *ngFor="let vc of columnVirtualizer().getVirtualItems()">
            <td
              #refCell
              *ngIf="fnGetCell(row, vc) as cell"
              [attr.data-index]="vc.index"
              [ngClass]="fnGetCellClass(cell)"
              [ngStyle]="fnGetCellStyle(cell)"
              (mousedown)="fnClickRow(cell, row)"
              (dblclick)="cell.column.id !== 'rowSelection' && body()?.handleDoubleClick?.(row.id)">
              <ng-container
                *flexRender="cell.column.columnDef.cell; props: cell.getContext(); let content">
                <div [innerHTML]="content"></div>
              </ng-container>
            </td>
          </ng-container>
        </tr>
      </ng-container>
    </tbody>
  `,
})
export default class TBody<TData> {
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
  readonly table = input.required<Table<TData>>();
  readonly columnVirtualizer = input.required<AngularVirtualizer<HTMLElement, HTMLElement>>();
  readonly rowVirtualizer = input.required<AngularVirtualizer<HTMLElement, HTMLElement>>();
  readonly refVirtualPaddingLeft = input<number>();
  readonly getCommonPinningStyles = input<(col: Column<TData>) => Partial<CSSStyleDeclaration>>();

  readonly #fnMeasureRows: EffectRef;
  readonly refRows = viewChildren<ElementRef<HTMLDivElement>>('refRow');
  readonly #fnMeasureCells: EffectRef;
  readonly refCells = viewChildren<ElementRef<HTMLDivElement>>('refCell');
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnMeasureRows = effect(() =>
      this.refRows().forEach(el => {
        this.rowVirtualizer().measureElement(el.nativeElement);
      }),
    );

    this.#fnMeasureCells = effect(() =>
      this.refCells().forEach(el => {
        this.columnVirtualizer().measureElement(el.nativeElement);
      }),
    );

    this.#destroyRef.onDestroy(() => {
      this.#fnMeasureRows.destroy();
      this.#fnMeasureCells.destroy();
    });
  }

  fnGetRow = (virtualRow: VirtualItem): Row<TData> =>
    this.table().getRowModel().rows[virtualRow.index];

  fnGetCell = (row: Row<TData>, vc: VirtualItem): Cell<TData, unknown> =>
    row.getVisibleCells()[vc.index];

  fnGetCellClass = (cell: Cell<TData, unknown>) => {
    const attributes = cell?.column?.columnDef?.meta?.onCell
      ? cell?.column?.columnDef?.meta?.onCell(cell.row.original)
      : {};

    return [attributes?.className ?? '', cell?.column?.id === 'rowSelection' ? '!text-center' : ''];
  };

  fnGetCellStyle = (cell: Cell<TData, unknown>) => {
    const attributes = cell?.column?.columnDef?.meta?.onCell
      ? cell?.column?.columnDef?.meta?.onCell(cell.row.original)
      : {};
    if (cell?.column?.columnDef?.meta?.align && attributes.style)
      attributes.style.textAlign = cell?.column?.columnDef?.meta?.align;
    return {
      ...this.getCommonPinningStyles()?.(cell?.column),

      width: `var(--col-${cell?.column?.id}-size)`,
      height: this.body()?.height ?? 28,
      ...(attributes.style ?? { textAlign: cell?.column?.columnDef?.meta?.align }),
    };
  };

  refSelectedRow: string | undefined;
  fnClickRow = (cell: Cell<TData, unknown>, row: Row<TData>) => {
    const mouseEvent = window.event as MouseEvent | undefined;
    let ids: string[] = [row.id];
    if (!this.body()?.checkbox?.isAsynchronous) {
      let dataOld: Record<string, boolean>;
      this.table()?.setRowSelection(old => {
        if (dataOld) return dataOld;
        if (!mouseEvent?.shiftKey && !mouseEvent?.ctrlKey) {
          this.refSelectedRow = row.id;
          dataOld = { [row.id]: !row.getIsSelected() };
        } else if (mouseEvent?.ctrlKey) {
          this.refSelectedRow = row.id;
          dataOld = { ...old, [row.id]: !row.getIsSelected() };
        } else if (mouseEvent?.shiftKey) {
          if (this.refSelectedRow) {
            const index = this.table()
              .getRowModel()
              .rows.findIndex((r: Row<TData>) => r.id === this.refSelectedRow);
            const start = Math.min(index, row.index);
            const end = Math.max(index, row.index);
            const rows =
              start < end
                ? this.table()
                    .getRowModel()
                    .rows.slice(start, end + 1)
                : this.table()
                    .getRowModel()
                    .rows.slice(end, start - 1);
            dataOld = {};
            rows.forEach((r: Row<TData>) => {
              dataOld[r.id] = true;
            });
          } else {
            dataOld = { [row.id]: !row.getIsSelected() };
            this.refSelectedRow = row.id;
          }
        }
        return dataOld;
      });
    } else if (mouseEvent?.ctrlKey) {
      if (this.body()?.ids?.includes(row.id)) {
        ids = this.body()?.ids?.filter((item: string) => item !== row.id) ?? [];
      } else {
        ids = [...(this.body()?.ids ?? []), row.id];
      }
      this.refSelectedRow = row.id;
    } else if (mouseEvent?.shiftKey) {
      const index = this.table()
        .getRowModel()
        .rows.findIndex((r: Row<TData>) => r.id === this.refSelectedRow);
      const start = Math.min(index, row.index);
      const end = Math.max(index, row.index);
      ids = (
        start < end
          ? this.table()
              .getRowModel()
              .rows.slice(start, end + 1)
          : this.table()
              .getRowModel()
              .rows.slice(end, start - 1)
      ).map((r: Row<TData>) => r.id);
    } else {
      this.refSelectedRow = row.id;
    }
    if (cell?.column?.id !== 'rowSelection' || !this.body()?.checkbox?.isAsynchronous) {
      this.body()?.handleClick?.({ ids, id: row.id });
    }
  };
}
