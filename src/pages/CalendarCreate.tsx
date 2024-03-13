import * as React from 'react'
import './CalendarCreate.scss'
import moment from 'moment'
import { DateRangePicker } from 'rsuite'
import 'rsuite/dist/rsuite-no-reset.min.css'

export function CalendarCreate() {
  const [ from, setFrom ] = React.useState<number>(9)
  const [ to, setTo ] = React.useState<number>(20)

  const now = moment()

  return <main id="create-cal-page">
    <h2>Let's create your calendar for scheduling meetings.</h2>

    <div className="create-cal">

      <div className="select-hour">
        <div>Select the hours which could work</div>

        <label htmlFor="time-from">
          <select id="time-from" className="dropdown from" value={from} onChange={e => {
            setFrom(parseInt(e.target.value))
            if (to <= from) setTo(from + 1)
          }}>
            {Array.from({ length: 23 }, (_, i) => i).map(i => <option key={i} value={i}>{i}:00</option>)}
          </select>
          <span>to</span>
          <select id="time-to" className="dropdown to" value={to} onChange={e => setTo(parseInt(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => i)
              .filter(i => i > from)
              .map(i => <option key={i} value={i}>{i}:00</option>)}
          </select>
        </label>
      </div>

      <div className="select-hour">
        <div>Calendar Availability</div>

        {/* 30-days range */}
        <DateRangePicker placeholder="Select Date Range"
          shouldDisableDate={date => moment(date).isBefore(now, 'day') || moment(date).isAfter(now.clone().add(30, 'd'), 'day')}
        />
      </div>

      <a href="/calendar-timepicker">
        <button className="emp">Create</button>
      </a>
    </div>
  </main>
} 