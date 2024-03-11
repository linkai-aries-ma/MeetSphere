import { Calendar, Contact, Meeting, UserSelf } from './types.ts'

export const EX_SELF: UserSelf = {
  id: 1,
  name: 'LinKai',
  email: 'linkai@example.com',
}

export const EX_CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Azalea',
    email: 'azalea@example.com',
    pfp: 'assets/azalea.jpg',
  },
  {
    id: 2,
    name: 'Henry',
    email: 'henry@example.com',
    pfp: 'assets/henry.jpg',
  },
  {
    id: 3,
    name: 'Will',
    email: 'will@example.com',
    pfp: 'assets/will.jpg',
  },
  {
    id: 4,
    name: 'LinKai',
    email: 'linkai@example.com',
    pfp: 'assets/linkai.jpg',
  },
]

export const EX_MEETINGS: Meeting[] = [
  {
    id: 1,
    calendarId: 1,
    creator: EX_SELF,
    invitee: EX_CONTACTS[0],
    title: 'Website Layout Design',
    description: 'We should discuss the layout of the website.',
    time: '2024-01-28T10:00:00',
    duration: 60,
    regularity: 'once',
  },
  {
    id: 2,
    calendarId: 1,
    creator: EX_SELF,
    invitee: EX_CONTACTS[1],
    title: 'Schedule Page Discussion',
    description: 'We should finalize the schedule page and its features.',
    time: '2024-01-28T14:00:00',
    duration: 30,
    regularity: 'weekly',
  },
  {
    id: 3,
    calendarId: 1,
    creator: EX_SELF,
    invitee: EX_CONTACTS[3],
    title: 'Cat Meeting',
    description: 'We should let our cats meet to see if they get along together.',
    time: '2024-01-30T16:00:00',
    duration: 45,
    regularity: 'weekly',
  },
  {
    id: 4,
    calendarId: 1,
    creator: EX_SELF,
    invitee: EX_CONTACTS[2],
    title: 'Integration of Pages',
    description: 'We should integrate our pages to work together.',
    duration: 30,
    regularity: 'once',
  }
]

export const EX_CALENDARS: Calendar[] = [
  {
    id: 1,
    start_date: '2025-01-27',
    end_date: '2026-02-02',
    created: '2024-01-25T15:38:00',
    modified: '2024-01-25T18:50:00',
    timezone: 'America/New_York',

    // These are test cases for the CalendarView
    time_slots: [
      // Basic functionality test
      { 'start': '2024-01-27T09:00:00', 'end': '2024-01-27T10:00:00', 'preference': 3 },
      // Time slots spanning multiple hours
      { 'start': '2024-01-28T14:30:00', 'end': '2024-01-28T16:30:00', 'preference': 2 },
      // Time slots with partial hour duration
      { 'start': '2024-01-29T11:15:00', 'end': '2024-01-29T11:45:00', 'preference': 1 },
      { 'start': '2024-01-29T11:45:00', 'end': '2024-01-29T12:15:00', 'preference': 3 },
      // Overlapping time slots (nope, let's assume there are no overlapping time slots)
      { 'start': '2024-01-30T10:00:00', 'end': '2024-01-30T10:50:00', 'preference': 2 },
      // {'startTime': '2024-01-30T10:30:00', 'endTime': '2024-01-30T11:30:00', 'preference': 2},
      // Edge of a calendar range
      { 'start': '2024-01-31T23:00:00', 'end': '2024-02-01T00:00:00', 'preference': 3 },
      { 'start': '2024-02-01T00:00:00', 'end': '2024-02-01T01:00:00', 'preference': 2 },
      // Time slots spanning multiple days
      { 'start': '2024-02-01T23:00:00', 'end': '2024-02-02T01:00:00', 'preference': 1 },
    ],

    meetings: EX_MEETINGS,
  },
  {
    id: 2,
    start_date: '2024-01-05',
    end_date: '2024-01-10',
    created: '2024-01-03T12:00:00',
    modified: '2024-01-03T12:00:00',
    timezone: 'America/New_York',

    time_slots: [
      {
        start: '2024-01-05T09:00:00',
        end: '2024-01-05T14:00:00',
        preference: 3,
      },
      {
        start: '2024-01-07T10:00:00',
        end: '2024-01-07T20:00:00',
        preference: 2,
      },
    ],

    meetings: [
      {
        id: 5,
        calendarId: 2,
        creator: EX_SELF,
        invitee: EX_CONTACTS[0],
        title: 'Arcade Session',
        description: '',
        duration: 60,
        regularity: 'once',
        time: '2024-01-07T19:00:00',
      },
    ],
  }
]