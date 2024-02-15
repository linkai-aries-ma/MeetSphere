import moment from 'moment'
import {Meeting, MeetingStatus} from './types.ts'

// TODO: Use actual data
export const DATE_NOW = moment('2024-01-28T12:00:00')

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
