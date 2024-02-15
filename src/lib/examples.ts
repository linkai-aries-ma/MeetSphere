import { Contact, PendingMeeting } from './types.ts'

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

export const EX_MEETINGS: PendingMeeting[] = [
  {
    id: 1,
    with: EX_CONTACTS[0],
    description: 'Website Layout Design',
    time: '2024-01-28T10:00:00',
    durationMinutes: 60,
  },
  {
    id: 2,
    with: EX_CONTACTS[1],
    description: 'Schedule Page Discussion',
    time: '2024-01-28T14:00:00',
    durationMinutes: 30,
  },
  {
    id: 3,
    with: EX_CONTACTS[3],
    description: 'Cat Meeting',
    time: '2024-01-30T16:00:00',
    durationMinutes: 45,
  },
]
