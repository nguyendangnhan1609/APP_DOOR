import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-entry-textarea',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="['relative', className()]">
      <textarea
        [name]="name()"
        [ngClass]="{ entry: true, disabled: disabled() }"
        [disabled]="disabled()"
        [attr.value]="value()"
        [attr.maxlength]="maxLength()"
        [placeholder]="placeholder() || ''"
        [rows]="rows()"
        (blur)="handleBlur.emit($event)"
        (input)="this.handleChange.emit($event)"
        (keyup)="this.handlePressEnter.emit($event)"
        (keydown)="this.handlePressEnter.emit($event)"></textarea>
      <small class="count-text" *ngIf="maxLength()">
        <strong>{{ stateEntryTextarea().length }}</strong
        >/{{ maxLength() }}
      </small>
    </div>
  `,
})
export default class EntryTextarea {
  readonly className = input('');
  readonly name = input('textarea');
  readonly value = input('');
  readonly disabled = input(false);
  readonly isAutoHeight = input(false);
  readonly placeholder = input('');
  readonly maxLength = input<number>();
  readonly rows = input<number>(4);
  readonly handleBlur = output<FocusEvent>();
  readonly handleChange = output<Event>();
  readonly handlePressEnter = output<Event>();

  readonly stateEntryTextarea = signal({ length: this.value()?.length || 0 });

  fnChange = (e: Event) => {
    if (this.maxLength())
      this.stateEntryTextarea.set({
        ...this.stateEntryTextarea(),
        length: (e.target as HTMLTextAreaElement).value.length,
      });
    this.handleChange.emit(e);
  };
  fnPressEnter = (e: KeyboardEvent) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      this.handlePressEnter.emit(e);
    } else if (this.isAutoHeight() && e.currentTarget) {
      const target = e.currentTarget as HTMLTextAreaElement;
      target.style.height = '5px';
      target.style.height = target.scrollHeight + 2 + 'px';
    }
  };
}
