import type {
  DeepKeys,
  DeepValue,
  FieldAsyncValidateOrFn,
  FieldState,
  FieldValidateOrFn,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
} from '@tanstack/angular-form';

export type TFieldState<T> = FieldState<
  T,
  DeepKeys<T>,
  DeepValue<T, DeepKeys<T>>,
  FieldValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldAsyncValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldAsyncValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldAsyncValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FieldAsyncValidateOrFn<T, DeepKeys<T>, DeepValue<T, DeepKeys<T>>> | undefined,
  FormValidateOrFn<T> | undefined,
  FormValidateOrFn<T> | undefined,
  FormAsyncValidateOrFn<T> | undefined,
  FormValidateOrFn<T> | undefined,
  FormAsyncValidateOrFn<T> | undefined,
  FormValidateOrFn<T> | undefined,
  FormAsyncValidateOrFn<T> | undefined,
  FormValidateOrFn<T> | undefined,
  FormAsyncValidateOrFn<T> | undefined
>;
