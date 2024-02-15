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
  },
  {
    id: 2,
    calendarId: 1,
    with: EX_CONTACTS[1],
    title: 'Schedule Page Discussion',
    description: 'We should finalize the schedule page and its features.',
    time: '2024-01-28T14:00:00',
    durationMinutes: 30,
  },
  {
    id: 3,
    calendarId: 1,
    with: EX_CONTACTS[3],
    title: 'Cat Meeting',
    description: 'We should let our cats meet to see if they get along together.',
    time: '2024-01-30T16:00:00',
    durationMinutes: 45,
  },
  {
    id: 4,
    calendarId: 1,
    with: EX_CONTACTS[2],
    title: 'Integration of Pages',
    description: 'We should integrate our pages to work together.',
    durationMinutes: 30,
  }
]

export const EX_CALENDARS: Calendar[] = [
  {
    id: 1,
    startDate: '2024-01-27',
    endDate: '2024-02-02',
    created: '2024-01-25T15:38:00',
    modified: '2024-01-25T18:50:00',

    meetings: EX_MEETINGS,
  },
  {
    id: 2,
    startDate: '2024-01-05',
    endDate: '2024-01-10',
    created: '2024-01-03T12:00:00',
    modified: '2024-01-03T12:00:00',

    meetings: [
      {
        id: 5,
        calendarId: 2,
        with: EX_CONTACTS[0],
        title: 'Arcade Session',
        description: '',
        durationMinutes: 60,
      },
    ],
  }
]

export const EX_SELF: UserSelf = {
  id: 1,
  name: 'LinKai',
  email: 'linkai@example.com'
}