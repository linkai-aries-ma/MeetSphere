import * as React from 'react'
import moment from 'moment/moment'
import {Calendar, Meeting, TimeSlot} from '../lib/types.ts'
import {useEffect, useState} from 'react'
import './CalendarView.scss'

interface CalendarViewProps {
  cal: Calendar
  meeting: Meeting
}

export function CalendarView({cal, meeting}: CalendarViewProps) {
  const [nDays, setNDays] = useState<number>(0)
  const [tsIndex, setTsIndex] = useState<{[key: string]: TimeSlot[]}>({})

  // Compute values based on properties
  useEffect(() => {
    setNDays(moment(cal.endDate).diff(moment(cal.startDate), 'days') + 1)

    // Compute time slot index
    const index = {}

    cal.timeSlots.forEach(slot => {
      // Extract the date and hour from the startTime
      const startHour = moment(slot.startTime).format('YYYY-MM-DD HH')

      // Initialize the array if this is the first slot for this hour
      if (!index[startHour]) index[startHour] = []

      // Add the slot to the bucket
      index[startHour].push(slot)
    })

    setTsIndex(index)
  }, [cal])

  return <>
    <table id="ms-schedule-calendar"><tbody>
      {/* Headers */}
      <tr id="ms-schedule-header">
        <th></th>
        {meeting.regularity === 'once' && Array(nDays).fill(0).map((_, i) => <th key={i}>
          {moment(cal.startDate).add(i, 'days').format('MM-DD')}
        </th>)}
        {meeting.regularity === 'weekly' && Array(7).fill(0).map((_, i) => <th key={i}>
          {moment().day(i).format('ddd')}
        </th>)}
      </tr>

      {/* One-hour grid */}
      {Array(24).fill(0).map((_, hour) => <tr key={hour}>
        <td className="time">{hour}:00</td>
        {Array(nDays).fill(0).map((_, day) => <td key={day} className="day" data-day={day} data-hour={hour}>
          {/* Find the time slots in this bucket */}
          {tsIndex[`${moment(cal.startDate).add(day, 'days').format('YYYY-MM-DD')} ${hour}`]?.map((slot, i) => {
            // Calculate height based on the duration of the slot relative to the hour
            const h = moment(slot.endTime).diff(slot.startTime, 'minutes') / 60 * 100
            return <div key={i} className={`avail av${slot.preference}`} style={{height: `${h}%`}}>
              {moment(slot.startTime).format('HH:mm')} - {moment(slot.endTime).format('HH:mm')}
            </div>
          })}
        </td>)}
      </tr>)}
    </tbody></table>
  </>
}