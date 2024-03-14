import * as React from 'react'
import moment from 'moment/moment'
import { Calendar, PREFERENCE_STR, TimeSlot } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import './CalendarTable.scss'
import { clz } from '../lib/ui.ts'
import { CALENDAR } from '../lib/sdk.ts'
import { Loading } from './Loading.tsx'

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

interface CalendarViewProps {
  cal: Calendar
  regularity: 'once' | 'weekly'
  mode: 'edit' | 'select'
}

export function CalendarTable({ cal, regularity, mode }: CalendarViewProps) {
  const isEdit = mode === 'edit'
  const [ timeSlots, setTimeSlots ] = useState<TimeSlot[]>([])
  const [ nDays, setNDays ] = useState<number>(7)
  const [ tsIndex, setTsIndex ] = useState<{[key: string]: TimeSlot[]}>({})
  const ref = React.useRef<HTMLTableElement>(null)
  const [ isMobile, setIsMobile ] = useState<boolean>(false)

  // For responsive design
  const [ maxDays, setMaxDays ] = useState<number>(7)
  const [ startDay, setStartDay ] = useState<number>(0)

  // New time slot
  const [ ovNewSlot, setOvNewSlot ] = useState<TimeSlot | null>(null)
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)

  useEffect(() => {
    setTimeSlots(cal.time_slots)
  }, [cal])

  // Compute values based on properties
  useEffect(() => {
    setMaxDays(moment(cal.end_date).diff(moment(cal.start_date), 'days') + 1)
    if (nDays > maxDays) setNDays(maxDays)

    // Compute time slot index
    const index = {}

    timeSlots.forEach(slot => {
      // Extract the date and hour from the startTime
      const startHour = moment(slot.start).format('YYYY-MM-DD H')

      // TODO: Fix time slots spanning multiple days

      // Initialize the array if this is the first slot for this hour
      if (!index[startHour]) index[startHour] = []

      // Add the slot to the bucket
      index[startHour].push(slot)
    })

    setTsIndex(index)
  }, [ cal, timeSlots ])

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

  function updateSlots(slots: TimeSlot[]) {
    setTimeSlots(slots)
    setLoading(true)
    CALENDAR.update({ ...cal, time_slots: slots })
      .catch(err => setError(err.message)).finally(() => setLoading(false))
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
    const m = calcMin(e, e.currentTarget)

    // Create a new time slot
    if (mode === 'edit') {
      console.log('Create a new time slot')
      const sd = moment(cal.start_date).add(day, 'days').hour(hour).minute(m)
      setOvNewSlot({
        start: sd.toISOString(),
        end: sd.add(1, 'hour').toISOString(),
        preference: 1,
      })
    }
  }

  // Click on a time slot
  function clickSlot(e: React.MouseEvent<HTMLDivElement>, slot: TimeSlot) {
    console.log('Clicked on', slot, e)
    e.stopPropagation()
  }

  // **************************
  // Drag a time slot
  // **************************

  let dragging: TimeSlot | null = null
  let dragOrig: HTMLDivElement | null = null
  let dragGhost: HTMLDivElement | null = null
  let dragType: 'handle' | 'slot' = 'slot'
  let dragStartY: number = 0
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
  }

  function tsDrop(e: React.DragEvent<HTMLDivElement>) {
    console.log('Drop', e)
    e.preventDefault()
    if (!dragging || !dragGhost) return

    const slot = { ...dragging }

    if (dragType === 'slot') {
      // Calculate the new time slot
      const day = +e.currentTarget.dataset.day
      const hour = +e.currentTarget.dataset.hour
      const m = calcMin(e, e.currentTarget)

      // Update the slot
      const duration = moment(slot.end).diff(slot.start, 'minutes')
      const sd = moment(cal.start_date).add(day, 'days').hour(hour).minute(m)
      slot.start = sd.toISOString()
      slot.end = sd.add(duration, 'minutes').toISOString()

      // Remove the ghost slot
      dragGhost.remove()
      dragOrig.style.opacity = '1'
    }

    else if (dragType === 'handle') {
      // Calculate the new time slot duration
      if (!dragGhost.style.height) return
      const m = +dragGhost.style.height.replace('%', '') / 100 * 60
      slot.end = moment(slot.start).add(m, 'minutes').toISOString()

      // Remove the ghost slot
      dragGhost.remove()
      dragOrig.style.opacity = '1'
    }

    // Add the slot back to the time slots (WARNING: This triggers reactivity, so els will be set to null)
    updateSlots([ ...timeSlots.filter(slot => slot !== dragging), slot ])
  }

  console.log('Rerendered')

  return <div className={clz({ mobile: isMobile, edit: isEdit }, 'calendar-table-wrapper')}>
    <Loading loading={loading} error={error} />

    {ovNewSlot && <NewTimeSlotPopup close={pref => {
      if (pref) {
        console.log('New time slot preference', pref)
        // Add it to the available time slots
        const newSlots = [ ...timeSlots, { ...ovNewSlot, preference: pref }]
        updateSlots(newSlots)
      }
      setOvNewSlot(null)
    }}/>}

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
      {seq(24).filter(h => h > cal.start_hour && h < cal.end_hour).map(hour => <tr key={hour}>
        <td className="time">{hour}:00</td>
        {seq(nDays).map(d => d + startDay).map(day =>

          <td key={day} className="day" data-day={day} data-hour={hour} onClick={e => clickTd(e, day, hour)}
            onDragOver={ isEdit ? tdDragOver : undefined } onDrop={ isEdit ? e => tsDrop(e) : undefined }>

            {/* Find the time slots in this bucket */}
            {tsIndex[`${moment(cal.start_date).add(day, 'days').format('YYYY-MM-DD')} ${hour}`]?.map((slot, i) => {
              // Calculate height based on the duration of the slot relative to the hour
              const h = moment(slot.end).diff(slot.start, 'minutes') / 60 * 100
              const mt = moment(slot.start).diff(moment(slot.start).startOf('hour'), 'minutes') / 60 * 100
              return <div key={i} className={`avail av${slot.preference}`} style={{ height: `${h}%`, top: `${mt}%` }}
                onClick={e => clickSlot(e, slot)}
                draggable={isEdit}
                onDragStart={isEdit ? e => tsDragStart(e, slot, 'slot') : undefined}
              >{PREFERENCE_STR[slot.preference]}
                {/* A handle for dragging to expand/shrink */}
                <div className="drag-handle" draggable={isEdit}
                  onDragStart={isEdit ? e => tsDragStart(e, slot, 'handle') : undefined}
                  onDrag={isEdit ? e => tsDragHandleBar(e) : undefined}
                />
              </div>
            })}
          </td>
        )}
      </tr>)}
    </tbody></table>
  </div>
}