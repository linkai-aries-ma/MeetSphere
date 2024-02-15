import moment from 'moment'

export interface Invitation {
  id: string
  cal: Calendar
  meeting: Meeting
  from: UserSelf
}

/**
 * Time slot preference
 */
export enum Preference {
  high = 3,
  medium = 2,
  low = 1,
}

/**
 * Contact information
 */
export interface Contact {
  id: number
  name: string
  email: string
  pfp: string
}

/**
 * Meeting request
 */
export interface Meeting {
  id: number
  calendarId: number
  with: Contact
  title: string
  location?: string
  description: string
  durationMinutes: number
  regularity: 'once' | 'weekly'

  // A meeting would be pending response if time is not set
  time?: string // ISO time
}

export type MeetingStatus = 'invited' | 'scheduled' | 'in-progress' | 'complete'

/**
 * A time slot indicating availability on a calendar
 */
export interface TimeSlot {
  startTime: string // ISO time
  endTime: string // ISO time
  preference: Preference
}

/**
 * A calendar for a period of time
 */
export interface Calendar {
  id: number
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD

  meetings: Meeting[]

  // Metadata
  created: string // ISO time
  modified: string // ISO time
  timeSlots: TimeSlot[]
  timezone: string
}

/**
 * Information of the current logged-in user
 */
export interface UserSelf {
  id: number
  name: string
  email: string
}