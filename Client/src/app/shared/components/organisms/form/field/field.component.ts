import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { DeepKeys, DeepValue, TanStackField } from '@tanstack/angular-form';

import { serviceFetch } from '@/core/services';
import { C_API } from '@/shared/constants';
import { EFormRuleType, EFormType } from '@/shared/enums';
import { TField, TFieldForm, TFieldFormValidation, TForm } from '@/shared/types';
import FormEntry from '../entry/entry.component';
import utils from '../utils';

@Component({
  selector: 'app-field',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TanStackField, FormEntry],
  template: `
    <ng-container
      #field="field"
      [name]="fieldForm().name"
      [tanstackField]="formApi()"
      [validators]="validators()">
      <label class="text-base-800" [title]="fieldForm().title" [for]="field.api.name"
        >{{ translate()(fieldForm().title)
        }}<span class="text-error-500" *ngIf="isRequired()"> *</span></label
      >
      <app-entry
        [ngClass]="classError($any(field))"
        [fieldForm]="fieldForm()"
        [formApi]="formApi()"
        [field]="$any(field)"
        [state]="$any(field.api.state)"
        [translate]="translate()"></app-entry>
    </ng-container>
  `,
})
export default class Field<T> {
  readonly formApi = input.required<TForm<T>>();
  readonly fieldForm = input.required<TFieldForm<T>>();
  readonly isLabel = input<boolean>();
  readonly translate = input.required<(key: string, options?: Record<string, string>) => string>();

  constructor() {
    setTimeout(() => {
      this.init();
    });
  }

  rules: TFieldFormValidation<T>[] = [];
  t = (key: string, params?: Record<string, unknown>) => JSON.stringify([key, params ?? {}]);

  init = () => {
    const rules = this.rules;
    const t = this.t;
    const fieldForm = this.fieldForm();

    if (fieldForm?.rules) {
      fieldForm?.rules
        .filter(item => !!item)
        .map(rule => utils.generateValid({ rule, rules, fieldForm, t }));
    }

    if (!fieldForm.notDefaultValid)
      switch (fieldForm.type) {
        case EFormType.Number:
          rules.push(({ value }) => {
            // eslint-disable-next-line
            if (!value || (/^-?[1-9]*\d+(\.\d{1,2})?$/.test(value) && parseInt(value) < 1000000000))
              return '';
            return t('PleaseEnterOnlyNumber');
          });
          break;
        case EFormType.Password:
          rules.push(({ value }) => {
            if (
              !value ||
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%)(_^&*+-])[A-Za-z\d#?!@$%)(_^&*+-]{8,20}$/.test(
                value,
              )
            ) {
              return '';
            } else return t('PasswordNeedsToHaveAtLeast8Characters');
          });
          break;
        default:
      }
  };

  readonly ruleApi = computed(() =>
    this.fieldForm().rules?.find(rule => rule.type === EFormRuleType.Api),
  );
  readonly validators = computed(() => {
    const ruleApi = this.ruleApi();
    const formApi = this.formApi();
    const rules = this.rules;
    const t = (key: string, params?: Record<string, unknown>) =>
      JSON.stringify([key, params ?? {}]);

    return {
      onChange: ({ value }: { value?: DeepValue<T, DeepKeys<T>> }) => {
        let message = '';
        rules.forEach(rule => {
          if (!message) message = rule({ value: value as string, formApi });
        });
        return message;
      },
      onChangeAsyncDebounceMs: 800,
      onBlurAsync:
        ruleApi?.api?.key && ruleApi?.api?.url
          ? async ({ value }: { value: DeepValue<T, DeepKeys<T>> }) => {
              const res = await serviceFetch.get<{ exists: boolean }>({
                url: `${C_API[ruleApi.api!.key]}/${ruleApi.api!.url}`,
                params: {
                  type: ruleApi.api?.name,
                  value: value as string,
                  id: ruleApi.api?.id,
                },
              });
              if (res?.data?.exists === true) {
                return t('IsAlreadyTaken', {
                  label: ruleApi.api!.label,
                  value: value as string,
                });
              }
              return '';
            }
          : undefined,
    };
  });

  readonly isRequired = computed(() =>
    this.fieldForm().rules?.some(rule => rule.type === EFormRuleType.Required),
  );

  classError = (field: TField<T>) => ({
    error: field.api.state.meta.errors.length || field.api.state.meta.isValidating,
  });
}
