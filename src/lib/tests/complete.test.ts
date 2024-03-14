import { createSession, deleteSession } from './test_helper.ts'
import { CALENDAR, CONTACT, MEETING } from '../sdk.ts'
import { NewMeeting } from '../types.ts'

test('Complete functionality', async () => {
  // First, the organizer creates an account and logs in
  await createSession()

  // Then, the organizer creates a calendar with their availability
  await expect(CALENDAR.add({
    start_date: '2022-12-12',
    end_date: '2022-12-15',
    start_hour: 9,
    end_hour: 18,
    timezone: 'America/New_York',
  })).resolves.not.toThrow()

  // The organizer adds their availability to the calendar
  const calendars = await CALENDAR.list()
  await expect(CALENDAR.update({
    id: calendars[0].id,
    time_slots: [
      { start: '2022-12-12T09:00:00', end: '2022-12-12T10:00:00', preference: 3 },
      { start: '2022-12-12T10:00:00', end: '2022-12-12T11:00:00', preference: 2 },
      { start: '2022-12-15T11:00:00', end: '2022-12-15T12:00:00', preference: 1 },
    ],
  })).resolves.not.toThrow()

  // The organizer creates a contact
  await expect(CONTACT.add({ name: 'Azalea', email: 'azalea@hydev.org' })).resolves.not.toThrow()
  const contact = (await CONTACT.list())[0]

  // The organizer creates a meeting with the contact
  await expect(MEETING.add({
    title: 'Test Meeting',
    description: 'This is a test meeting',
    duration: 30,
    regularity: 'once',
    invitee: contact.id,
    calendar: calendars[0].id,
  })).resolves.not.toThrow()
  const meetings = (await MEETING.list())[0]

  // The organizer sends out invitations (this will actually send out an email)
  // await expect(MEETING.invite(meetings.id)).resolves.not.toThrow()

  // The organizer logs out
  await deleteSession()

  // The invitee receives the invitation and clicks on the link
  // The invitee should not need to log in, as the link should contain a token
  // The invitee first see the meeting details
  const meeting = await MEETING.get(meetings.id)
  expect(meeting.title).toBe('Test Meeting')
  expect(meeting.description).toBe('This is a test meeting')
  expect(meeting.duration).toBe(30)
  expect(meeting.regularity).toBe('once')
  expect(meeting.calendar.id).toBe(calendars[0].id)
  expect(meeting.invitee.id).toBe(contact.id)

  // The invitee then selects a time slot
  await expect(MEETING.accept(meeting.id, meeting.calendar.time_slots[0].start)).resolves.not.toThrow()
})
