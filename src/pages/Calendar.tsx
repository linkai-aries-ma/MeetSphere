import * as React from 'react'
import { Icon } from '@iconify/react'
import { Calendar } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { getCalendars } from '../lib/sdk.ts'
import moment from 'moment'
import { DATE_NOW, getMeetingStatus } from '../lib/lib.ts'
import './Calendar.scss'

function RemindOverlay({ cal }: {cal: Calendar}) {
  // TODO: Make buttons work

  return <div id="remind-overlay" className="overlay">
    <div>
      <h1>Remind Contacts</h1>
      <div className="button-group">
        {cal.meetings.map(m => <button className="toggle-button" key={m.invitee.id}>{m.invitee.name}</button>)}
      </div>
      <button id="remind-submit" className="emp">Submit</button>
      <button id="meeting-cancel">Cancel</button>
    </div>
  </div>
}

interface OneCalendarProps {
  cal: Calendar,
  canEdit?: boolean,
  btn: (name: string) => void
}

function OneCalendar({ cal, canEdit, btn }: OneCalendarProps) {
  const events = cal.meetings.map(m => {
    return { m, st: getMeetingStatus(m) }
  })

  // Sort by time descending (if it doesn't have time, place at the top)
  events.sort((a, b) => a.m.time ? (b.m.time ? (b.m.time < a.m.time ? -1 : 1) : 1) : -1)

  return <div className="created-calendar">
    {/* Format: Jan 27th 2024 - Feb 2nd 2024 */}
    <div className="coverage">
      {moment(cal.start_date).format('MMM Do YYYY')}
      -
      {moment(cal.end_date).format('MMM Do YYYY')}
    </div>

    <div className="details">
      <span>
        <Icon icon="fluent:add-square-multiple-20-filled"></Icon>
        {/* Created: Jan 25th 2024, 15:38 */}
        Created: {moment(cal.created).format('MMM Do YYYY, HH:mm')}
      </span>
      <span>
        <Icon icon="fluent:pen-20-filled"></Icon>
        {/* Last Modified: Jan 25th 2024, 18:50 */}
        Last Modified: {moment(cal.modified).format('MMM Do YYYY, HH:mm')}
      </span>
      <span>
        <Icon icon="iconoir:mail-out"></Icon>
        {/* 4 members invited */}
        {cal.meetings.length} members invited
      </span>
      <span>
        <Icon icon="fluent:checkmark-starburst-20-regular"></Icon>
        {/* 3 members accepted */}
        {cal.meetings.filter(m => 'time' in m).length} members accepted
      </span>
    </div>

    {canEdit && <div className="button-group">
      <button className="emp" onClick={() => btn('invite')}>Invite</button>
      <button className="alt" onClick={() => btn('edit')}>Edit</button>
      <button className="warn" onClick={() => btn('remind')}>Remind</button>
    </div>}

    <div className="events">
      {events.map(ev => <div className={`st-${ev.st}`} key={ev.m.id}>
        <img src={ev.m.invitee.pfp} alt=""/>
        <div>
          <span className="name">{ev.m.title}</span>
          <span className="member">{ev.m.invitee.name}</span>
          {'time' in ev.m ? <>
            <span className="date">
              {moment(ev.m.time).format('MMM Do YYYY')}
            </span>
            <span className="time">
              {moment(ev.m.time).format('h:mm A')} - {moment(ev.m.time).add(ev.m.durationMinutes, 'minutes').format('h:mm A')}
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

export function Calendar() {
  const [ calendars, setCalendars ] = useState<Calendar[]>([])
  const [ error, setError ] = useState<string | null>(null)
  const [ loading, setLoading ] = useState(true)
  const [ remindCal, setRemindCal ] = useState<Calendar | null>(null)

  // Initial fetch
  useEffect(() => {
    getCalendars().then(setCalendars)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleClick(name: string, cal: Calendar) {
    if (name === 'remind') {
      setRemindCal(cal)
    }
  }

  return <main>
    <div className="section-header">
      <div>
        <h2>Current Calendars</h2>
        <a href="/calendar-create">
          <button className="emp">+</button>
        </a>
      </div>
    </div>

    <div className="created-calendar-list">
      {calendars.filter(cal => moment(cal.endDate).isAfter(DATE_NOW))
        .map(cal => <OneCalendar key={cal.id} cal={cal}
          canEdit={true} btn={f => handleClick(f, cal)}/>)}
    </div>

    <div className="section-header">
      <h2>Past Calendars</h2>
    </div>

    <div className="created-calendar-list">
      {calendars.filter(cal => moment(cal.endDate).isBefore(DATE_NOW))
        .map(cal => <OneCalendar key={cal.id} cal={cal}
          canEdit={false} btn={f => handleClick(f, cal)}/>)}
    </div>

    {remindCal && <RemindOverlay cal={remindCal}/>}
  </main>
}