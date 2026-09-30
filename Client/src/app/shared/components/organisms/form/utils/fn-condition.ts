import { EFormType } from '@/shared/enums';
import type { TFieldForm, TFlatten } from '@/shared/types';

/**
 * Evaluates whether a form item should be displayed based on its type and condition.
 */
const fnCondition = <T>({
  fieldForm,
  index,
  values,
}: {
  readonly fieldForm: TFieldForm<T>;
  readonly index: number;
  readonly values?: T;
}) =>
  fieldForm?.type &&
  fieldForm?.type !== EFormType.Hidden &&
  (!fieldForm?.condition ||
    (values &&
      !!fieldForm?.condition({ value: (values as TFlatten<T>)[fieldForm.name], index, values })));

export default fnCondition;
