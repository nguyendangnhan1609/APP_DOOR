import { CommonModule } from '@angular/common';
import {
  Component,
  contentChild,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { ServiceTranslate } from '@/core/services';
import { TFieldForm, TForm } from '@/shared/types';
import Modal from '../../molecules/modal/modal.component';
import Form from '../form/form.component';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, Form, Modal],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [className]="className()"
      [title]="title()"
      [textCancel]="textCancel() ?? t('Cancel')"
      [textOkay]="textSubmit() ?? t('Save')"
      (handleCancel)="handleCancel.emit()"
      (handleOkay)="fnOkay()">
      <ng-container *ngIf="footerCustomTpl()">
        <ng-template #footerCustom>
          <ng-container *ngTemplateOutlet="footerCustomTpl()!"></ng-container>
        </ng-template>
      </ng-container>
      <app-form
        #refForm
        [values]="values()"
        [fields]="fields()"
        [isLoading]="isLoading()"
        [translate]="translate()"
        (handleSubmit)="handleSubmit.emit($event)">
      </app-form>
    </app-modal>
  `,
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Messages' },
  ],
})
export default class FormModalComponent<T> {
  readonly #serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.#serviceTranslate.t()(key, params);

  readonly title = input<string>('');
  readonly fields = input<TFieldForm<T>[]>([]);
  readonly textSubmit = input<string>();
  readonly textCancel = input<string>();
  readonly className = input<string>('');
  readonly isOpen = input(false);
  readonly isLoading = input(false);
  readonly values = input<T>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();
  readonly handleSubmit = output<{ value?: T; formApi: TForm<T> }>();
  readonly handleCancel = output<void>();
  readonly footerCustomTpl = contentChild<TemplateRef<HTMLElement>>('footerCustom');

  readonly refForm = viewChild<Form<T>>('refForm');
  fnOkay = () => {
    this.refForm()!.form.handleSubmit();
  };
}
