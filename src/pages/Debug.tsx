import * as React from 'react'
import { Loading } from '../components/Loading.tsx'
import { CALENDAR, CONTACT, MEETING, USER } from '../lib/sdk.ts'
import moment from 'moment'
import { NewMeeting } from '../lib/types.ts'
import { OPTIONS, redirect } from '../lib/ui.ts'

export function Debug() {
  const [ loading, setLoading ] = React.useState(false)
  const [ error, setError ] = React.useState<string | null>(null)

  async function createDummyData() {
    if (loading) return
    setLoading(true)

    console.log('Creating dummy data')

    // Disable redirect
    OPTIONS.noRedirect = true

    // Create dummy user
    const randstr = Math.random().toString(36).substring(7)
    const email = `${randstr}@example.com`
    const password = 'password123'

    await USER.register(randstr, email, password)
    await USER.login(email, password)

    // Create example contacts
    await Promise.all([ 'Azalea', 'Henry', 'Will', 'LinKai' ].map(name => CONTACT.add({ name, email: `${name}@example.com` })))
    const contacts = await CONTACT.list()
    
    // Create example calendar
    const calId = (await CALENDAR.add({
      start_date: moment().format('YYYY-MM-DD'),
      end_date: moment().add(1, 'week').format('YYYY-MM-DD'),
      start_hour: 0,
      end_hour: 23,
      timezone: 'America/New_York',
    })).id

    const oldCalId = (await CALENDAR.add({
      start_date: '2024-01-05',
      end_date: '2024-01-10',
      start_hour: 0,
      end_hour: 23,
      timezone: 'America/New_York',
    })).id

    // Create example time slots
    let timeSlots = [
      // Basic functionality test
      { start: '2024-01-27T09:00:00', end: '2024-01-27T10:00:00', preference: 3 },
      // Time slots spanning multiple hours
      { start: '2024-01-28T14:30:00', end: '2024-01-28T16:30:00', preference: 2 },
      // Time slots with partial hour duration
      { start: '2024-01-29T11:15:00', end: '2024-01-29T11:45:00', preference: 1 },
      { start: '2024-01-29T11:45:00', end: '2024-01-29T12:15:00', preference: 3 },
      // Overlapping time slots (nope, let's assume there are no overlapping time slots)
      { start: '2024-01-30T10:00:00', end: '2024-01-30T10:50:00', preference: 2 },
      // {'startTime': '2024-01-30T10:30:00', 'endTime': '2024-01-30T11:30:00', preference: 2},
      // Edge of a calendar range
      { start: '2024-01-31T23:00:00', end: '2024-02-01T00:00:00', preference: 3 },
      { start: '2024-02-01T00:00:00', end: '2024-02-01T01:00:00', preference: 2 },
      // Time slots spanning multiple days
      { start: '2024-02-01T22:00:00', end: '2024-02-02T00:00:00', preference: 1 },
    ]
    // Shift example timeslots from 2024-01-27 to the current date
    const dayDelta = moment().diff(moment('2024-01-27'), 'days')
    timeSlots = timeSlots.map(slot => {
      const start = moment(slot.start).add(dayDelta, 'days').format()
      const end = moment(slot.end).add(dayDelta, 'days').format()
      return { ...slot, start, end }
    })
    await CALENDAR.update({ id: calId, time_slots: timeSlots })

    const oldTimeSlots = [
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
    ]
    await CALENDAR.update({ id: oldCalId, time_slots: oldTimeSlots })

    // Create example meetings
    const meetingData: NewMeeting[] = [
      {
        calendar: oldCalId,
        invitee: contacts[0].id,
        title: 'Arcade Session',
        description: 'Meet up for some arcade games',
        duration: 60,
        regularity: 'once',
      },
      {
        calendar: calId,
        invitee: contacts[0].id,
        title: 'Website Layout Design',
        description: 'We should discuss the layout of the website.',
        duration: 60,
        regularity: 'once',
      },
      {
        calendar: calId,
        invitee: contacts[1].id,
        title: 'Schedule Page Discussion',
        description: 'We should finalize the schedule page and its features.',
        duration: 30,
        regularity: 'weekly',
      },
      {
        calendar: calId,
        invitee: contacts[3].id,
        title: 'Cat Meeting',
        description: 'We should let our cats meet to see if they get along together.',
        duration: 45,
        regularity: 'weekly',
      },
      {
        calendar: calId,
        invitee: contacts[2].id,
        title: 'Integration of Pages',
        description: 'We should integrate our pages to work together.',
        duration: 30,
        regularity: 'once',
      },
    ]
    await Promise.all(meetingData.map(m => MEETING.add(m)))
    const meetings = await MEETING.list()

    // Add timeslots to some meetings
    await MEETING.accept(meetings.find(m => m.title === 'Website Layout Design')!.id, timeSlots[0].start)
    await MEETING.accept(meetings.find(m => m.title === 'Schedule Page Discussion')!.id, timeSlots[1].start)
    await MEETING.accept(meetings.find(m => m.title === 'Cat Meeting')!.id, timeSlots[2].start)
    await MEETING.accept(meetings.find(m => m.title === 'Arcade Session')!.id, oldTimeSlots[0].start)

    // Restore redirect
    OPTIONS.noRedirect = false
    redirect('/home')

    setLoading(false)
    alert('Done')
  }

  function callAsync(fn: () => Promise<void>) {
    fn().catch(err => setError(err.message)).finally(() => setLoading(false))
  }

  return <main>
    <h1>Debug Page</h1>
    <div>This is the debug page, you can use the debug functions below:</div>
    <button onClick={() => callAsync(createDummyData)}>Create dummy data</button>

    <Loading loading={loading} error={error}/>
  </main>
} 