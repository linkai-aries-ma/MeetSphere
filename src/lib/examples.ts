import {Calendar, Contact, Meeting, UserSelf} from './types.ts'

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
    with: EX_CONTACTS[0],
    title: 'Website Layout Design',
    description: 'We should discuss the layout of the website.',
    time: '2024-01-28T10:00:00',
    durationMinutes: 60,
    regularity: 'once',
  },
  {
    id: 2,
    calendarId: 1,
    with: EX_CONTACTS[1],
    title: 'Schedule Page Discussion',
    description: 'We should finalize the schedule page and its features.',
    time: '2024-01-28T14:00:00',
    durationMinutes: 30,
    regularity: 'weekly',
  },
  {
    id: 3,
    calendarId: 1,
    with: EX_CONTACTS[3],
    title: 'Cat Meeting',
    description: 'We should let our cats meet to see if they get along together.',
    time: '2024-01-30T16:00:00',
    durationMinutes: 45,
    regularity: 'daily',
  },
  {
    id: 4,
    calendarId: 1,
    with: EX_CONTACTS[2],
    title: 'Integration of Pages',
    description: 'We should integrate our pages to work together.',
    durationMinutes: 30,
    regularity: 'once',
  }
]

export const EX_CALENDARS: Calendar[] = [
  {
    id: 1,
    startDate: '2024-01-27',
    endDate: '2024-02-02',
    created: '2024-01-25T15:38:00',
    modified: '2024-01-25T18:50:00',
    timezone: 'America/New_York',

    timeSlots: [
      {
        startTime: '2024-01-27T09:00:00',
        endTime: '2024-01-27T10:00:00',
        preference: 3,
      },
      {
        startTime: '2024-01-27T10:00:00',
        endTime: '2024-01-27T11:00:00',
        preference: 2,
      },
      {
        startTime: '2024-01-27T11:00:00',
        endTime: '2024-01-27T12:00:00',
        preference: 1,
      },
      {
        startTime: '2024-01-27T13:00:00',
        endTime: '2024-01-27T14:00:00',
        preference: 3,
      },
      {
        startTime: '2024-01-27T14:00:00',
        endTime: '2024-01-27T15:00:00',
        preference: 2,
      },
      {
        startTime: '2024-01-27T15:00:00',
        endTime: '2024-01-27T16:00:00',
        preference: 1,
      },
      {
        startTime: '2024-01-27T17:00:00',
        endTime: '2024-01-27T18:00:00',
        preference: 3,
      },
      {
        startTime: '2024-01-27T18:00:00',
        endTime: '2024-01-27T19:00:00',
        preference: 2,
      },
      {
        startTime: '2024-01-27T19:00:00',
        endTime: '2024-01-27T20:00:00',
        preference: 1,
      },
    ],

    meetings: EX_MEETINGS,
  },
  {
    id: 2,
    startDate: '2024-01-05',
    endDate: '2024-01-10',
    created: '2024-01-03T12:00:00',
    modified: '2024-01-03T12:00:00',
    timezone: 'America/New_York',

    timeSlots: [
      {
        startTime: '2024-01-05T09:00:00',
        endTime: '2024-01-05T14:00:00',
        preference: 3,
      },
      {
        startTime: '2024-01-07T10:00:00',
        endTime: '2024-01-07T20:00:00',
        preference: 2,
      },
    ],

    meetings: [
      {
        id: 5,
        calendarId: 2,
        with: EX_CONTACTS[0],
        title: 'Arcade Session',
        description: '',
        durationMinutes: 60,
        regularity: 'once',
        time: '2024-01-07T19:00:00',
      },
    ],
  }
]

export const EX_SELF: UserSelf = {
  id: 1,
  name: 'LinKai',
  email: 'linkai@example.com',
}