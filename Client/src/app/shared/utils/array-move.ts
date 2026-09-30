/**
 * Moves an element within an array from the old index to the new index.
 */
export const arrayMove = <T>(arr: (T | undefined)[], old_index: number, new_index: number) => {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr.filter(item => !!item) as T[];
};
