export const generateRangeNumber = ({
  start,
  end,
  step = 1,
}: {
  readonly start?: number;
  readonly end?: number;
  readonly step?: number;
}) => {
  if (start !== undefined && end !== undefined) {
    const len = Math.floor((end - start) / step) + 1;
    return Array(len)
      .fill(undefined)
      .map((_, idx) => start + idx * step);
  }
  return [];
};
