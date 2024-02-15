import * as React from 'react'
import { useState } from 'react'
import { PendingMeeting } from '../lib/types.ts'
import { Icon } from '@iconify/react'
import moment from 'moment'
import { EX_MEETINGS } from '../lib/examples.ts'
import { clz } from '../lib/ui.ts'
import './Home.scss'

export function Home() {
  const [meetings, setMeetings] = useState<PendingMeeting[]>(EX_MEETINGS)
  const [expanded, setExpanded] = useState<number[]>([])

  const toggleMeeting = (id: number) => {
    setExpanded(prev => (prev.includes(id) ? prev.filter(meetingId => meetingId !== id) : [...prev, id]))
    console.log('toggle', id, expanded)
  }

  const deleteMeeting = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) setMeetings(meetings.filter(meeting => meeting.id !== id))
  }

  return (
    <main>
      <section className="welcome-section">
        <h2>Welcome LinKai!</h2>
        <span>You have {meetings.length} upcoming meetings today.</span>
      </section>

      <div className="content">
        <section className="meeting-list">
          <div className="section-header">
            <div>
              <h2>Upcoming Meetings</h2>
              <a href="/calendar">
                <button>+</button>
              </a>
            </div>
          </div>

          {meetings.map(meeting => (
            <article
              key={meeting.id}
              className={clz({ opened: expanded.includes(meeting.id) }, 'meeting')}
              onClick={() => toggleMeeting(meeting.id)}>
              <div className="meeting-content">
                <div>
                  <h2>With {meeting.with.name}</h2>
                  <span>{meeting.description}</span>
                  {/* format: Jan. 28th 2024 */}
                  <span>{moment(meeting.time).format('MMM. Do YYYY')}</span>
                  {/* format: 10:00 AM - 11:00 AM */}
                  <span>
                    {moment(meeting.time).format('h:mm A')} -{moment(meeting.time).add(meeting.durationMinutes, 'minutes').format('h:mm A')}
                  </span>
                </div>
                <img src={meeting.with.pfp} alt="" className="meeting-pfp" />
              </div>

              {/* Show button group only on toggle */}
              <div className="button-group">
                <button className="alt">
                  <Icon icon="fluent:person-add-20-filled" />
                </button>
                <a href="/calendar-timepicker">
                  <button>
                    <Icon icon="fluent:edit-20-filled" />
                  </button>
                </a>
                <button
                  className="warn delete"
                  onClick={e => {
                    e.stopPropagation()
                    deleteMeeting(meeting.id)
                  }}>
                  <Icon icon="fluent:delete-20-filled" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
