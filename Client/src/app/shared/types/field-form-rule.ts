import type { C_API } from '@/shared/constants';
import type { EFormRuleType } from '@/shared/enums';
import type { TFieldFormValidation } from './field-form-validation';
/**
 * Represents the interface for a form item rule.
 */
export type TFieldFormRule<T> = {
  readonly type?: EFormRuleType;
  readonly message?: string;
  readonly value?: number;
  readonly validator?: TFieldFormValidation<T>;
  readonly min?: number;
  readonly max?: number;
  readonly api?: {
    readonly url?: string;
    readonly name: string;
    readonly label: string;
    readonly key: keyof typeof C_API;
    readonly id?: string;
  };
};
