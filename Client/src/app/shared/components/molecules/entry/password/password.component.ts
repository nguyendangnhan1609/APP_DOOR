import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { EIcon } from '@/shared/enums';
import Icon from '../../../atoms/icon/icon.component';

@Component({
  selector: 'app-entry-password',
  standalone: true,
  imports: [Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="relative">
    <input
      class="entry pr-9"
      [name]="name()"
      [attr.value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [type]="stateEntryPassword().isVisible ? 'password' : 'text'"
      (blur)="this.handleBlur.emit($event)"
      (input)="this.handleChange.emit($event)"
      autoComplete="on" />
    <button class="icon" (click)="fnToggleVisible()" type="button">
      <app-icon [name]="stateEntryPassword().isVisible ? EIcon.EyeSlash : EIcon.Eye" />
    </button>
  </div> `,
})
export default class EntryPassword {
  EIcon = EIcon;

  readonly name = input('');
  readonly value = input('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly handleChange = output<Event>();
  readonly handleBlur = output<FocusEvent>();

  readonly stateEntryPassword = signal({ isVisible: true });
  fnToggleVisible = () =>
    this.stateEntryPassword.set({
      ...this.stateEntryPassword(),
      isVisible: !this.stateEntryPassword().isVisible,
    });
}
