import type { TOption } from '../types';

export const mapChildren = ({
  options,
  convert,
}: {
  options: TOption[];
  convert: (item: TOption) => TOption;
}): TOption[] =>
  options.map(
    (item): TOption => ({
      ...convert(item),
      children: item.children ? mapChildren({ options: item.children, convert }) : undefined,
    }),
  );
