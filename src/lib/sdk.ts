import {EX_CALENDARS, EX_CONTACTS, EX_MEETINGS} from './examples.ts'
import {Calendar, Contact, ScheduledMeeting} from './types.ts'

/**
 * Get the contact list of the current logged-in user
 *
 * @returns Contact list
 */
export async function getContacts(): Promise<Contact[]> {
  // TODO: Fetch contacts from server
  return EX_CONTACTS
}

/**
 * Get the scheduled meetings of the current logged-in user
 *
 * @returns Scheduled meetings
 */
export async function getScheduledMeetings(): Promise<ScheduledMeeting[]> {
  // TODO: Fetch scheduled meetings from server
  return EX_MEETINGS
}

/**
 * Get the calendars of the current logged-in user
 *
 * @returns Calendars
 */
export async function getCalendars(): Promise<Calendar[]> {
  // TODO: Fetch calendars from server
  return EX_CALENDARS
}

