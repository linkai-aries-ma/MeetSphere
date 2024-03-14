import * as React from 'react'
import { Calendar, CalendarWithMeetings, Meeting } from '../lib/types.ts'
import { Icon } from '@iconify/react'
import moment from 'moment'
import './CalendarDetails.scss'

interface CalendarWithOptionalMeetings extends Calendar {
  meetings?: Meeting[]
}

export function CalendarDetails({ cal }: {cal: CalendarWithOptionalMeetings}) {
  return <div className="calendar-details">
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

    {cal.meetings != undefined && <>
      <span>
        <Icon icon="iconoir:mail-out"></Icon>
        {/* 4 members invited */}
        {cal.meetings.length} members invited
      </span>

      <span>
        <Icon icon="fluent:checkmark-starburst-20-regular"></Icon>
        {/* 3 members accepted */}
        {cal.meetings.filter(m => m.time).length} members accepted
      </span>
    </>}
  </div>
}