import type { TForm } from './form';

export type TFieldFormValidation<T> = (props: {
  readonly value?: string;
  readonly formApi: TForm<T>;
}) => string;
