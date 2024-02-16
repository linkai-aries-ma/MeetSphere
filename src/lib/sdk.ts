import { EX_CALENDARS, EX_CONTACTS, EX_MEETINGS, EX_SELF } from './examples.ts'
import { Calendar, Contact, Invitation, Meeting, UserSelf } from './types.ts'

const HOST = 'http://localhost:8000'


/**
 * Post data to the server
 *
 * @param node API endpoint
 * @param body Request body object
 */
export async function post(node: string, body?: object): Promise<any> {
  const response = await fetch(`${HOST}/${node}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })

  if (!response.ok) {
    const result = await response.json()

    // If result has only one field, treat it as an error message
    if (Object.keys(result).length === 1)
      throw new Error(result[Object.keys(result)[0]])
    throw new Error(result.message || 'An error occurred')
  }

  return response.json()
}

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

interface LoginResponse {
  token: string
}

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
  window.location.href = '/home'
}

/**
 * Get the contact list of the current logged-in user
 *
 * @returns Contact list
 */
export async function getContacts(): Promise<Contact[]> {
  // TODO: Fetch contacts from server
  await new Promise(resolve => setTimeout(resolve, 1000))
  return EX_CONTACTS
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

/**
 * Get the information of the current logged-in user
 *
 * @returns User information
 */
export async function getUserSelf(): Promise<UserSelf> {
  // TODO: Fetch user information from server
  await new Promise(resolve => setTimeout(resolve, 1000))
  return EX_SELF
}

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
      with: EX_CONTACTS[2],
      title: 'Cat Meeting',
      description: 'We should let our cats meet to see if they get along together.',
      durationMinutes: 60,
      regularity: 'once',
    },
    from: EX_SELF,
  }
}