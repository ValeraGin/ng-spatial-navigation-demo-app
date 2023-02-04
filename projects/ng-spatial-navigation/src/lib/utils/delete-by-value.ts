/**
 * Delete all keys in an object that have a specific value
 *
 * @example
 * const obj = { a: 1, b: 2, c: 3, d: 2 };
 * deleteByValue(obj, 2);
 * console.log(obj); // { a: 1, c: 3 }
 */
export function deleteByValue<T>(obj: Record<any, T>, val: T) {
  for (const key in obj) {
    if (obj[key] == val) delete obj[key];
  }
}
