import * as React from 'react'
import { Meeting, Preference, TimeSlot } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { MEETING } from '../lib/sdk.ts'
import { LOCAL_TZ } from '../lib/lib.ts'
import './Schedule.scss'
import moment from 'moment'
import { CalendarTable } from '../components/CalendarTable.tsx'
import { Loading } from '../components/Loading.tsx'
import { useParams } from 'react-router-dom'
import { clz } from '../lib/ui.ts'

const regularity = {
  'once': 'This is a one-time meeting, ',
  // 'daily': 'This is a recurrent daily meeting, please select a time slot that works best for you.',
  'weekly': 'This is a recurrent weekly meeting, ',
}

function SuccessPopup({ slot }: { slot: TimeSlot }) {
  return <div className="overlay">
    <div>
      <h1>Meeting Scheduled!</h1>
      <span>Your meeting has been scheduled at</span>
      <span>{moment(slot.start).format('ddd, MMM D [at] h:mm A')} to {moment(slot.end).format('h:mm A')}.</span>
      <span>You can close this tab now.</span>
    </div>
  </div>
}

export function Schedule() {
  const { uuid } = useParams()
  const [ invitation, setInvitation ] = useState<Meeting | null>(null)
  const [ error, setError ] = useState<string | null>(null)
  const [ loading, setLoading ] = useState(true)

  // Computed
  const [ suggestedSlots, setSuggestedSlots ] = useState<TimeSlot[]>([])
  const [ success, setSuccess ] = useState<TimeSlot | null>(null)

  // Fetch invitation
  useEffect(() => {
    MEETING.get(uuid).then(inv => {
      setInvitation(inv)

      // Compute values for suggested slots
      const selected: TimeSlot[] = [];

      // Select high availability time slots first
      [ Preference.high, Preference.medium, Preference.low ].forEach(p => {
        // Check if the time slot is long enough
        const slots = inv.calendar.time_slots.filter(slot => slot.preference === p)
          .filter(slot => moment(slot.end).diff(slot.start, 'minutes') >= inv.duration)

        while (slots.length > 0 && selected.length < 2) {
          const slot = slots.shift()
          selected.push(slot)
        }
      })

      setSuggestedSlots(selected)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [uuid])

  function accept(slot: TimeSlot) {
    if (loading) return
    setLoading(true)
    MEETING.accept(uuid, slot.start).then(() => {
      setSuccess(slot)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }

  return <>
    {invitation && <main id="schedule">
      <div id="ms-schedule-info">
        <h1>Hi {invitation.invitee.name}</h1>
        <p>You have been invited to a meeting by <span className="text-emp">{invitation.creator.name}</span>.</p>
        <blockquote>{invitation.description}</blockquote>
        <p>{regularity[invitation.regularity]} {invitation.time
          ? <>you've already selected the time
            <span className="text-emp">&nbsp;{moment(invitation.time).format('ddd, MMM D [at] h:mm A')}&nbsp;</span>
            If you want to change it, you can do so below.</>
          : 'please select a time slot that works best for you.'}</p>
        <p className={clz({ error: invitation.calendar.timezone !== LOCAL_TZ })}>{invitation.calendar.timezone === LOCAL_TZ
          ? 'Your time zone matches the organizer\'s time zone.'
          : (`The organizer's time zone is ${invitation.calendar.timezone}, which is different from your time zone ${LOCAL_TZ}. ` +
          'The calendar below is adjusted to display your local time, but please be aware of the time zone difference.')}</p>
      </div>

      <div>
        <h2>Suggested time slots</h2>
        <p>Here are two suggested time slots that might work for you. You can also select a time slot from the
            calendar below.</p>
        <div id="ms-schedule-suggested">
          {suggestedSlots.map((slot, i) => <div className="suggested-card" key={i}>
            <div>
              <span className="date">
                {(invitation.regularity === 'once')
                  ? moment(slot.start).format('ddd, MMM D')
                  : `Every ${moment(slot.start).format('dddd')}`}
              </span>
              <span className="time">
                at {moment(slot.start).format('h:mm A')}
              </span>
            </div>
            <button className="emp" onClick={() => accept(slot)}>Accept</button>
          </div>)}
        </div>
      </div>

      <div id="ms-schedule-container">
        <h2>Available time slots</h2>
        <CalendarTable cal={invitation.calendar} regularity={invitation.regularity} duration={invitation.duration}
          selectCallback={slot => accept(slot)} />
      </div>
    </main>}

    {success && <SuccessPopup slot={success} />}

    <Loading loading={loading} error={error} />
  </>
}