/**
 * Checks if a given string is numeric.
 */
export const isNumeric = (str: string) => {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
};
