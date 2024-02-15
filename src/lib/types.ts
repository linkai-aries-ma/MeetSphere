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

export enum Preference {
  high = 3,
  medium = 2,
  low = 1,
  none = 0,
}

export interface Contact {
  id: number
  name: string
  email: string
  pfp: string
}

export interface PendingMeeting {
  id: number
  with: Contact
  description: string
  durationMinutes: number
}

export interface ScheduledMeeting extends PendingMeeting {
  time: string // ISO time
}

export interface TimeSlot {
  startTime: string // ISO time
  endTime: string // ISO time
  preference: Preference
}

export interface Calendar {
  id: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  timeSlots: TimeSlot[]

  // Metadata
  created: string // ISO time
  modified: string // ISO time
}