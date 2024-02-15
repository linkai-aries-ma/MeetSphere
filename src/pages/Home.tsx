import * as React from 'react'
import {useEffect, useState} from 'react'
import {Meeting, UserSelf} from '../lib/types.ts'
import {Icon} from '@iconify/react'
import moment from 'moment'
import {clz} from '../lib/ui.ts'
import './Home.scss'
import {getScheduledMeetings, getUserSelf} from '../lib/sdk.ts'
import {Loading} from '../components/Loading.tsx'

export function Home() {
  const [self, setSelf] = useState<UserSelf | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [expanded, setExpanded] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    Promise.all([getScheduledMeetings(), getUserSelf()])
      .then(([meetings, user]) => {
        setMeetings(meetings)
        setSelf(user)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleMeeting = (id: number) => {
    setExpanded(prev => (prev.includes(id) ? prev.filter(meetingId => meetingId !== id) : [...prev, id]))
    console.log('toggle', id, expanded)
  }

  const deleteMeeting = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) setMeetings(meetings.filter(meeting => meeting.id !== id))
  }

  return <>
    {(meetings && self) && <main>
      <section className="welcome-section">
        <h2>Welcome {self.name}!</h2>
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
              className={clz({opened: expanded.includes(meeting.id)}, 'meeting')}
              onClick={() => toggleMeeting(meeting.id)}>

              <div className="meeting-content">
                <div>
                  <h2>With {meeting.with.name}</h2>
                  <span>{meeting.title}</span>
                  {/* format: Jan. 28th 2024 */}
                  <span>{moment(meeting.time).format('MMM. Do YYYY')}</span>
                  {/* format: 10:00 AM - 11:00 AM */}
                  <span>
                    {moment(meeting.time).format('h:mm A')} -{moment(meeting.time).add(meeting.durationMinutes, 'minutes').format('h:mm A')}
                  </span>
                </div>
                <img src={meeting.with.pfp} alt="" className="meeting-pfp"/>
              </div>

              {/* Show button group only on toggle */}
              <div className="button-group">
                <button className="alt">
                  <Icon icon="fluent:person-add-20-filled"/>
                </button>
                <a href="/calendar-timepicker">
                  <button>
                    <Icon icon="fluent:edit-20-filled"/>
                  </button>
                </a>
                <button
                  className="warn delete"
                  onClick={e => {
                    e.stopPropagation()
                    deleteMeeting(meeting.id)
                  }}>
                  <Icon icon="fluent:delete-20-filled"/>
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>}

    <Loading loading={loading} error={error} />
  </>
}
