import { createSession, deleteSession } from './test_helper.ts'
import { EX_CALENDARS } from '../examples.ts'
import { CALENDAR } from '../sdk.ts'

test('Calendar features', async () => {
  await createSession()

  // Getting a calendar now should return an empty array
  await expect(CALENDAR.list()).resolves.toEqual([])

  // Create a calendar
  await expect(CALENDAR.add({
    start_date: '2022-12-12',
    end_date: '2022-12-15',
    timezone: 'America/New_York',
  })).resolves.not.toThrow()

  await expect(CALENDAR.add({
    start_date: '2022-12-16',
    end_date: '2022-12-23',
    timezone: 'America/New_York',
  })).resolves.not.toThrow()

  // List the calendars
  const calendars = await CALENDAR.list()
  expect(calendars.length).toBe(2)
  expect(calendars.find(calendar => calendar.start_date === '2022-12-12')).toBeTruthy()

  // Delete the second calendar
  await expect(CALENDAR.delete(calendars.find(calendar => calendar.start_date === '2022-12-16').id))
    .resolves.not.toThrow()

  // Add time slots
  await expect(CALENDAR.update({
    id: calendars[0].id,
    time_slots: [
      { start: '2022-12-12T09:00:00', end: '2022-12-12T10:00:00', preference: 3 },
      { start: '2022-12-12T10:00:00', end: '2022-12-12T11:00:00', preference: 2 },
    ],
  })).resolves.not.toThrow()

  // Check if the time slots are added
  const updatedCalendars = await CALENDAR.list()
  expect(updatedCalendars[0].time_slots.length).toBe(2)
  expect(updatedCalendars[0].time_slots.find(slot => slot.start === '2022-12-12T09:00:00')).toBeTruthy()

  // Edit the timezone
  await expect(CALENDAR.update({
    id: calendars[0].id,
    timezone: 'America/Los_Angeles',
  })).resolves.not.toThrow()

  // Check if the timezone is updated
  const updatedCalendars2 = await CALENDAR.list()
  expect(updatedCalendars2[0].timezone).toBe('America/Los_Angeles')

  // Edit without changing anything
  await expect(CALENDAR.update({
    id: calendars[0].id,
  })).resolves.not.toThrow()

  // Check if fields are still there
  expect((await CALENDAR.list())[0].timezone).toBe('America/Los_Angeles')

  await deleteSession()
})