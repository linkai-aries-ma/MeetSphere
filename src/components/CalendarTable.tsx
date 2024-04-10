import * as React from 'react'
import moment from 'moment/moment'
import { Calendar, Meeting, PREFERENCE_STR, TimeSlot } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import './CalendarTable.scss'
import { clz } from '../lib/ui.ts'
import { CALENDAR, MEETING } from '../lib/sdk.ts'
import { Loading } from './Loading.tsx'
import { DatePicker } from 'rsuite'

type CSPParams = { slot: TimeSlot, conti: Continuity[], duration: number, close: (slot: TimeSlot | null) => void }

export function ConfirmSelectionPopup({ slot, conti, duration, close }: CSPParams) {
  const [ start, setStart ] = useState<Date>(moment(slot.start).toDate())

  const newSlot = { ...slot, start: moment(start).toISOString(), end: moment(start).add(duration, 'minutes').toISOString() }
  const isValidSlot = isValid(newSlot, conti)

  return <div className="overlay">
    <div>
      <h1>Confirm Selection</h1>
      <div>Do you want to select the following time?</div>

      {!isValidSlot && <div className="error">This time slot is not available</div>}

      <div>Start Time</div>
      <DatePicker format="yyyy-MM-dd HH:mm" value={start} onChange={setStart}/>

      <div>End Time (Calculated)</div>
      <DatePicker disabled format="yyyy-MM-dd HH:mm" value={moment(newSlot.end).toDate()} />

      <button onClick={() => close(newSlot)}>Confirm</button>
      <button onClick={() => close(null)}>Cancel</button>
    </div>
  </div>
}

type ETSPParams = { slot: TimeSlot, cal: Calendar, conti: Continuity[], close: (slot: TimeSlot | null) => void }

export function EditTimeSlotPopup({ slot, cal, conti, close }: ETSPParams) {
  const [ pref, setPref ] = useState<number>(slot.preference)
  const [ start, setStart ] = useState<Date>(moment(slot.start).toDate())
  const [ hour, setHour ] = useState<number>(moment(slot.end).diff(slot.start, 'hours'))
  const [ min, setMin ] = useState<number>(moment(slot.end).diff(slot.start, 'minutes') % 60)

  const [ calStart, calEnd ] = [ moment(cal.start_date).toDate(), moment(cal.end_date).toDate() ]

  // This variable is calculated when reactivity happens
  const newSlot = { ...slot, preference: pref,
    start: moment(start).toISOString(),
    end: moment(start).add(hour, 'hours').add(min, 'minutes').toISOString()
  }
  const conflicts = hasConflict(newSlot, conti)

  const maxEndTime = moment(slot.start).add(cal.end_hour - cal.start_hour, 'hours').toDate()

  return <div className="overlay">
    <div>
      <h1>Edit Time Slot</h1>

      {conflicts && <div className="error">This time slot conflicts with another time slot</div>}

      <div>Start Time</div>
      <DatePicker format="yyyy-MM-dd HH:mm" value={start} onChange={setStart}
        shouldDisableDate={d => d < calStart || d > calEnd}
        shouldDisableHour={h => h < cal.start_hour || h > cal.end_hour}
      />

      <div>Duration (Hour)</div>
      <input
        type="number"
        value={hour}
        onChange={e => {
          if (+e.target.value < 0 || +e.target.value > 23) return
          const newEndTime = moment(newSlot.start).add(+e.target.value, 'hours')
          if (newEndTime.hour() > cal.end_hour || newEndTime.hour() === 1 || (newEndTime.hour() === 0 && newEndTime.minutes() > 0)) {
            return <div className="error">This time slot conflicts with another time slot</div>
          } else {
            setHour(+e.target.value)
          }
        }}
      />

      <div>Duration (Minutes)</div>
      <input type="number" value={min} onChange={e => {
        if (+e.target.value < 0 || +e.target.value > 59) return
        const newEndTime = moment(newSlot.start).add(+e.target.value, 'minute')
        // Check if the new end time exceeds the allowed end time or conflicts with another time slot
        if (newEndTime > moment(cal.end_date) || (newEndTime.hour() === cal.end_hour && newEndTime.minute() > 0) || (newEndTime.hour() === 0 && newEndTime.minutes() > 0)) {
          // Handle conflict or display error message
          return <div className="error">This time slot conflicts with another time slot</div>
        } else {
          // If no conflict, update the minutes state
          setMin(+e.target.value)
        }
      }}/>

      <div>Switch Preference</div>
      <button onClick={() => setPref(Math.max(1, (pref + 1) % 4))} className={`avail av${pref} full`}>
        {PREFERENCE_STR[pref]} Preference
      </button>
      <button onClick={() => close(newSlot)} disabled={conflicts}>Save</button>

      <button className="warn" onClick={() => {
        if (!window.confirm('Are you sure you want to delete this time slot?')) return
        close(null)
      }}>Delete</button>

      <button onClick={() => close(slot)}>Cancel</button>
    </div>
  </div>
}

