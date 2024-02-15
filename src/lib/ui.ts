/**
 * Convert object keys to classes depending on their values
 *
 * @param obj Dictionary object {classname: truthy}
 * @param others Other classes to add
 */
export function clz(obj: any, others?: string) {
  let cls = Object.keys(obj)
    .filter(key => obj[key])
    .join(' ')
  if (others) cls += ' ' + others
  return cls
}
