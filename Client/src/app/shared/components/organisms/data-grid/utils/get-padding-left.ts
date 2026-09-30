import type { VirtualItem } from '@tanstack/angular-virtual';

export default ({
  old,
  virtualColumns,
  pinLeft,
}: {
  readonly old: number;
  readonly virtualColumns: VirtualItem[];
  readonly pinLeft?: string[];
}) => {
  if (virtualColumns?.length && pinLeft !== undefined) {
    const isPinLeft = pinLeft.length > 0 && virtualColumns[pinLeft.length].index != pinLeft.length;
    const virtualPaddingLeft =
      virtualColumns[isPinLeft ? pinLeft.length : 0]?.start -
      (isPinLeft ? virtualColumns[pinLeft.length - 1]?.end : 0);
    if (old !== virtualPaddingLeft) return virtualPaddingLeft;
  }
  return old;
};