export function NewTimeSlotPopup({ close }: { close: (avail: number | null) => void }) {
  return <div className="overlay">
    <div>
      <h1>Choose Availability</h1>
      <div>Choose your availability for this time slot.</div>

      <button className="avail av3" onClick={() => close(3)}>High</button>
      <button className="avail av2" onClick={() => close(2)}>Medium</button>
      <button className="avail av1" onClick={() => close(1)}>Low</button>

      <button onClick={() => close(null)}>Cancel</button>
    </div>
  </div>
}

function seq(n: number) {
  return Array(n).fill(0).map((_, i) => i)
}

interface Continuity {
  start: moment.Moment
  end: moment.Moment
}

/**
 * Combine overlapping time slots into a single time slot to make a "continuous" time slot array
 * Assumes that the time slots are sorted by start time
 */
function buildContinuity(slots: TimeSlot[]) {
  const cont = []
  let last: Continuity | null = null
  slots.forEach(slot => {
    // Check if the slot is continuous with the last slot
    if (last && moment(slot.start) <= last.end) last.end = moment.max(last.end, moment(slot.end))
    else {
      if (last) cont.push(last)
      last = { start: moment(slot.start), end: moment(slot.end) }
    }
  })
  return cont
}

/**
 * Check if a selected time interval is available, used for selecting time slots
 * (This is different from hasConflict, which checks for overlapping time slots)
 */
function isValid(slot: TimeSlot, continuity: Continuity[]) {
  const [ start, end ] = [ moment(slot.start), moment(slot.end) ]
  // aka. There exists some continuity such that the timeslot's start and end
  // are entirely contained within the continuity
  return continuity.some(c => start >= c.start && end <= c.end)
}

/**
 * Returns true if the time slot overlaps with any of the existing slots.
 * Used for editing time slots
 */
function hasConflict(slot: TimeSlot, continuity: Continuity[]) {
  const [ start, end ] = [ moment(slot.start), moment(slot.end) ]
  // aka. There exists some continuity C such that:
  // 1. The timeslot's start is before C's end and after C's start
  // 2. The timeslot's end is after C's start and before C's end
  return continuity.some(c => (start < c.end && start > c.start) || (end > c.start && end < c.end))
}

interface CalendarViewProps {
  cal: Calendar
  regularity: 'once' | 'weekly'
  duration?: number // If this is set, the calendar is in selection mode
  selectCallback?: (slot: TimeSlot) => void // If this is set, the calendar is in selection mode
  onTimeSlotsUpdated?: () => void;
}

