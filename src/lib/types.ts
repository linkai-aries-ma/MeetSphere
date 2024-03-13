import moment from 'moment'

/**
 * Time slot preference
 */
export enum Preference {
  high = 3,
  medium = 2,
  low = 1,
}

export const PREFERENCE_STR = {
  3: 'High',
  2: 'Medium',
  1: 'Low',
}

/**
 * Contact information
 */
export interface Contact extends NewContact {
  id: number
  pfp?: string
}

export interface NewContact {
  name: string
  email: string
}

/**
 * Meeting request
 */
export interface Meeting extends NewMeeting {
  id: string // UUID
  calendar: Calendar

  created_at?: string // ISO time
  updated_at?: string // ISO time

  creator: UserSelf
  invitee: Contact

  // A meeting would be pending response if time is not set
  time?: string // ISO time
}

export interface NewMeeting {
  calendar: number | Calendar

  title: string
  description: string
  is_virtual?: boolean
  location?: string

  duration: number // minutes
  regularity: 'once' | 'weekly'

  invitee: number | Contact
}

export type MeetingStatus = 'invited' | 'scheduled' | 'in-progress' | 'complete'

/**
 * A time slot indicating availability on a calendar
 */
export interface TimeSlot {
  start: string // ISO time
  end: string // ISO time
  preference: Preference
}

/**
 * A calendar for a period of time
 */
export interface Calendar extends NewCalendar {
  id: number

  // Metadata
  created: string // ISO time
  modified: string // ISO time
  time_slots: TimeSlot[]
}

export interface CalendarWithMeetings extends Calendar {
  meetings: Meeting[]
}

export interface NewCalendar {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  timezone: string
  start_hour: number
  end_hour: number
}

/**
 * Information of the current logged-in user
 */
export interface UserSelf {
  id: number
  name: string
  email: string
  profile_image?: string
  password?: string
}