import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

import { EIcon } from '@/shared/enums';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-choice',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [ngClass]="['choice', className()]" [class.disabled]="disabled()">
      <input
        [type]="type()"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-label]="label()"
        [name]="name()"
        [value]="value()"
        (change)="fnChange()" />
      <div [ngClass]="[type()]" [class.checked]="checked()" aria-hidden="true">
        <app-icon *ngIf="type() === 'checkbox' && !!checked()" [name]="EIcon.Check" />
        <span *ngIf="type() === 'radio' && checked()"></span>
      </div>
      <span>{{ label() }}</span>
    </label>
  `,
  styleUrls: ['./choice.component.scss'],
})
export default class ItemChoiceComponent {
  EIcon = EIcon;

  readonly checked = input<boolean>();
  readonly name = input<string>('checkbox');
  readonly className = input('');
  readonly type = input<'checkbox' | 'radio'>('checkbox');
  readonly value = input<string | number>('boolean');
  readonly label = input<string>();
  readonly disabled = input<boolean>(false);
  readonly handleChange = output<boolean | undefined>();

  fnChange = () => {
    if (this.type() === 'checkbox') {
      this.handleChange.emit(this.checked() ? undefined : true);
    } else {
      this.handleChange.emit(true);
    }
  };
}
