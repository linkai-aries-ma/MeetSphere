import * as React from 'react'
import { Icon } from '@iconify/react'
import { CalendarWithMeetings } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { CALENDAR, MEETING } from '../lib/sdk.ts'
import moment from 'moment'
import { DATE_NOW, getMeetingStatus } from '../lib/lib.ts'
import './CalendarView.scss'
import { getAvatar } from '../lib/ui.ts'
import { toggle } from '../lib/utils.ts'
import { Loading } from '../components/Loading.tsx'
import { CalendarDetails } from '../components/CalendarDetails.tsx'

function RemindOverlay({ cal, close }: {cal: CalendarWithMeetings, close: (submitted: boolean) => void}) {
  const [ selected, setSelected ] = useState<string[]>([])
  const [ submitting, setSubmitting ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)
  const [ progress, setProgress ] = useState<string | null>(null)

  async function submitHelper() {
    // Send reminders for selected meetings
    const len = selected.length
    let count = 0
    for (const m of cal.meetings) {
      if (selected.includes(m.id)) {
        setProgress(`Sending reminder for ${m.title} with ${m.invitee.name} (${++count}/${len})`)
        await MEETING.remind(m.id)
        selected.splice(selected.indexOf(m.id), 1)
      }
    }
  }

  function submit() {
    if (submitting) return
    setSubmitting(true)
    submitHelper().then(() => close(true)).catch(err => setError(err.message)).finally(() => setSubmitting(false))
  }

  return <div id="remind-overlay" className="overlay" onClick={() => close(false)}>
    <div onClick={e => e.stopPropagation()}>
      <h1>Meeting Reminders</h1>
      <div>Which meetings do you want to send reminders for?</div>
      <div className="checkbox-group">
        {cal.meetings.map(m =>
          <label key={m.id}>
            <input type="checkbox" name={m.id} onChange={() => setSelected(toggle(selected, m.id))}
              value={selected.includes(m.id) ? 'on' : ''}/>
            <span>{m.title} with {m.invitee.name} ({getMeetingStatus(m)})</span>
          </label>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {progress && <div className="progress">{progress}</div>}
      {selected.length > 0 && <button id="remind-submit" className="emp" onClick={() => submit()}>
        {submitting ? <Icon icon="line-md:loading-twotone-loop"/> : 'Send Reminders'}
      </button>}
      <button id="meeting-cancel" onClick={() => close(false)}>Cancel</button>
    </div>
  </div>
}

interface OneCalendarProps {
  cal: CalendarWithMeetings,
  canEdit?: boolean,
  remind: () => void,
}

function OneCalendar({ cal, canEdit, remind }: OneCalendarProps) {
  const events = cal.meetings.map(m => {
    return { m, st: getMeetingStatus(m) }
  })

  // Sort by time descending (if it doesn't have time, place at the top)
  events.sort((a, b) => a.m.time ? (b.m.time ? (b.m.time < a.m.time ? -1 : 1) : 1) : -1)

  return <div className="created-calendar">
    {/* Format: Jan 27th 2024 - Feb 2nd 2024 */}
    <div className="coverage">
      {moment(cal.start_date).format('MMM Do YYYY')} ~ {moment(cal.end_date).format('MMM Do YYYY')}
    </div>

    <CalendarDetails cal={cal}/>

    {canEdit && <div className="button-group">
      <button className="emp" onClick={() => {
        // Redirect to /contacts?select=cal.id
        window.location.assign(`/contacts?select=${cal.id}`)
      }}>Invite</button>
      <button className="alt" onClick={() => {
        // Redirect to /calendar-edit/cal.id
        window.location.assign(`/calendar-edit/${cal.id}`)
      }}>Edit</button>
      <button className="warn" onClick={() => remind()}>Remind</button>
    </div>}

    <div className="events">
      {events.map(ev => <div className={`event st-${ev.st}`} key={ev.m.id}>
        <img src={getAvatar(ev.m.invitee)} alt=""/>
        <div>
          <span className="name">{ev.m.title}</span>
          <span className="member">{ev.m.invitee.name} <span className="copy-invite">
            <a onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/schedule/${ev.m.id}`)
              alert('Invite link copied to clipboard!')
            }} className="clickable">Copy Invite</a>
          </span></span>
          {ev.m.time ? <>
            <span className="date">
              {moment(ev.m.time).format('MMM Do YYYY')}
            </span>
            <span className="time">
              {moment(ev.m.time).format('h:mm A')} - {moment(ev.m.time).add(ev.m.duration, 'minutes').format('h:mm A')}
            </span>
          </> : <>
            <span className="date">Date Pending</span>
            <span className="time">Time Pending</span>
          </>}
        </div>
      </div>)}
    </div>
  </div>
}

export function CalendarView() {
  const [ calendars, setCalendars ] = useState<CalendarWithMeetings[]>([])
  const [ error, setError ] = useState<string | null>(null)
  const [ remindCal, setRemindCal ] = useState<CalendarWithMeetings | null>(null)

  // Initial fetch
  useEffect(() => {
    Promise.all([ CALENDAR.list(), MEETING.list() ]).then(([ cals, meetings ]) => {
      setCalendars(cals.map(cal => {
        return { ...cal, meetings: meetings.filter(m => m.calendar.id === cal.id) }
      }))
    }).catch(err => setError(err.message))
  }, [])

  return <main>
    {calendars && <>
      <div className="section-header">
        <div>
          <h2>Current Calendars</h2>
          <a href="/calendar-create">
            <button className="emp">+</button>
          </a>
        </div>
      </div>

      <div className="created-calendar-list">
        {calendars.filter(cal => moment(cal.end_date).isAfter(DATE_NOW))
          .map(cal => <OneCalendar key={cal.id} cal={cal}
            canEdit={true} remind={() => setRemindCal(cal)}/>)}
      </div>

      <div className="section-header">
        <h2>Past Calendars</h2>
      </div>

      <div className="created-calendar-list">
        {calendars.filter(cal => moment(cal.end_date).isBefore(DATE_NOW))
          .map(cal => <OneCalendar key={cal.id} cal={cal}
            canEdit={false} remind={() => setRemindCal(cal)}/>)}
      </div>
    </>}

    <Loading loading={!calendars} error={error}/>

    {remindCal && <RemindOverlay cal={remindCal} close={() => setRemindCal(null)}/>}
  </main>
}