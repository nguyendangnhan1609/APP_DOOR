import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  effect,
  EffectRef,
  inject,
  input,
  output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';

import { EFormType } from '@/shared/enums';
import { TFieldForm, TForm } from '@/shared/types';
import Spin from '../../molecules/spin/spin.component';
import FormField from './field/field.component';
import utils from './utils';

@Component({
  selector: 'app-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormField, Spin],
  template: `
    <app-spin [isLoading]="!!isLoading()">
      <form
        [ngClass]="['form', className()]"
        [class.inline]="isInline()"
        (submit)="fnSubmit($event)">
        <input *ngIf="isEnterSubmit()" type="submit" hidden />
        <ng-template [ngForOf]="fields()" ngFor let-fieldForm let-index="index">
          <app-field
            *ngIf="fnCondition({ fieldForm, index, values: values() })"
            [fieldForm]="fieldForm"
            [formApi]="form"
            [translate]="translate()"
            [ngClass]="classField(fieldForm)"
            data-item="true"></app-field>
        </ng-template>
      </form>
    </app-spin>

    <ng-container *ngIf="footerTpl()">
      <ng-container
        [ngTemplateOutlet]="footerTpl()!"
        [ngTemplateOutletContext]="{ canSubmit, form }"></ng-container>
    </ng-container>
  `,
})
export default class Form<T> {
  fnCondition = utils.fnCondition;

  readonly className = input<string>('');
  readonly fields = input.required<TFieldForm<T>[]>();
  readonly values = input<T>();
  readonly isLoading = input<boolean>();
  readonly isEnterSubmit = input<boolean>();
  readonly isInline = input<boolean>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();
  readonly handleSubmit = output<{ value?: T; formApi: TForm<T> }>();
  readonly footerTpl = contentChild<TemplateRef<never>>('footer');

  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  refOldValue = this.values();
  constructor() {
    this.#fnEffect = effect(() => {
      if (this.values() !== this.refOldValue) {
        this.form.reset(
          utils.convertValueForm<T>({
            fields: this.fields(),
            values: this.values(),
          }),
        );
      }
    });
    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
    });
  }

  readonly form = injectForm({
    onSubmit: ({ value }: { value: T }) => {
      this.handleSubmit.emit({
        value: utils.convertValueForm<T>({ fields: this.fields(), values: value, isExport: true }),
        formApi: this.form,
      });
    },
  });
  readonly canSubmit = injectStore(this.form, state => state.canSubmit);

  fnSubmit = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.form.handleSubmit();
  };

  classField = (fieldForm: TFieldForm<T>) => [
    'item col-span-12 type-' + (fieldForm?.type ?? EFormType.Text),
    'sm:col-span-' + (fieldForm?.col ?? 12),
  ];
}
