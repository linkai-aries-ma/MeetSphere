import { createSession, deleteSession } from './test_helper.ts'
import { CALENDAR } from '../sdk.ts'

export const TEST_CAL = {
  start_date: '2022-12-12',
  end_date: '2022-12-15',
  start_hour: 9,
  end_hour: 18,
  timezone: 'America/New_York',
}

test('Calendar features', async () => {
  await createSession()

  // Getting a calendar now should return an empty array
  await expect(CALENDAR.list()).resolves.toEqual([])

  // Create a calendar
  await expect(CALENDAR.add(TEST_CAL)).resolves.not.toThrow()

  await expect(CALENDAR.add({
    start_date: '2022-12-16',
    end_date: '2022-12-23',
    start_hour: 0,
    end_hour: 23,
    timezone: 'America/New_York',
  })).resolves.not.toThrow()

  // List the calendars
  const calendars = await CALENDAR.list()
  expect(calendars.length).toBe(2)
  expect(calendars.find(calendar => calendar.start_date === '2022-12-12')).toBeTruthy()

  // Delete the second calendar
  await expect(CALENDAR.delete(calendars.find(calendar => calendar.start_date === '2022-12-16').id))
    .resolves.not.toThrow()

  // Check if the fields in the calendar are properly created
  const calendar = (await CALENDAR.list())[0]
  expect(calendar.start_date).toBe('2022-12-12')
  expect(calendar.end_date).toBe('2022-12-15')
  expect(calendar.timezone).toBe('America/New_York')
  expect(calendar.id >= 0).toBeTruthy()
  expect(calendar.created).toBeTruthy()
  expect(calendar.modified).toBeTruthy()
  expect(calendar.time_slots).toEqual([])

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


test('Calendar error handling', async () => {
  await createSession()

  // Invalid input: start date after end date
  await expect(CALENDAR.add({ ...TEST_CAL,
    start_date: '2022-12-16',
    end_date: '2022-12-15',
  })).rejects.toThrow()

  // Invalid input: start hour after end hour
  await expect(CALENDAR.add({ ...TEST_CAL,
    start_hour: 18,
    end_hour: 9,
  })).rejects.toThrow()

  // Invalid input: hours < 0 or > 23
  await expect(CALENDAR.add({ ...TEST_CAL, start_hour: -1 })).rejects.toThrow()
  await expect(CALENDAR.add({ ...TEST_CAL, start_hour: 24 })).rejects.toThrow()
  await expect(CALENDAR.add({ ...TEST_CAL, end_hour: -1 })).rejects.toThrow()
  await expect(CALENDAR.add({ ...TEST_CAL, end_hour: 24 })).rejects.toThrow()

  await deleteSession()
})