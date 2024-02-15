import moment from 'moment'
import {FillScheduleViewProps, Invitation, Meeting, MeetingStatus} from './types.ts'

// TODO: Use actual data
export const DATE_NOW = moment('2024-01-28T12:00:00')

/**
 * Create a local invitation link
 *
 * @param invitation Invitation object (check lib.d.ts)
 * @returns Local invitation link
 */
export function createLink(invitation: Invitation): string {
  // Get URL base (scheme://host:port)
  const base = `${window.location.protocol}//${window.location.host}`

  // Encode invitation in json > base64
  const json = JSON.stringify(invitation)
  const base64 = btoa(json)

  // Create link
  return `${base}/schedule?invitation=${base64}`
}

/**
 * Create an empty 2D availability array
 * @param days Number of days
 * @returns 2D array of 0s, each sub-array represents a day, each element represents 15 minutes
 */
function emptyAvailability(days: number): number[][] {
  return Array(days)
    .fill(0)
    .map(() => Array(24 * 4).fill(0))
}

/**
 * Get the status of a meeting
 *
 * @param event Meeting object
 */
export function getMeetingStatus(event: Meeting): MeetingStatus {
  if (!('time' in event))
    return 'invited'
  if (moment(event.time).add(event.durationMinutes, 'minutes').isBefore(DATE_NOW))
    return 'complete'
  if (moment(event.time).isBefore(DATE_NOW))
    return 'in-progress'
  return 'scheduled'
}

/**
 * Get the calendar grid for the given year and month
 *
 * @param year Year
 * @param month Month index (0-11) !!! Important !!!
 * @returns 2D array of the calendar grid
 */
export function getCalendarGrid(year: number, month: number): moment.Moment[][] {
  // Get the day of the week of the first day of the month
  let date = moment([year, month, 1])
  const dow = date.day()

  // Grid row
  const grid = []
  let row = []

  // Entries before the first day of the month
  date = date.subtract(dow, 'd')

  // Loop until the next month
  while (true) {
    // If row is full, add it to the grid
    if (row.length === 7) {
      grid.push(row)
      row = []

      // If the next day is in the next month, stop
      if (grid.length > 1 && date.month() !== month) break
    }

    // Next date
    row.push(date.clone())
    date = date.add(1, 'd')
  }

  return grid
}

export const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

console.log('lib.js loaded')

// Below is an example of how to use the functions above to create an invitation link

const avail = emptyAvailability(7)
// Set Friday 9:00 to 10:00 to 1 (available)
Array(4).fill(0).map((_, i) => (avail[5][9 * 4 + i] = 1))
// Set Monday 10:00 to 11:00 to 1 (available)
Array(4).fill(0).map((_, i) => (avail[1][10 * 4 + i] = 2))
// Set Wednesday 13:00 to 19:00 to 1 (available)
Array(4 * 6).fill(0).map((_, i) => (avail[3][13 * 4 + i] = 3))

const DEBUG_INVITATION: Invitation = {
  id: 'ab1ab1d0-1677-46a6-a95d-e0d990a08c48',
  title: 'Cat meeting',
  description: 'We should let our cats meet to see if they get along together.',
  location: 'Azalea\'s house',
  organizer: 'Azalea',
  participant: 'Lily',
  startDate: '2021-10-01',

  regularity: 'weekly',
  duration: 60,
  timezone: 'America/New_York',
  daysRequired: 1,
  availability: avail,
}

console.log(createLink(DEBUG_INVITATION))
