import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Dayjs } from 'dayjs';

import { EIcon } from '@/shared/enums';
import Icon from '../../../atoms/icon/icon.component';
import Tooltip from '../../../atoms/tooltip/tooltip.component';
import Calendar from '../../calendar/calendar.component';

@Component({
  selector: 'app-entry-date',
  standalone: true,
  imports: [Tooltip, Calendar, Icon],
  template: `
    <app-tooltip
      #refTooltip
      [isArrow]="false"
      [isClick]="true"
      [isDisabled]="disabled()"
      placement="bottom-end"
      classContainer="entry-date"
      className="dropdown">
      <ng-template #content>
        <app-calendar [value]="value()" (handleChange)="fnChange($event)" />
      </ng-template>
      <input
        #refInput
        [name]="name()"
        [class]="{ entry: true, disabled: this.disabled() }"
        [placeholder]="placeholder()"
        [value]="value()?.format('L')"
        readonly />
      <app-icon [name]="EIcon.Calendar" />
    </app-tooltip>
  `,
  styleUrls: ['./date.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EntryDate {
  EIcon = EIcon;

  readonly name = input('');
  readonly disabled = input(false);
  readonly placeholder = input('');
  readonly value = input<Dayjs>();
  readonly handleChange = output<Dayjs>();

  readonly refTooltip = viewChild<Tooltip>('refTooltip');
  readonly refInput = viewChild<ElementRef<HTMLInputElement>>('refInput');
  fnChange = (date: Dayjs) => {
    this.refTooltip()!.fnHide();
    this.refInput()!.nativeElement.value = date.format('L');
    this.handleChange.emit(date);
  };
}
