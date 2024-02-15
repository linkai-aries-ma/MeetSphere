import moment from 'moment'
import { FillScheduleViewProps, Invitation } from './types.ts'

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
 * Fill the schedule view with a dynamic grid calendar for timeslot selection
 *
 * @param props Arguments for fillScheduleView
 */
export function fillScheduleView(props: FillScheduleViewProps) {
  // Generate the available time slot view
  // This should be a grid of n days * 24 (1-hour interval) cells
  // Each column is a day, each row is an 1-hour interval
  // This table is just a grid
  // Availability is overlayed as absolute positioned divs inside the td
  let tmpHtml = '<tr id="ms-schedule-header"><th></th>'
  for (let day = 0; day < props.nDays; day++) {
    if (props.regularity === 'once') tmpHtml += `<th>${moment(props.startDate).add(day, 'days').format('ddd, MMM D')}</th>`
    else if (props.regularity === 'weekly') tmpHtml += `<th>${moment().day(day).format('ddd')}</th>`
  }
  tmpHtml += '</tr>'

  // Fill 1-hour grid
  for (let hour = 0; hour < 24; hour++) {
    tmpHtml += `<tr><td class="time">${hour}:00</td>`

    for (let day = 0; day < props.nDays; day++) {
      tmpHtml += `<td class="day" data-day="${day}" data-hour="${hour}"></td>`
    }
    tmpHtml += '</tr>'
  }
  $(props.mountPoint).html(tmpHtml)

  const preferences = {
    3: 'High',
    2: 'Medium',
    1: 'Low',
  }

  // Find continuous intervals of availability and inject each into the calendar
  if (props.availability === undefined) return
  for (let day = 0; day < props.nDays; day++) {
    // 15-minute intervals
    for (let interval = 0; interval < 24 * 4; interval++) {
      // Ignore non-available intervals
      const avail = props.availability[day][interval]
      if (avail === 0) continue

      // Find the end of the interval
      let end = interval + 1
      while (end < 24 * 4 && props.availability[day][end] === avail) end++

      // Calculate the height as a percentage of the 1-hour td block
      const h = ((end - interval) * 100) / 4

      console.log(`day: ${day}, interval: ${interval}, end: ${end}, avail: ${avail}, h: ${h}%`)

      // Add a div under the td of the starting interval
      const td = $(`td[data-day="${day}"][data-hour="${Math.floor(interval / 4)}"]`)
      console.log(td)
      td.append(`<div class="avail av${avail}" style="height: ${h}%;">${preferences[avail]}</div>`)

      // Skip the rest of the interval
      interval = end - 1
    }
  }
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

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

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
