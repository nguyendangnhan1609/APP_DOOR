import dayjs, { type Dayjs } from 'dayjs';

import { EFormType } from '@/shared/enums';
import type { GetValueByPath, TFieldForm, TFile, TFlatten, TPath } from '@/shared/types';

type Prop<T = Record<string, string | undefined>> = {
  readonly fields: TFieldForm<T>[];
  readonly values?: T;
  readonly isExport?: boolean;
};

type PropField<T = Record<string, string | undefined>> = Pick<Prop<T>, 'isExport'> & {
  readonly field: TFieldForm<T>;
  readonly values?: TFlatten<T>;
};

/**
 * Converts form values based on the provided columns and values.
 */
const convertValueForm = <T>({ fields, values, isExport }: Prop<T>) => {
  const radio = ({ field, values, isExport }: PropField<T>) => {
    if (isExport && values?.[field.name]) {
      values[field.name] = (values[field.name] as Record<string, string>[])[0] as GetValueByPath<
        T,
        TPath<T>
      >;
    }
    return values;
  };

  const select = ({ field, values, isExport }: PropField<T>) => {
    if (!isExport && values?.[field.name] !== undefined)
      values[field.name] = (
        field?.isMultiple || Array.isArray(values[field.name])
          ? (values[field.name] as Record<string, string>[]).map(value => value?.['id'] || value)
          : [values[field.name]]
      ) as GetValueByPath<T, TPath<T>>;
    else if (isExport && !field?.isMultiple && values?.[field.name] !== undefined) {
      values[field.name] = (values[field.name] as Record<string, string>[])[0] as GetValueByPath<
        T,
        TPath<T>
      >;
    }
    return values;
  };

  const date = ({ field, values, isExport }: PropField<T>) => {
    if (values?.[field.name] !== undefined) {
      if (isExport) {
        values[field.name] = (
          typeof values[field.name] === 'object'
            ? (values[field.name] as Dayjs)
            : dayjs(values[field.name] as string)
        ).format('YYYY-MM-DD HH:mm:ss') as GetValueByPath<T, TPath<T>>;
      } else
        values[field.name] = dayjs(values[field.name] as string) as GetValueByPath<T, TPath<T>>;
    }
    return values;
  };

  const upload = ({ field, values, isExport }: PropField<T>) => {
    if (isExport && values?.[field.name] && typeof values[field.name] === 'object') {
      if ((values[field.name] as TFile[]).length > 0) {
        values[field.name] = (
          !field.isMultiple
            ? (values[field.name] as TFile[])[0].path
            : (values[field.name] as TFile[]).map(file => file?.path || file)
        ) as GetValueByPath<T, TPath<T>>;
      } else if ((values[field.name] as TFile[]).length == 0 && !field.isMultiple) {
        values[field.name] = undefined as GetValueByPath<T, TPath<T>>;
      }
    }
    return values;
  };

  const listFormat = {
    [EFormType.Radio]: radio,
    [EFormType.Select]: select,
    [EFormType.Date]: date,
    [EFormType.Upload]: upload,
  };

  fields
    .filter(
      (field, index) =>
        field.type &&
        (!field?.condition ||
          (values &&
            !!field?.condition({ value: (values as TFlatten<T>)[field.name], index, values }))),
    )
    .forEach(field => {
      if (field?.convert && values) {
        (values as TFlatten<T>)[field.name] = field.convert({
          value: (values as TFlatten<T>)[field.name],
          values,
        });
      } else if (field.type && listFormat[field.type as keyof typeof listFormat]) {
        values = listFormat[field.type as keyof typeof listFormat]({
          field,
          values: values as TFlatten<T>,
          isExport,
        }) as T;
      } else if (!field?.text?.mask && typeof (values as TFlatten<T>)?.[field.name] === 'string') {
        (values as TFlatten<T>)[field.name] = (
          (values as TFlatten<T>)[field.name] as string
        ).trim() as GetValueByPath<T, TPath<T>>;
      }
    });
  return values;
};
export default convertValueForm;
