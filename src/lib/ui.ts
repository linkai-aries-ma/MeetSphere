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
  if (contact.profile_image) return contact.profile_image
  return `https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}&backgroundType=gradientLinear`
}

export const OPTIONS = { noRedirect: false }

export function redirect(url: string) {
  if (OPTIONS.noRedirect) console.log(`Redirect blocked: ${url}`)
  else window.location.assign(url)
}