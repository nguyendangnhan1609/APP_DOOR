import type { TForm } from './form';

export type TFormFooter<T> = {
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly formApi: TForm<T>;
};
