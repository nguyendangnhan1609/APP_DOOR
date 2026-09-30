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
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { EIcon } from '@/shared/enums';
import { TForm } from '@/shared/types';
import Icon from '../../../atoms/icon/icon.component';

declare const IMask: (
  el: HTMLInputElement,
  options: {
    mask: unknown;
    normalizeZeros?: boolean;
    radix?: string;
    min?: unknown;
    max?: unknown;
    thousandsSeparator?: string;
    lazy?: boolean;
  },
) => void;

@Component({
  selector: 'app-entry-mask',
  standalone: true,
  imports: [CommonModule, Icon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="['relative', className()]">
      <span class="before" *ngIf="iconBefore()">
        <app-icon [name]="iconBefore()"></app-icon>
      </span>
      <input
        #refInput
        [name]="name()"
        [type]="type()"
        [ngClass]="{
          entry: true,
          before: !!iconBefore(),
          after: !!iconAfter(),
          disabled: disabled(),
        }"
        [disabled]="disabled()"
        [attr.value]="value()"
        [attr.maxlength]="maxLength()"
        [placeholder]="placeholder()"
        [ngStyle]="{ height: height(), width: width() }"
        (blur)="fnBlur($event)"
        (input)="this.handleChange.emit($event)"
        (focus)="this.handleFocus.emit($event)"
        (keyup.enter)="this.handlePressEnter.emit($event)" />
      <span class="after" *ngIf="iconAfter()">
        <app-icon [name]="iconAfter()"></app-icon>
      </span>
    </div>
  `,
})
export default class EntryMask<T> {
  readonly name = input('');
  readonly className = input('');
  readonly mask = input<unknown>();
  readonly value = input('');
  readonly iconBefore = input<EIcon>();
  readonly iconAfter = input<EIcon>();
  readonly disabled = input(false);
  readonly placeholder = input('');
  readonly height = input('');
  readonly width = input('');
  readonly type = input('text');
  readonly maxLength = input<number | undefined>();
  readonly handleBlur = output<FocusEvent>();
  readonly handleFocus = output<FocusEvent>();
  readonly handleChange = output<Event>();
  readonly handlePressEnter = output<Event>();
  readonly formApi = input<TForm<T>>();

  readonly refInput = viewChild<ElementRef<HTMLInputElement>>('refInput');
  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  timeoutMask?: ReturnType<typeof setTimeout>;
  constructor() {
    this.#fnEffect = effect(() => {
      this.timeoutMask = setTimeout(() => {
        if (this.mask() && this.refInput()!.nativeElement) {
          IMask(this.refInput()!.nativeElement, {
            mask: this.mask()!,
            normalizeZeros: true,
            radix: '.',
          });
        }
      });
    });
    this.#destroyRef.onDestroy(() => {
      if (this.timeoutMask) clearTimeout(this.timeoutMask);
      this.#fnEffect.destroy();
    });
  }

  fnBlur = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement | null;
    if (target && !isNaN(Number(target.value)) && parseFloat(target.value) === 0)
      target.value = '0';
    if (this.handleBlur) this.handleBlur.emit(e);
  };
}
