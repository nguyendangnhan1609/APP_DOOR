import type { TFieldForm, TFieldFormRule, TFieldFormValidation } from '@/shared/types';

type Props<T> = {
  readonly rule: TFieldFormRule<T>;
  readonly rules: TFieldFormValidation<T>[];
  readonly fieldForm: TFieldForm<T>;
  readonly t: (key: string, options?: Record<string, string>) => string;
};

export default Props;
