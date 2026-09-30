import { EFormType } from '@/shared/enums';
import type Props from './type';

/**
 * Generates a validation rule for minimum value.
 */
const generateValidMin = <T>({ rule, rules, fieldForm, t }: Props<T>) => {
  if (fieldForm.type === EFormType.Number)
    rules.push(({ value }) => {
      if (
        !value ||
        (rule.value && /^0$|^-?[1-9]\d*(\.\d+)?$/.test(value) && parseFloat(value) < rule.value)
      ) {
        return t(rule.message ?? 'PleaseEnterMinimumNumber', {
          min: rule.value?.toString() ?? '',
        });
      }
      return '';
    });
  else {
    let message = rule.message ?? '';
    if (!message) {
      if (fieldForm.type) {
        message = t('PleaseEnterAtLeastNumberCharacters', {
          min: rule.value?.toString() ?? '',
        });
      } else {
        message = t('PleaseEnterMinimumNumber', {
          min: rule.value?.toString() ?? '',
        });
      }
    }
    rules.push(({ value }) => {
      if (!value || (rule.value && value.length < rule.value)) return message;
      return '';
    });
  }
};

export default generateValidMin;
