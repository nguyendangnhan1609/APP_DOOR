import { EFormRuleType, EFormType } from '@/shared/enums';
import generateValidMax from './generate-valid-max';
import generateValidMin from './generate-valid-min';
import type Props from './type';

/**
 * Maps a form item rule to a validation rule.
 */
const generateValid = <T>({ rule, rules, fieldForm, t }: Props<T>) => {
  if (fieldForm) {
    switch (rule.type) {
      case EFormRuleType.Required:
        {
          const message = t(
            rule.message ??
              (!fieldForm.type ||
              [
                EFormType.Text,
                EFormType.Number,
                EFormType.Hidden,
                EFormType.Password,
                EFormType.Textarea,
              ].includes(fieldForm.type)
                ? 'PleaseEnter'
                : 'PleaseChoose'),
          );
          rules.push(({ value }) => (value ? '' : message));
        }
        break;
      case EFormRuleType.Email:
        rules.push(({ value }) => {
          // eslint-disable-next-line
          const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
          if (!value || (typeof value === 'string' && regexEmail.test(value.trim()))) return '';
          return t(rule.message ?? 'PleaseEnterAValidEmailAddress');
        });
        break;
      case EFormRuleType.Phone:
        rules.push(({ value }) => {
          if (!value) return '';
          else if (/^\d+$/.test(value)) {
            if (value?.trim().length < 10) return t('PleaseEnterAtLeastCharacters', { min: '10' });
            else if (value?.trim().length > 12)
              return t('PleaseEnterMaximumCharacters', { max: '12' });
            else return '';
          } else return t('PleaseEnterOnlyNumber');
        });
        break;
      case EFormRuleType.Min:
        generateValidMin({ rule, rules, fieldForm, t });
        break;
      case EFormRuleType.Max:
        generateValidMax({ rule, rules, fieldForm, t });
        break;
      case EFormRuleType.OnlyText:
        rules.push(({ value }) => {
          if (!value || /^[A-Za-z]+$/.test(value)) return '';
          return t(rule.message ?? 'PleaseEnterOnlyText');
        });
        break;
      case EFormRuleType.OnlyTextSpace:
        rules.push(({ value }) => {
          if (!value || /^[a-zA-Z ]+$/.test(value)) return '';
          return t(rule.message ?? 'PleaseEnterOnlyText');
        });
        break;
      case EFormRuleType.Textarea:
        rules.push(({ value }) => {
          if (value && value?.trim()?.length > 500) {
            return t(rule.message ?? 'PleaseEnterMaximumCharacters', {
              max: '500',
            });
          }
          return '';
        });
        break;
      case EFormRuleType.Custom:
        if (rule.validator) rules.push(rule.validator);
        break;
      default:
    }
  }
  return rule;
};

export default generateValid;
