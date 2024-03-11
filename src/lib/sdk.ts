import { EX_CALENDARS, EX_CONTACTS, EX_MEETINGS, EX_SELF } from './examples.ts'
import { Calendar, Contact, Invitation, Meeting, UserSelf } from './types.ts'

const HOST = 'http://localhost:8000'


/**
 * Post data to the server
 *
 * @param node API endpoint
 * @param body Request body object
 * @param method HTTP method
 */
export async function send(node: string, body?: object, method: string = 'POST'): Promise<any> {
  const headers = { 'Content-Type': 'application/json' }
  const init: RequestInit = { method, headers }

  // Add token if exists
  if (localStorage.getItem('token')) {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
  }

  // Add body, treat file as multipart/form-data
  if (body instanceof File) {
    const formData = new FormData()
    formData.append('file', body)
    init.body = formData
    headers['Content-Type'] = 'multipart/form-data'
  }
  else if (body) init.body = JSON.stringify(body)

  const response = await fetch(`${HOST}/${node}/`, init)
  const resp = await response.text()

  if (!response.ok) {
    let result: any
    try {
      result = JSON.parse(resp)
    }
    catch (e) { throw new Error(resp) }

    // If result has only one field, treat it as an error message
    if (Object.keys(result).length === 1)
      throw new Error(result[Object.keys(result)[0]])
    throw new Error(result.message || 'An error occurred')
  }

  try {
    return JSON.parse(resp)
  }
  catch (e) { return resp }
}

const post = (node: string, body: object): Promise<any> => send(node, body, 'POST')
const get = (node: string): Promise<any> => send(node, undefined, 'GET')
const delete_ = (node: string, body: object): Promise<any> => send(node, body, 'DELETE')
const patch = (node: string, body: object): Promise<any> => send(node, body, 'PATCH')


/**
 * Register a new user
 *
 * @param name
 * @param email
 * @param password
 */
export async function register(name: string, email: string, password: string): Promise<void> {
  await post('register', { name, email, password })

  // Login the user
  await login(email, password)
}

interface LoginResponse { token: string }

/**
 * Log in the user
 *
 * @param email
 * @param password
 */
export async function login(email: string, password: string): Promise<void> {
  const resp: LoginResponse = await post('login', { email, password })

  // Store the token
  localStorage.setItem('token', resp.token)

  // Redirect to the home page
  window.location.assign('/home')
}

export async function logout(): Promise<void> {
  await post('logout', {})
  localStorage.removeItem('token')
  window.location.assign('/')
}

/**
 * Get the information of the current logged-in user
 *
 * @returns User information
 */
export async function getUserSelf(): Promise<UserSelf> {
  return get('user')
}

/**
 * Update the information of the current logged-in user
 *
 * @param user New user information
 * @returns Updated user information
 */
export async function updateUser(user: { name?: string, email?: string, password?: string }): Promise<UserSelf> {
  return await post('user', user)
}
export const uploadUserPfp = (file: File): Promise<void> => post('user/pfp', file)

export const CONTACT = {
  get: (): Promise<Contact[]> => get('contacts'),
  add: (contact: { name: string, email: string }): Promise<void> => post('contacts', contact),
  delete: (id: number): Promise<void> => delete_('contacts', { id }),
  update: (contact: Contact): Promise<void> => patch('contacts', contact),
}

/**
 * Get the scheduled meetings of the current logged-in user
 *
 * @returns Scheduled meetings
 */
export async function getScheduledMeetings(): Promise<Meeting[]> {
  // TODO: Fetch scheduled meetings from server
  await new Promise(resolve => setTimeout(resolve, 1000))
  return EX_MEETINGS
}

/**
 * Get the calendars of the current logged-in user
 *
 * @returns Calendars
 */
export async function getCalendars(): Promise<Calendar[]> {
  // TODO: Fetch calendars from server
  await new Promise(resolve => setTimeout(resolve, 1000))
  return EX_CALENDARS
}
export const getCalendar = (): Promise<Calendar[]> => get('calendar')
export const addCalendar = (calendar: Calendar): Promise<void> => post('add_calendar', calendar)

/**
 * Get the invitation information by its UUID
 *
 * @param uuid UUID of the invitation
 */
export async function getInvitation(uuid: string): Promise<Invitation> {
  // TODO: Fetch invitation from server
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    id: uuid,
    cal: EX_CALENDARS[0],
    meeting: {
      id: 10,
      calendarId: 1,
      creator: EX_SELF,
      invitee: EX_CONTACTS[2],
      title: 'Cat Meeting',
      description: 'We should let our cats meet to see if they get along together.',
      duration: 60,
      regularity: 'once',
    },
    from: EX_SELF,
  }
}