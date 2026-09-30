import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ServiceTranslate } from '@/core/services';
import { EFormType, EIcon } from '@/shared/enums';
import { TField, TFieldForm, TFieldState, TForm } from '@/shared/types';
import Icon from '../../../atoms/icon/icon.component';
import EntryChoice from '../../../molecules/entry/choice/choice.component';
import EntryDate from '../../../molecules/entry/date/date.component';
import EntryMask from '../../../molecules/entry/mask/mask.component';
import EntryPassword from '../../../molecules/entry/password/password.component';
import EntrySelect from '../../../molecules/entry/select/select.component';
import EntryTextarea from '../../../molecules/entry/textarea/textarea.component';
import EntryUpload from '../../../molecules/entry/upload/upload.component';
import Spin from '../../../molecules/spin/spin.component';

@Component({
  selector: 'app-entry',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    Spin,
    Icon,
    EntryMask,
    EntryDate,
    EntryPassword,
    EntryTextarea,
    EntrySelect,
    EntryChoice,
    EntryUpload,
  ],
  templateUrl: './entry.component.html',
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class EntryForm<T> {
  EIcon = EIcon;
  EFormType = EFormType;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t(key: string, params?: Record<string, string>) {
    return this.#serviceTranslate?.t()(key, params);
  }

  readonly formApi = input.required<TForm<T>>();
  readonly fieldForm = input.required<TFieldForm<T>>();
  readonly field = input.required<TField<T>>();
  readonly state = input.required<TFieldState<T>>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();

  readonly fieldState = computed(this.state);
  readonly isError = computed(
    () =>
      (this.fieldState().meta.isTouched && this.fieldState().meta.errors.length > 0) ||
      this.fieldState().meta.isValidating,
  );
  convertTranslate = (text: string) => {
    const [key, params] = JSON.parse(text);
    return this?.t(key, {
      ...params,
      title: this.translate()?.(this.fieldForm().title)?.toLowerCase(),
    });
  };
}
