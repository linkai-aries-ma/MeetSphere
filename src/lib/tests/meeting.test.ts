import { createSession, deleteSession } from './test_helper.ts'
import { CALENDAR, CONTACT, MEETING } from '../sdk.ts'

test('Meeting features', async () => {
  await createSession()

  // Right now there are no meetings
  await expect(MEETING.list()).resolves.toEqual([])

  // Create a calendar first
  await expect(CALENDAR.add({
    start_date: '2022-12-12',
    end_date: '2022-12-15',
    timezone: 'America/New_York',
  })).resolves.not.toThrow()

  // Get the calendar's id
  const calendars = await CALENDAR.list()

  // Create a contact
  await expect(CONTACT.add({ name: 'Neko', email: 'neko@hydev.org' }))
    .resolves.not.toThrow()

  // Get the contact's id
  const contacts = await CONTACT.list()

  // Create a meeting
  await expect(MEETING.add({
    title: 'Test Meeting',
    description: 'This is a test meeting',
    duration: 30,
    regularity: 'once',

    calendar: calendars[0].id,
    invitee: contacts[0].id,
  })).resolves.not.toThrow()

  await deleteSession()
})

