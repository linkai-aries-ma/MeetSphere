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

const TEST_CONTACT = { name: 'Azalea', email: 'hykilpikonna@gmail.com' }

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

  const meetings = await MEETING.list()
  expect(meetings.length).toBe(1)
  expect(meetings[0].title).toBe(TEST_MEETING.title)
  expect(meetings[0].description).toBe(TEST_MEETING.description)
  expect(meetings[0].duration).toBe(TEST_MEETING.duration)
  expect(meetings[0].regularity).toBe(TEST_MEETING.regularity)
  expect(meetings[0].calendar.id).toBe(calendar.id)
  expect(meetings[0].invitee.id).toBe(contact.id)

  // Send out invitations (this will actually send out an email)
  // await expect(MEETING.invite(meetings[0].id)).resolves.not.toThrow()
  // Send out a reminder (this will actually send out an email)
  // await expect(MEETING.remind(meetings[0].id)).resolves.not.toThrow()

  await deleteSession()

  // Accept the invitation (this endpoint should be unauthenticated)
  await expect(MEETING.accept(meetings[0].id, '2022-12-12T09:00:00')).resolves.not.toThrow()
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

  // Accepting a meeting that doesn't exist
  await expect(MEETING.accept('invalidId', '2022-12-12T09:00:00')).rejects.toThrow()

  // Inviting to a meeting that doesn't exist
  await expect(MEETING.invite('invalidId')).rejects.toThrow()

  await deleteSession()
})

