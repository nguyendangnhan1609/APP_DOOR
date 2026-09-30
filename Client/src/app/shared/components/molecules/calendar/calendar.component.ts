import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';

import { EIcon } from '@/shared/enums';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calendar">
      <div class="header">
        <button (click)="fnPrevMonthClick()">
          <app-icon [name]="EIcon.Arrow" className="rotate-180 size-3" />
        </button>
        <h2>{{ stateCalendar().currentMonth.format('YYYY/MM') }}</h2>
        <button (click)="fnNextMonthClick()">
          <app-icon [name]="EIcon.Arrow" className="size-3" />
        </button>
      </div>
      <div class="days">
        <div *ngFor="let wd of weekDays(); let i = index" [attr.data-key]="'day-' + i">
          {{ wd }}
        </div>
        <button
          *ngFor="let day of days()"
          [attr.title]="day.format('L')"
          [ngClass]="{
            'outside-month': !isCurrentMonth(day),
            'current-day': isCurrentDay(day),
            selected: isSelectedDay(day),
          }"
          (click)="fnDateClick(day)">
          {{ day.date() }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./calendar.component.scss'],
})
export default class Calendar {
  EIcon = EIcon;

  readonly value = input<Dayjs>();
  readonly handleChange = output<Dayjs>();

  readonly stateCalendar = signal({
    currentMonth: dayjs(),
    selectedDate: this.value(),
  });
  readonly days = computed(() => {
    const startOfMonth = this.stateCalendar().currentMonth.startOf('month').startOf('week');
    const totalDays = 42;
    const arr: Dayjs[] = [];
    let day = startOfMonth;
    for (let i = 0; i < totalDays; i++) {
      arr.push(day);
      day = day.add(1, 'day');
    }
    return arr;
  });
  readonly weekDays = computed(() =>
    Array.from({ length: 7 }).map((_, i) => dayjs().day(i).format('dd')),
  );

  isCurrentMonth = (day: Dayjs) => day.isSame(this.stateCalendar().currentMonth, 'month');
  isCurrentDay = (day: Dayjs) => day.isSame(dayjs(), 'day');
  isSelectedDay = (day: Dayjs) => this.stateCalendar().selectedDate?.isSame(day, 'day');

  fnDateClick = (selectedDate: Dayjs) => {
    this.stateCalendar.set({
      ...this.stateCalendar(),
      selectedDate,
    });
    this.handleChange.emit(selectedDate);
  };
  fnPrevMonthClick = () =>
    this.stateCalendar.set({
      ...this.stateCalendar(),
      currentMonth: this.stateCalendar().currentMonth.subtract(1, 'month'),
    });
  fnNextMonthClick = () =>
    this.stateCalendar.set({
      ...this.stateCalendar(),
      currentMonth: this.stateCalendar().currentMonth.add(1, 'month'),
    });
}
