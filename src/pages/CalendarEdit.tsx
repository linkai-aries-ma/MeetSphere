import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Calendar } from '../lib/types.ts'
import { CALENDAR } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'

export function CalendarEdit() {
  const { calendarId } = useParams<{ calendarId: string }>()
  const [ error, setError ] = React.useState<string | null>(null)
  const [ calendar, setCalendar ] = React.useState<Calendar | null>(null)

  React.useEffect(() => {
    CALENDAR.list().then(cals => {
      const cal = cals.find(c => c.id === parseInt(calendarId))
      if (cal) setCalendar(cal)
      else setError('Calendar not found')
    }).catch(err => setError(err.message))
  }, [calendarId])

  return <main id="edit-cal-page">
    {calendar && <>
      <h2>Edit your calendar</h2>
    </>}

    <Loading loading={!calendar} error={error} />
  </main>
}