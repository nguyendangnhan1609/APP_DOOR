import { ServiceTranslate } from '@/core/services';
import { EIcon } from '@/shared/enums';
import { TTableState } from '@/shared/types';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  Column,
  ColumnPinningState,
  FlexRenderDirective,
  Header,
  HeaderGroup,
  Table,
} from '@tanstack/angular-table';
import type { AngularVirtualizer, VirtualItem } from '@tanstack/angular-virtual';
import Icon from '../../../../atoms/icon/icon.component';

@Component({
  selector: 'app-t-header',
  standalone: true,
  imports: [CommonModule, FlexRenderDirective, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <thead>
      <tr
        *ngFor="let headerGroup of table().getHeaderGroups(); let index = index"
        [ngClass]="{ 'round-checkbox': !isAsynchronous() }"
        [attr.data-index]="index">
        <th
          *ngIf="refVirtualPaddingLeft()"
          [style.width.px]="refVirtualPaddingLeft()"
          scope="col"></th>
        <ng-container *ngFor="let vc of columnVirtualizer().getVirtualItems()">
          <th
            *ngIf="fnGetHeader({ vc, headerGroup }) as vcHeader"
            [attr.id]="vcHeader.id"
            [ngStyle]="fnStyleRow({ vc, headerGroup })"
            [ngClass]="{
              'has-sorter': vcHeader.column.getCanSort(),
              'has-filter': vcHeader.column.getCanFilter(),
            }"
            [attr.aria-label]="vcHeader.column.columnDef.header?.toString()">
            <ng-container *ngIf="fnShowArrow({ vc, index }) as arrowLeft">
              <button
                class="hide left-0"
                [title]="t('HideColumn')"
                (click)="fnToggleVisibility(arrowLeft.id)">
                <app-icon class="size-2 rotate-180" [name]="EIcon.Arrow" />
              </button>
            </ng-container>

            <ng-container
              *flexRender="
                vcHeader.column.columnDef.header;
                props: vcHeader.getContext();
                let headerText
              ">
              {{ headerText }}
            </ng-container>

            <ng-container [ngSwitch]="vcHeader.column.getIsSorted()">
              <app-icon class="sort rotate-180" *ngSwitchCase="'asc'" [name]="EIcon.Sort" />
              <app-icon class="sort" *ngSwitchCase="'desc'" [name]="EIcon.Sort" />
            </ng-container>

            <button
              class="resizer"
              *ngIf="!vcHeader.column.columnDef.meta?.isHeaderHide && !header()?.isNotResizing"
              [ngClass]="{ resizing: vcHeader.column.getIsResizing() }"
              (dblclick)="vcHeader.column.resetSize()"
              (mousedown)="fnDragResize($event, vcHeader)"
              type="button">
              &nbsp;
            </button>

            <ng-container *ngIf="fnShowArrow({ vc, index, right: true }) as arrowRight">
              <button
                class="hide right-0.5"
                [title]="t('HideColumn')"
                (click)="fnToggleVisibility(arrowRight.id)">
                <app-icon class="size-2" [name]="EIcon.Arrow" />
              </button>
            </ng-container>
          </th>
        </ng-container>
      </tr>
    </thead>
  `,
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class THeader<TData> {
  EIcon = EIcon;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t(key: string, params?: Record<string, string>) {
    return this.#serviceTranslate?.t()(key, params);
  }

  readonly header = input<{
    readonly width?: number;
    readonly maxWidth?: number;
    readonly pinning?: ColumnPinningState;
    readonly isNotResizing?: boolean;
    readonly isNotRightClick?: boolean;
  }>();
  readonly table = input.required<Table<TData>>();
  readonly columnVirtualizer = input.required<AngularVirtualizer<HTMLElement, HTMLElement>>();
  readonly refVirtualPaddingLeft = input<number>();
  readonly getCommonPinningStyles = input<(col: Column<TData>) => Partial<CSSStyleDeclaration>>();

  readonly isAsynchronous = input<boolean>();
  readonly refHeaderGroups = input<HeaderGroup<TData>[]>();
  readonly stateTanstack = input.required<TTableState>();
  readonly setStateTanstack = output<TTableState>();

  readonly refResize = signal<
    { isResizing: boolean; header: Header<TData, unknown>; vc: VirtualItem } | undefined
  >(undefined);

  fnDragResize = (e: MouseEvent | TouchEvent, header: Header<TData, unknown>) => {
    if (this.stateTanstack()?.isDragResize) {
      header?.getResizeHandler()(e);
    } else {
      setTimeout(() => {
        this.table()
          .getFlatHeaders()
          .find(h => h.id === header.id)
          ?.getResizeHandler()(e);
      });
    }
    this.setStateTanstack?.emit({ ...this.stateTanstack(), isDragResize: true });
  };

  fnToggleVisibility = (id: string, visible = true) => {
    this.table().setColumnVisibility({
      ...this.stateTanstack().columnVisibility,
      [id]: visible,
    });
  };

  fnShowArrow = ({
    vc,
    index,
    right = false,
  }: {
    vc: VirtualItem;
    index: number;
    right?: boolean;
  }) => {
    let indexVisibility = 0;
    const visibility = this.refHeaderGroups()?.map(headerGroup =>
      headerGroup.headers
        .map((header, idx) => {
          if (this.stateTanstack().columnVisibility[header.id] === false) {
            indexVisibility += 1;
            return {
              id: header.id,
              index: idx - (indexVisibility - 1),
            };
          }
          return null;
        })
        .filter(item => item),
    );
    const arrowLeft = visibility?.[index]?.find(item => item?.index === vc.index);
    const arrowRight = visibility?.[index]?.find(item => item?.index === vc.index + 1);

    if ((!!arrowLeft && !right) || (!!arrowRight && right)) {
      return !right ? arrowLeft : arrowRight;
    }
    return null;
  };

  fnGetHeader = ({ vc, headerGroup }: { vc: VirtualItem; headerGroup: HeaderGroup<TData> }) =>
    headerGroup.headers[vc.index];

  fnStyleRow = ({ vc, headerGroup }: { vc: VirtualItem; headerGroup: HeaderGroup<TData> }) => ({
    ...this.getCommonPinningStyles()?.(this.fnGetHeader({ vc, headerGroup }).column),
    width:
      'var(--header-' +
      (this.fnGetHeader({ vc, headerGroup }).id.replace(/ /g, '-') ?? '') +
      '-size)',
  });
}
