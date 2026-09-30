import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

import { TOption } from '@/shared/types';
import ItemChoice from '../../choice/choice.component';

@Component({
  selector: 'app-entry-choice',
  imports: [CommonModule, ItemChoice],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="['choice-group', className()]" [style.flexDirection]="direction()">
      <app-choice
        *ngFor="let option of options()"
        [name]="name() + '_' + option.value"
        [value]="option.value"
        [label]="option.label"
        [disabled]="!!disabled() || !!option.disabled"
        [checked]="(value() || []).includes(option.value)"
        [type]="type()"
        (handleChange)="fnChange(option.value)" />
    </div>
  `,
  styleUrls: ['./choice.component.scss'],
})
export default class EntryChoiceComponent {
  readonly options = input<TOption[]>([]);
  readonly value = input<(string | number)[]>([]);
  readonly disabled = input(false);
  readonly handleChange = output<(string | number)[]>();
  readonly name = input<string>('choice');
  readonly direction = input<'row' | 'column'>('column');
  readonly className = input<string>('');
  readonly type = input<'checkbox' | 'radio'>('checkbox');

  fnChange = (optionValue: string | number) => {
    if (this.type() === 'checkbox') {
      if (this.value()?.includes(optionValue)) {
        this.handleChange.emit(this.value().filter(v => v !== optionValue));
      } else {
        this.handleChange.emit([...(this.value() || []), optionValue]);
      }
    } else {
      this.handleChange.emit([optionValue]);
    }
  };
}
