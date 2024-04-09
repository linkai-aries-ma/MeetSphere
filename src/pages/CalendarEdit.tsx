import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Calendar } from '../lib/types.ts'
import { CALENDAR } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'
import { CalendarTable } from '../components/CalendarTable.tsx'
import { CalendarDetails } from '../components/CalendarDetails.tsx'

export function CalendarEdit() {
  const { calendarId } = useParams<{ calendarId: string }>()
  const [ error, setError ] = React.useState<string | null>(null)
  const [ calendar, setCalendar ] = React.useState<Calendar | null>(null)
  const [ file, setFile ] = React.useState<File | null>(null)

  React.useEffect(() => {
    CALENDAR.list().then(cals => {
      const cal = cals.find(c => c.id === parseInt(calendarId))
      if (cal) setCalendar(cal)
      else setError('Calendar not found')
    }).catch(err => setError(err.message))
  }, [calendarId])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null)
  }

  const onUploadClick = () => {
    if (file && calendar) {
      CALENDAR.upload(parseInt(calendarId), file)
        .then(() => {
          alert('Calendar updated successfully')
          // Fetch the updated calendar
          CALENDAR.list().then(cals => {
            const updatedCalendar = cals.find(c => c.id === parseInt(calendarId))
            if (updatedCalendar) {
              // Update the calendar state variable
              setCalendar(updatedCalendar)
            }
          })
        })
        .catch(err => setError(err.message))
    }
  }

  const onTimeSlotsUpdated = () => {
    // Fetch the updated calendar
    CALENDAR.list().then(cals => {
      const updatedCalendar = cals.find(c => c.id === parseInt(calendarId))
      if (updatedCalendar) {
        // Update the calendar state variable
        setCalendar(updatedCalendar)
      }
    })
  }

  return <main id="edit-cal-page">
    {calendar && <>
      <h2>Edit your calendar</h2>

      <div>
        You can click on the calendar grid table below to create or remove time slots based on your availability.
        When you are done, please click on the "Create Meetings" button to invite others to choose a time for a
        meeting.
      </div>

      <CalendarDetails cal={calendar}/>

      <CalendarTable cal={calendar} regularity="once" onTimeSlotsUpdated={onTimeSlotsUpdated}/>

      <input type="file" onChange={onFileChange}/>
      <button onClick={onUploadClick}>Upload .ics file</button>

      {calendar.time_slots.length !== 0 && <a href={`/contacts?select=${calendar.id}`}>
        <button className="emp full">Invite People</button>
      </a>}
    </>}

    <Loading loading={!calendar} error={error}/>
  </main>
}