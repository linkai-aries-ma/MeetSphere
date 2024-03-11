import { createSession, deleteSession } from './test_helper.ts'
import { CALENDAR, CONTACT, MEETING } from '../sdk.ts'
import { NewMeeting } from '../types.ts'

const TEST_MEETING: NewMeeting = {
  title: 'Test Meeting',
  description: 'This is a test meeting',
  duration: 30,
  regularity: 'once',
  invitee: -1,
  calendar: -1,
}

const TEST_CALENDAR = {
  start_date: '2022-12-12',
  end_date: '2022-12-15',
  timezone: 'America/New_York',
}

const TEST_CONTACT = { name: 'Neko', email: 'neko@hydev.org' }

async function createCalendarAndContact() {
  await Promise.all([
    CALENDAR.add(TEST_CALENDAR),
    CONTACT.add(TEST_CONTACT),
  ])

  const calendar = (await CALENDAR.list())[0]
  const contact = (await CONTACT.list())[0]

  return { calendar, contact }
}

test('Meeting features', async () => {
  await createSession()

  // Right now there are no meetings
  await expect(MEETING.list()).resolves.toEqual([])

  // Create calendar and contact
  const { calendar, contact } = await createCalendarAndContact()

  // Create a meeting
  await expect(MEETING.add({
    ...TEST_MEETING,
    calendar: calendar.id,
    invitee: contact.id,
  })).resolves.not.toThrow()

  await deleteSession()
})

test('Meeting error handling', async () => {
  await createSession()

  // Try creating a meeting with an invalid calendar and invitee
  await expect(MEETING.add(TEST_MEETING)).rejects.toThrow()

  // Create calendar and contact
  const { calendar, contact } = await createCalendarAndContact()

  // Try creating a meeting with an invalid calendar
  await expect(MEETING.add({
    ...TEST_MEETING,
    calendar: -1,
    invitee: contact.id,
  })).rejects.toThrow()

  // Try creating a meeting with an invalid invitee
  await expect(MEETING.add({
    ...TEST_MEETING,
    calendar: calendar.id,
    invitee: -1,
  })).rejects.toThrow()

  // Create another account
  await createSession()

  // Try to create a meeting with someone else's calendar and contact
  await expect(MEETING.add({
    ...TEST_MEETING,
    calendar: calendar.id,
    invitee: contact.id,
  })).rejects.toThrow()

  await deleteSession()
})

