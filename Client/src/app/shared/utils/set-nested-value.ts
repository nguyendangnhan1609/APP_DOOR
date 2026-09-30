/**
 * Sets a nested value within an object based on a dot-separated path.
 *
 * @param obj - The target object in which to set the value.
 * @param path - A dot-separated string representing the path to the nested property (e.g., "a.b.c").
 * @param value - The value to set at the specified path.
 *
 * @example
 * const obj = {};
 * setNestedValue(obj, "a.b.c", 42);
 * // obj is now { a: { b: { c: 42 } } }
 */
export const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown) => {
  const keys = path.split('.');
  let current = obj;
  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] ??= {};
      current = current[key] as Record<string, unknown>;
    }
  });
};
