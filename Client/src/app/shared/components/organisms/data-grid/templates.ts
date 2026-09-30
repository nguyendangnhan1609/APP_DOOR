import { EIcon } from '@/shared/enums';
import { formatDateTime } from '@/shared/utils';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  CellContext,
  type HeaderContext,
  injectFlexRenderContext,
  Row,
} from '@tanstack/angular-table';
import Icon from '../../atoms/icon/icon.component';
import Tooltip from '../../atoms/tooltip/tooltip.component';
import Choice from '../../molecules/choice/choice.component';

@Component({
  standalone: true,
  imports: [Choice],
  template: `
    <app-choice
      class="row-selection"
      [checked]="table.getIsAllRowsSelected()"
      (handleChange)="table.toggleAllRowsSelected($event)">
    </app-choice>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckboxHeader<TData> {
  readonly context = injectFlexRenderContext<HeaderContext<TData, unknown>>();

  get table() {
    return this.context.table;
  }
}

@Component({
  standalone: true,
  imports: [Choice],
  template: `
    <app-choice
      class="row-selection"
      [checked]="row.getIsSelected()"
      [disabled]="!row.getCanSelect()"
      (handleChange)="row.getToggleSelectedHandler()($event)">
    </app-choice>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckboxCell<TData> {
  readonly context = injectFlexRenderContext<CellContext<TData, unknown>>();

  get row() {
    return this.context.row;
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, Icon],
  template: `
    <button *ngIf="row.getCanExpand()" (click)="fnExpand(row)" type="button">
      <app-icon
        [name]="EIcon.Arrow"
        [ngClass]="['size-3', row.getIsExpanded() ? 'rotate-90' : '']"></app-icon>
    </button>
    <span>{{ context.getValue() }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ExpandedCell<TData> {
  EIcon = EIcon;

  readonly context = injectFlexRenderContext<CellContext<TData, unknown>>();
  readonly handleExpand = output<TData>();

  get row() {
    return this.context.row;
  }

  fnExpand = (row: Row<TData>) => {
    row.toggleExpanded();
    this.handleExpand.emit(row.original);
  };
}

@Component({
  standalone: true,
  imports: [Tooltip],
  template: `
    <app-tooltip [content]="formatDateTime({ dateString: dateString(), isTime: true })">
      {{ formatDateTime({ dateString: dateString() }) }}
    </app-tooltip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DateCell<TData> {
  formatDateTime = formatDateTime;

  readonly context = injectFlexRenderContext<CellContext<TData, unknown>>();
  readonly handleExpand = output<TData>();

  dateString = () => this.context.row.original[this.context.column.id as keyof TData] as string;
}

export default { CheckboxHeader, CheckboxCell, ExpandedCell, DateCell };
