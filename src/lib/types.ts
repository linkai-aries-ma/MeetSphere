import moment from 'moment'

export interface Invitation {
  id: string
  title: string
  description: string
  location: string
  organizer: string
  participant: string

  // Requirement for the meeting time
  regularity: 'once' | 'daily' | 'weekly'
  duration: number // in minutes
  timezone: string
  daysRequired?: number

  startDate: string // Only relevant for regularity = 'once'
}

export interface FillScheduleViewProps {
  nDays: number
  startDate: string
  regularity: string
  availability?: number[][]

  // CSS selector for the container to mount the schedule view
  mountPoint: string
}

/**
 * Time slot preference
 */
export enum Preference {
  high = 3,
  medium = 2,
  low = 1,
  none = 0,
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
  description: string
  durationMinutes: number

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
}

/**
 * Information of the current logged-in user
 */
export interface UserSelf {
  id: number
  name: string
  email: string
}