export function CalendarTable({ cal, regularity, duration, selectCallback, onTimeSlotsUpdated }: CalendarViewProps) {
  const isEdit = !selectCallback
  if ((duration && !selectCallback) || (!duration && selectCallback)) throw new Error('Invalid props')
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)

  const [ meetings, setMeetings ] = useState<Meeting[]>([])

  // Fetch meetings associated with the calendar
  // TODO: Change this to an unauthorized call
  useEffect(() => {
    setLoading(true)
    MEETING.list().then(meetings => {
      // Filter meetings based on calendar ID
      const calendarMeetings = meetings.filter(meeting => meeting.calendar.id === cal.id)
      setMeetings(calendarMeetings)
    }).catch(error => setError(error.message)).finally(() => setLoading(false))
  }, [cal])

  const [ timeSlots, setTimeSlots ] = useState<TimeSlot[]>([])
  const [ continuity, setContinuity ] = useState<Continuity[]>([])
  const [ nDays, setNDays ] = useState<number>(7)
  const [ tsIndex, setTsIndex ] = useState<{[key: string]: TimeSlot[]}>({})
  const ref = React.useRef<HTMLTableElement>(null)
  const [ isMobile, setIsMobile ] = useState<boolean>(false)

  // For responsive design
  const [ maxDays, setMaxDays ] = useState<number>(7)
  const [ startDay, setStartDay ] = useState<number>(0)

  // New time slot
  const [ ovNewSlot, setOvNewSlot ] = useState<TimeSlot | null>(null)
  const [ ovEditSelect, setOvEditSelect ] = useState<TimeSlot | null>(null)

  // Compute timeSlots based on calendar properties and meetings
  useEffect(() => {
    if (meetings.length === 0) return

    let slots = cal.time_slots.toSorted((a, b) => moment(a.start).diff(b.start)).filter(_ =>
      // Check if there is any meeting with a time that overlaps with this time slot
      // (removed) This is very incorrect. We should split the conflicting time slot instead.
      // !meetings.some(meeting => {
      //   if (!meeting.time || !meeting.duration) return false // Skip meetings without time or duration
      //
      //   const meetingStart = new Date(meeting.time)
      //   const meetingEnd = new Date(meeting.time)
      //   meetingEnd.setMinutes(meetingEnd.getMinutes() + meeting.duration)
      //
      //   const timeSlotStart = new Date(timeSlot.start)
      //   const timeSlotEnd = new Date(timeSlot.end)
      //
      //   // Check for overlap
      //   return (
      //     (timeSlotStart >= meetingStart && timeSlotStart < meetingEnd) || // Start of time slot is within meeting
      //     (timeSlotEnd > meetingStart && timeSlotEnd <= meetingEnd) ||     // End of time slot is within meeting
      //     (timeSlotStart <= meetingStart && timeSlotEnd >= meetingEnd)     // Meeting is within time slot
      //   )
      // })
      true
    )

    // Split the conflicting time slots
    // 1. Loop through all meetings, Loop through all time slots
    // 2. If a conflicting time slot is found, create <= 2 new time slots
    //   a. If the remaining time from the time slot before the meeting is > 0, create a new time slot
    //   b. If the remaining time from the time slot after the meeting is > 0, create a new time slot
    const newSlots = []
    const removedSlots = []
    meetings.forEach(meeting => {
      if (!meeting.time || !meeting.duration) return // Skip unscheduled meetings

      slots.forEach(slot => {
        const meetingStart = moment(meeting.time)
        const meetingEnd = moment(meeting.time).add(meeting.duration, 'minutes')
        const slotStart = moment(slot.start)
        const slotEnd = moment(slot.end)

        // Check for overlap
        if (slotStart < meetingEnd && slotEnd > meetingStart) {
          // Split the time slot
          if (slotStart < meetingStart) {
            // Create a new time slot before the meeting
            newSlots.push({ start: slot.start, end: meetingStart.toISOString(), preference: slot.preference })
          }
          if (slotEnd > meetingEnd) {
            // Create a new time slot after the meeting
            newSlots.push({ start: meetingEnd.toISOString(), end: slot.end, preference: slot.preference })
          }
          removedSlots.push(slot)
        }
      })
    })

    // Remove the conflicting time slots
    slots = slots.filter(slot => !removedSlots.includes(slot))

    // Add meetings to the time slots
    const meetingSlots = meetings.map(meeting => ({
      start: meeting.time,
      end: moment(meeting.time).add(meeting.duration, 'minutes').toISOString(),
      preference: 0, // Preference 0 indicates a meeting
      title: meeting.title // Optionally include other meeting details
    }))

    setTimeSlots([ ...slots, ...meetingSlots, ...newSlots ])
  }, [ cal, meetings ])

  // Compute values based on properties
  useEffect(() => {
    setMaxDays(moment(cal.end_date).diff(moment(cal.start_date), 'days') + 1)
    if (nDays > maxDays) setNDays(maxDays)
  
    // Compute time slot index
    const index = {}
  
    timeSlots.forEach(slot => {
      const startHour = moment(slot.start).format('YYYY-MM-DD H')
  
      if (!index[startHour]) index[startHour] = []
      index[startHour].push(slot)
    })
  
    setContinuity(buildContinuity(timeSlots))
    setTsIndex(index)
  }, [ cal, timeSlots ])


  // Check if the table is too narrow for the time slots
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

  function updateSlots(slots: TimeSlot[]) {
    setTimeSlots(slots)
    setLoading(true)

    CALENDAR.update({ ...cal, time_slots: slots })
      .then(() => {
        // Call the onTimeSlotsUpdated prop after the time slots are updated
        if (onTimeSlotsUpdated) onTimeSlotsUpdated()
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  function calcMin(e: React.MouseEvent<HTMLDivElement>, el: HTMLDivElement) {
    // Get mouse y within the td element's boxes
    const y = e.clientY - el.getBoundingClientRect().top
    const h = el.clientHeight
    const ratio = y / h
    // Calculate the time (floor to the last 15-minute interval)
    return Math.floor(ratio * 4) * 15
  }

  // Click on a block
  function clickTd(e: React.MouseEvent<HTMLDivElement>, day: number, hour: number) {
    if (!isEdit) return

    // Calculate the new time slot
    const sd = moment(cal.start_date).add(day, 'days').hour(hour).minute(calcMin(e, e.currentTarget))
    setOvNewSlot({
      start: sd.toISOString(),
      end: sd.add(1, 'hour').toISOString(),
      preference: 1,
    })
  }

  /* *************************
  Drag a time slot
  NOTE: Due to the computational complexity of reactive updates, we implemented this feature
  outside the reactivity system and directly on DOM. This is a major performance optimization.
  However, we need to ensure that no reactive updates are triggered between DragStart and Drop.
  ************************* */

  let dragging: TimeSlot | null = null
  let dragOrig: HTMLDivElement | null = null
  let dragGhost: HTMLDivElement | null = null
  let dragType: 'handle' | 'slot' = 'slot'
  let dragStartY: number = 0
  // Optimization: Memoize some parameters that needs to be recalculated on every drag event
  let _memoDuration: number | null = null
  let _memoConti: Continuity[] | null = null
  function tsDragStart(e: React.DragEvent<HTMLDivElement>, slot: TimeSlot, type: 'handle' | 'slot') {
    e.stopPropagation()
    dragging = slot
    console.log('Drag start', slot, type)
    dragType = type

    // Hide drag image
    e.dataTransfer.setDragImage(new Image(), 0, 0)
    
    // Make a copy of the drag source
    dragOrig = (dragType === 'handle' ? e.currentTarget.parentElement : e.currentTarget) as HTMLDivElement
    dragGhost = dragOrig.cloneNode(true) as HTMLDivElement
    dragOrig.parentElement.appendChild(dragGhost)
    dragOrig.style.opacity = '0.25'
    dragGhost.classList.add('dragging')
    dragStartY = e.clientY

    // Memoization
    _memoDuration = moment(slot.end).diff(slot.start, 'minutes')
    _memoConti = buildContinuity(timeSlots.filter(s => s !== slot))
  }

  function calcNewTSDrag(e: React.DragEvent<HTMLDivElement>) {
    // Note: This function should only be called by events on the drop bucket, not the drag element
    // Calculate the new time slot
    const day = +e.currentTarget.dataset.day
    const hour = +e.currentTarget.dataset.hour
    const m = calcMin(e, e.currentTarget)

    // Update the slot
    const sd = moment(cal.start_date).add(day, 'days').hour(hour).minute(m)
    return {
      start: sd.toISOString(),
      end: sd.add(_memoDuration, 'minutes').toISOString(),
      preference: dragging.preference
    }
  }

  function calcNewTSResize() {
    // Calculate the new time slot duration
    if (!dragGhost.style.height) return
    const m = +dragGhost.style.height.replace('%', '') / 100 * 60
    return { ...dragging, end: moment(dragging.start).add(m, 'minutes').toISOString() }
  }

  // Drag the handle bar to shrink/expand the time slot
  function tsDragHandleBar(e: React.DragEvent<HTMLDivElement>) {
    if (!dragging || !dragGhost || dragType !== 'handle') return
    e.preventDefault()

    // Calculate new height as percentage of one hour
    const hourHeight = dragOrig.parentElement.clientHeight
    const origHeight = dragOrig.clientHeight
    let h = (origHeight + e.clientY - dragStartY) / hourHeight * 100

    // Snap into place for 15-minute intervals (round to nearest 25%)
    h = Math.round(h / 25) * 25
    dragGhost.style.height = `${h}%`

    // Check if new timeslot is valid
    const newSlot = calcNewTSResize()
    if (hasConflict(newSlot, _memoConti)) dragGhost.classList.add('invalid')
    else dragGhost.classList.remove('invalid')
  }

  function tdDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!dragGhost || dragType == 'handle') return // Don't handle handle-drag

    // Note: e.currentTarget is the td element
    // Move the slot into this div
    if (e.currentTarget !== dragGhost.parentElement) {
      dragGhost.parentElement.removeChild(dragGhost)
      e.currentTarget.appendChild(dragGhost)
    }

    // Get relative y
    const m = calcMin(e, e.currentTarget)
    dragGhost.style.top = `${m / 60 * 100}%`

    // Check if new timeslot is valid
    const newSlot = calcNewTSDrag(e)
    if (hasConflict(newSlot, _memoConti)) dragGhost.classList.add('invalid')
    else dragGhost.classList.remove('invalid')
  }

  function tsDrop(e: React.DragEvent<HTMLDivElement>) {
    console.log('Drop', e)
    e.preventDefault()
    if (!dragging || !dragGhost) return

    // Remove the ghost slot
    dragGhost.remove()
    dragOrig.style.opacity = '1'

    const slot = dragType === 'handle' ? calcNewTSResize() : calcNewTSDrag(e)
    if (hasConflict(slot, _memoConti)) return alert('This new position conflicts with another time slot')

    // Add the slot back to the time slots (WARNING: This triggers reactivity, so els will be set to null)
    updateSlots([ ...timeSlots.filter(slot => slot !== dragging), slot ])
  }

  console.log('Re-rendered')

  return <div className={clz({ mobile: isMobile, edit: isEdit }, 'calendar-table-wrapper')}>
    <Loading loading={loading} error={error} />

    {ovNewSlot && <NewTimeSlotPopup close={pref => {
      if (pref) {
        const slotHour = moment(ovNewSlot.start).hour().toString()
        if ((slotHour === cal.end_hour.toString()) && moment(ovNewSlot.start).minute() > 0) {
          ovNewSlot.end = (moment(ovNewSlot.end).subtract(moment(ovNewSlot.start).minute(), 'minutes')).toString()
        }
        // Add it to the available time slots
        const newSlots = [ ...timeSlots, { ...ovNewSlot, preference: pref }]
        updateSlots(newSlots)
      }
      setOvNewSlot(null)
    }}/>}

    {(isEdit && ovEditSelect && ovEditSelect.preference !== 0) && <EditTimeSlotPopup slot={ovEditSelect} close={slot => {
      if (slot) updateSlots([ ...timeSlots.filter(s => s !== ovEditSelect), slot ])
      else updateSlots(timeSlots.filter(s => s !== ovEditSelect))
      setOvEditSelect(null)
    }} cal={cal} conti={continuity}/>}

    {(!isEdit && ovEditSelect) && <ConfirmSelectionPopup slot={ovEditSelect} conti={continuity} close={slot => {
      if (slot) selectCallback(slot)
      setOvEditSelect(null)
    }} duration={duration}/>}

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
        {regularity === 'weekly' && seq(nDays).map(d => <th key={d}>{moment().day(d).format('ddd')}</th>)}
      </tr>

      {/* One-hour grid */}
      {seq(24).filter(h => h >= cal.start_hour && h <= cal.end_hour).map(hour => <tr key={hour}>
        <td className="time">{hour}:00</td>
        {seq(nDays).map(d => d + startDay).map(day =>

          <td key={day} className="day" data-day={day} data-hour={hour} onClick={e => clickTd(e, day, hour)}
            onDragOver={ isEdit ? tdDragOver : undefined } onDrop={ isEdit ? e => tsDrop(e) : undefined }>

            {/* Find the time slots in this bucket */}
            {tsIndex[`${moment(cal.start_date).add(day, 'days').format('YYYY-MM-DD')} ${hour}`]?.map((slot, i) => {
              // Calculate height based on the duration of the slot relative to the hour
              const h = moment(slot.end).diff(slot.start, 'minutes') / 60 * 100
              const mt = moment(slot.start).diff(moment(slot.start).startOf('hour'), 'minutes') / 60 * 100

              // This is one of the time slots
              return <div key={i} className={`avail av${slot.preference}`} style={{ height: `${h}%`, top: `${mt}%` }}
                onClick={e => {
                  e.stopPropagation()
                  setOvEditSelect(slot)
                }}
                draggable={isEdit && slot.preference !== 0} // Meetings should not be draggable
                onDragStart={isEdit ? e => tsDragStart(e, slot, 'slot') : undefined}
              >{PREFERENCE_STR[slot.preference]}
                {/* A handle for dragging to expand/shrink */}
                {isEdit && <div className="drag-handle" draggable={true}
                  onDragStart={e => tsDragStart(e, slot, 'handle')}
                  onDrag={e => tsDragHandleBar(e)}
                />}
              </div>
            })}
          </td>
        )}
      </tr>)}
    </tbody>
    </table>
  </div>
}