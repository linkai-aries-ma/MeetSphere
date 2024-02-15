import * as React from 'react'
import moment from 'moment/moment'
import {Calendar, Meeting} from '../lib/types.ts'
import {useEffect, useState} from 'react'
import './CalendarView.scss'

interface CalendarViewProps {
    cal: Calendar
    meeting: Meeting
}

export function CalendarView({cal, meeting}: CalendarViewProps) {
  const [nDays, setNDays] = useState<number>(0)

  useEffect(() => {
    setNDays(moment(cal.endDate).diff(moment(cal.startDate), 'days') + 1)
  }, [cal])

  return <>
    <table id="ms-schedule-calendar">
      <tbody>
        {/* Headers */}
        <tr id="ms-schedule-header">
          <th></th>
          {meeting.regularity === 'once' && Array(nDays).fill(0).map((_, i) => <th>
            {moment(cal.startDate).add(i, 'days').format('MM-DD')}
          </th>)}
          {meeting.regularity === 'weekly' && Array(7).fill(0).map((_, i) => <th>
            {moment().day(i).format('ddd')}
          </th>)}
        </tr>

        {/* One-hour grid */}
        {Array(24).fill(0).map((_, hour) => <tr>
          <td className="time">{hour}:00</td>
          {Array(nDays).fill(0).map((_, day) => <td className="day" data-day={day} data-hour={hour}></td>)}
        </tr>)}
      </tbody>
    </table>
  </>
}