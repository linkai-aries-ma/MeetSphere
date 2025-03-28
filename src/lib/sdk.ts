import { Calendar, Contact, Meeting, NewCalendar, NewContact, NewMeeting, UserSelf } from './types.ts'
import { redirect } from './ui.ts'

const HOST = 'http://localhost:8000/api'
// const HOST = '/api'

/**
 * Post data to the server
 *
 * @param node API endpoint
 * @param body Request body object
 * @param method HTTP method
 */
export async function send(node: string, body?: object | FormData, method: string = 'POST'): Promise<any> {
  const headers: { [key: string]: string } = {}

  // Add token if exists
  if (localStorage.getItem('token')) {
    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
  }

  // If body is not FormData, stringify it and set 'Content-Type' to 'application/json'
  let bodyInit: BodyInit | undefined
  // If body is not FormData, stringify it and set 'Content-Type' to 'application/json'
  if (body && !(body instanceof FormData)) {
    bodyInit = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  } else {
    bodyInit = body as FormData
  }

  const init: RequestInit = { method, headers, body: bodyInit }

  const response = await fetch(`${HOST}/${node}/`, init)
  const resp = await response.text()

  if (!response.ok) {
    if (response.status === 401 && node !== 'login' && node !== 'register') {
      localStorage.removeItem('token')
      redirect('/')
    }

    const defaultErr = `${response.status}: ${response.statusText}`
    let result: any
    try {
      result = JSON.parse(resp)
    }
    catch (e) { throw new Error(resp || defaultErr) }

    // Check if the error is token invalid
    if (result.code === 'token_not_valid') {
      localStorage.removeItem('token')
      redirect('/')
    }

    // If result has only one field, treat it as an error message
    if (Object.keys(result).length === 1)
      throw new Error(result[Object.keys(result)[0]] || defaultErr)
    throw new Error(result.message || defaultErr)
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
const put = (node: string, body: FormData): Promise<any> => send(node, body, 'PUT')

/**
 * Register a new user
 *
 * @param name
 * @param email
 * @param password
 */
export async function register(name: string, email: string, password: string): Promise<void> {
  localStorage.removeItem('token')
  
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
  redirect('/home')
}

export async function logout(): Promise<void> {
  await post('logout', {})
  localStorage.removeItem('token')
  redirect('/')
}

export const USER = {
  register,
  login,
  logout,
  isLoggedIn: (): boolean => !!localStorage.getItem('token'),
  get: (): Promise<UserSelf> => get('user'),
  update: (user: Partial<UserSelf>): Promise<UserSelf> => post('user', user),
}

export const CONTACT = {
  list: (): Promise<Contact[]> => get('contacts'),
  add: (contact: NewContact): Promise<void> => post('contacts', contact),
  delete: (id: number): Promise<void> => delete_('contacts', { id }),
  update: (contact: Partial<Contact>): Promise<void> => patch('contacts', contact),
  uploadPfp: (id: number, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('contact', id.toString())

    return post('contacts/pfp', formData)
  }
}

export const CALENDAR = {
  list: (): Promise<Calendar[]> => get('calendar'),
  add: (calendar: NewCalendar): Promise<{ id: number }> => post('calendar', calendar),
  delete: (id: number): Promise<void> => delete_('calendar', { id }),
  update: (calendar: Partial<Calendar>): Promise<void> => patch('calendar', calendar),
  upload: (id: number, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('id', id.toString())

    return put('calendar', formData)
  }
}

export const MEETING = {
  list: (): Promise<Meeting[]> => get('meetings'),
  add: (meeting: NewMeeting): Promise<Meeting> => post('meetings', meeting),
  delete: (id: string): Promise<void> => delete_('meetings', { id }),
  update: (meeting: Partial<Meeting>): Promise<void> => patch('meetings', meeting),
  invite: (id: string): Promise<void> => post(`meetings/${id}/invite`, {}),
  accept: (id: string, time: string) => post(`meetings/${id}/accept`, { time }),
  remind: (id: string) => post(`meetings/${id}/remind`, {}),
  get: (id: string): Promise<Meeting> => get(`meetings/${id}`),
}

// Expose api tools in global scope
Object.assign(window, { api: {
  user: USER,
  contact: CONTACT,
  calendar: CALENDAR,
  meeting: MEETING
} })
