import type { TOption } from '../types';

export const getValueChildren = ({
  children,
  keyGetValue,
  value = [],
  result = [],
}: {
  children: TOption[];
  keyGetValue: keyof TOption;
  value?: (string | number)[];
  result?: string[];
}) => {
  children.forEach(item => {
    if (value.includes(item.value)) {
      result.push(item[keyGetValue] as string);
    }
    if (item.children) {
      getValueChildren({ children: item.children, keyGetValue, value, result });
    }
  });
  return result.length > 0 ? result : undefined;
};
