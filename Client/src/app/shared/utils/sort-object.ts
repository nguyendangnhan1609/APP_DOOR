/**
 * Sorts two objects based on a specified property.
 */
export const sortObject = <T = Record<string, string>>({
  left,
  right,
  name,
}: {
  left: T;
  right: T;
  name: string;
}) => {
  if (left[name as keyof T] < right[name as keyof T]) return -1;
  else if (left[name as keyof T] > right[name as keyof T]) return 1;
  return 0;
};
