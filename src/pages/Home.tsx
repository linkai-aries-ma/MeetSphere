import * as React from 'react'
import { useEffect, useState } from 'react'
import { Meeting, UserSelf } from '../lib/types.ts'
import { Icon } from '@iconify/react'
import moment from 'moment'
import { clz, getAvatar } from '../lib/ui.ts'
import './Home.scss'
import { MEETING, USER } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'

export function Home() {
  const [ self, setSelf ] = useState<UserSelf | null>(null)
  const [ meetings, setMeetings ] = useState<Meeting[]>([])
  const [ expanded, setExpanded ] = useState<string[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    Promise.all([ MEETING.list(), USER.get() ])
      .then(([ meetings, user ]) => {
        setMeetings(meetings)
        setSelf(user)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleMeeting = (id: string) => {
    setExpanded(prev => (prev.includes(id) ? prev.filter(meetingId => meetingId !== id) : [ ...prev, id ]))
    console.log('toggle', id, expanded)
  }

  const deleteMeeting = (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return

    MEETING.delete(id)
      .then(() => setMeetings(meetings.filter(meeting => meeting.id !== id)))
      .catch(err => setError(err.message))
  }

  const upcomingMeetings = meetings.filter(meeting => moment(meeting.time).isAfter(moment()))
  const meetingsToday = meetings.filter(meeting => moment(meeting.time).isSame(moment(), 'day'))

  return <>
    {(meetings && self) && <main>
      <section className="welcome-section">
        <h2>Welcome {self.name}!</h2>
        <span>You have {meetingsToday.length === 0 ? 'no' : meetingsToday.length} meetings today.</span>
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

          {upcomingMeetings.map(meeting => (
            <article
              key={meeting.id}
              className={clz({ opened: expanded.includes(meeting.id) }, 'meeting')}
              onClick={() => toggleMeeting(meeting.id)}>

              <div className="meeting-content">
                <div>
                  <h2>With {meeting.invitee.name}</h2>
                  <span>{meeting.title}</span>
                  {/* format: Jan. 28th 2024 */}
                  <span>{moment(meeting.time).format('MMM. Do YYYY')} ({moment(meeting.time).fromNow()})</span>
                  {/* format: 10:00 AM - 11:00 AM */}
                  <span>
                    {moment(meeting.time).format('h:mm A')} ~ {moment(meeting.time).add(meeting.duration, 'minutes').format('h:mm A')}
                  </span>
                </div>
                <img src={getAvatar(meeting.invitee)} alt="" className="meeting-pfp"/>
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
