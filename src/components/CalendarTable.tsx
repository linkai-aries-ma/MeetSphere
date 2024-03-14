import * as React from 'react'
import moment from 'moment/moment'
import { Calendar, PREFERENCE_STR, TimeSlot } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import './CalendarTable.scss'
import { clz } from '../lib/ui.ts'
 
interface CalendarViewProps {
  cal: Calendar
  regularity: 'once' | 'weekly'
}

function seq(n: number) {
  return Array(n).fill(0).map((_, i) => i)
}

export function CalendarTable({ cal, regularity }: CalendarViewProps) {
  const [ nDays, setNDays ] = useState<number>(7)
  const [ tsIndex, setTsIndex ] = useState<{[key: string]: TimeSlot[]}>({})
  const ref = React.useRef<HTMLTableElement>(null)
  const [ isMobile, setIsMobile ] = useState<boolean>(false)

  // For responsive design
  const [ maxDays, setMaxDays ] = useState<number>(7)
  const [ startDay, setStartDay ] = useState<number>(0)

  // Compute values based on properties
  useEffect(() => {
    setMaxDays(moment(cal.end_date).diff(moment(cal.start_date), 'days') + 1)
    if (nDays > maxDays) setNDays(maxDays)

    // Compute time slot index
    const index = {}

    cal.time_slots.forEach(slot => {
      // Extract the date and hour from the startTime
      const startHour = moment(slot.start).format('YYYY-MM-DD H')

      // TODO: Fix time slots spanning multiple days

      // Initialize the array if this is the first slot for this hour
      if (!index[startHour]) index[startHour] = []

      // Add the slot to the bucket
      index[startHour].push(slot)
    })

    setTsIndex(index)
  }, [cal])

  //
  useEffect(() => {
    // Wait until the table is rendered
    if (!ref.current) return

    // Check if the td width is at least 50px
    const td = ref.current.querySelector('td.day')
    if (td && td.clientWidth < 50) {
      // Add mobile class
      setIsMobile(true)
      setNDays(nDays - 1)
    }
  }, [nDays])

  return <div className={clz({ mobile: isMobile }, 'calendar-table-wrapper')}>
    <div className="button-group">
      {startDay > 0 && <button className="icon" onClick={() => setStartDay(startDay - 1)}>&lt;</button>}
      <div className="flex-1"/>
      {startDay + nDays < maxDays && <button className="icon" onClick={() => setStartDay(startDay + 1)}>&gt;</button>}
    </div>

    <table id="calendar-table" ref={ref} className={clz({ mobile: isMobile })}><tbody>
      {/* Headers */}
      <tr id="ms-schedule-header">
        <th></th>
        {regularity === 'once' && seq(nDays).map(d => d + startDay).map(d => <th key={d}>
          {moment(cal.start_date).add(d, 'days').format('MM-DD')}
        </th>)}
        {regularity === 'weekly' && seq(7).map(d => <th key={d}>{moment().day(d).format('ddd')}</th>)}
      </tr>

      {/* One-hour grid */}
      {seq(24).filter(h => h > cal.start_hour && h < cal.end_hour).map(hour => <tr key={hour}>
        <td className="time">{hour}:00</td>
        {seq(nDays).map(d => d + startDay).map(day => <td key={day} className="day" data-day={day} data-hour={hour}>
          {/* Find the time slots in this bucket */}
          {tsIndex[`${moment(cal.start_date).add(day, 'days').format('YYYY-MM-DD')} ${hour}`]?.map((slot, i) => {
            // Calculate height based on the duration of the slot relative to the hour
            const h = moment(slot.end).diff(slot.start, 'minutes') / 60 * 100
            const mt = moment(slot.start).diff(moment(slot.start).startOf('hour'), 'minutes') / 60 * 100
            return <div key={i} className={`avail av${slot.preference}`} style={{ height: `${h}%`, top: `${mt}%` }}>
              {PREFERENCE_STR[slot.preference]}
            </div>
          })}
        </td>)}
      </tr>)}
    </tbody></table>
  </div>
}