import { Contact } from './types.ts'

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

export function getAvatar(contact: Contact) {
  if (contact.pfp) return contact.pfp
  return `https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}&backgroundType=gradientLinear`
}