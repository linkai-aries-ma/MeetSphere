import * as React from 'react'
import './CalendarCreate.scss'
import moment from 'moment-timezone'
import { DateRangePicker } from 'rsuite'
import 'rsuite/dist/rsuite-no-reset.min.css'
import { CALENDAR } from '../lib/sdk.ts'


export function CalendarCreate() {
  const [ from, setFrom ] = React.useState<number>(9)
  const [ to, setTo ] = React.useState<number>(20)
  const [ error, setError ] = React.useState<string | null>(null)
  const [ dates, setDates ] = React.useState<Date[]>([])

  const now = moment()

  function create() {
    // Check fields
    if (from >= to) return setError('The "from" time must be before the "to" time.')

    // Check date
    if (dates.length === 0) return setError('Please select a date range.')

    // Create calendar
    console.log('Creating calendar...')
    CALENDAR.add({
      start_date: moment(dates[0]).format('YYYY-MM-DD'),
      end_date: moment(dates[1]).format('YYYY-MM-DD'),
      start_hour: from,
      end_hour: to,
      timezone: moment.tz.guess(),
    }).then(cal => {
      console.log('Calendar created', cal)
      window.location.assign(`/calendar-edit/${cal.id}`)
    }).catch(err => {
      console.error('Error creating calendar', err)
      setError(err.message)
    })
  }

  return <main id="create-cal-page">
    <h2>Let's create your calendar for scheduling meetings.</h2>

    <div className="create-cal">
      {error && <div className="error">{error}</div>}

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
        <DateRangePicker placeholder="Select Date Range" showHeader={false} onChange={setDates} format="yyyy-MM-dd"
          shouldDisableDate={date => moment(date).isBefore(now, 'day') || moment(date).isAfter(now.clone().add(30, 'd'), 'day')}
          ranges={[
            { label: 'Next 7 days', value: [ now.toDate(), now.clone().add(7, 'd').toDate() ] },
          ]}
        />
      </div>

      <button className="emp" onClick={() => create()}>Create</button>
    </div>
  </main>
} 