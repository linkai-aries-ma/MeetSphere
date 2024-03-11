import * as React from 'react'
import { Invitation, Preference, TimeSlot } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { getInvitation } from '../lib/sdk.ts'
import { LOCAL_TZ } from '../lib/lib.ts'
import './Schedule.scss'
import moment from 'moment'
import { CalendarView } from '../components/CalendarView.tsx'
import { Loading } from '../components/Loading.tsx'

const regularity = {
  'once': 'This is a one-time meeting, please select a time slot that works best for you.',
  // 'daily': 'This is a recurrent daily meeting, please select a time slot that works best for you.',
  'weekly': 'This is a recurrent weekly meeting, please select a time slot that works best for you.',
}

export function Schedule({ uuid }: {uuid: string}) {
  const [ invitation, setInvitation ] = useState<Invitation | null>(null)
  const [ error, setError ] = useState<string | null>(null)
  const [ loading, setLoading ] = useState(true)

  // Computed
  const [ suggestedSlots, setSuggestedSlots ] = useState<TimeSlot[]>([])

  // Fetch invitation
  useEffect(() => {
    getInvitation(uuid).then(inv => {
      setInvitation(inv)

      // Compute values for suggested slots
      const selected: TimeSlot[] = [];

      // Select high availability time slots first
      [ Preference.high, Preference.medium, Preference.low ].forEach(p => {
        // Check if the time slot is long enough
        const slots = inv.cal.time_slots.filter(slot => slot.preference === p)
          .filter(slot => moment(slot.end).diff(slot.start, 'minutes') >= inv.meeting.duration)

        while (slots.length > 0 && selected.length < 2) {
          const slot = slots.shift()
          selected.push(slot)
        }
      })

      setSuggestedSlots(selected)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [uuid])

  return <>
    {invitation && <main id="schedule">
      <div id="ms-schedule-info">
        <h1>Hi {invitation.meeting.with.name}</h1>
        <p>You have been invited to a meeting by <span className="text-emp">{invitation.from.name}</span>.</p>
        <blockquote>{invitation.meeting.description}</blockquote>
        <p>{regularity[invitation.meeting.regularity]}</p>
        <p>{invitation.cal.timezone === LOCAL_TZ
          ? 'Your time zone matches the organizer\'s time zone.'
          : `The organizer's time zone is ${invitation.cal.timezone}, the calendar below has been automatically converted to your time zone.`}</p>
      </div>

      <div>
        <h2>Suggested time slots</h2>
        <p>Here are two suggested time slots that might work for you. You can also select a time slot from the
                calendar below.</p>
        <div id="ms-schedule-suggested">
          {suggestedSlots.map((slot, i) => <div className="suggested-card" key={i}>
            <div>
              <span className="date">
                {(invitation.meeting.regularity === 'once')
                  ? moment(slot.startTime).format('ddd, MMM D')
                  : `Every ${moment(slot.startTime).format('dddd')}`}
              </span>
              <span className="time">
                at {moment(slot.startTime).format('h:mm A')}
              </span>
            </div>
            <button className="emp">Select</button>
          </div>)}
        </div>
      </div>

      <div id="ms-schedule-container">
        <h2>Available time slots</h2>
        <CalendarView cal={invitation.cal} meeting={invitation.meeting} />
      </div>
    </main>}

    <Loading loading={loading} error={error}></Loading>
  </>
}