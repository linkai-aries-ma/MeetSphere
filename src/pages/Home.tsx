import * as React from 'react'
import { useEffect, useState } from 'react'
import { Meeting, UserSelf } from '../lib/types.ts'
import { Icon } from '@iconify/react'
import moment from 'moment'
import { clz, getAvatar } from '../lib/ui.ts'
import './Home.scss'
import { MEETING, USER } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'


function EditMeetingOverlay({ close, meeting }: {close: (submit: boolean) => void, meeting: Meeting}) {
  const [ topic, setTopic ] = useState<string>(meeting.title)
  const [ desc, setDesc ] = useState<string>(meeting.description)
  const [ online, setOnline ] = useState<boolean>(meeting.is_virtual)
  const [ location, setLocation ] = useState<string>(meeting.location)
  const [ duration, setDuration ] = useState<number>(meeting.duration)
  const [ error, setError ] = useState<string>()
  const [ sending, setSending ] = useState<boolean>(false)

  function submit() {
    if (!topic || !desc) return setError('Please fill in topic and description.')

    // Check duration between 1 minute and 1 day
    if (duration < 1) return setError('Duration must be at least 1 minute.')
    if (duration > 24 * 60) return setError('Duration must be at most 1 day.')

    // Check location if not online
    if (!online && !location) return setError('Please fill in location for an in-person meeting.')

    // Update the meeting
    const updatedMeeting: Partial<Meeting> = {
      id: meeting.id,
      title: topic, description: desc, is_virtual: online,
      location, duration, regularity: meeting.regularity
    }

    // Send to server
    setSending(true)
    MEETING.update(updatedMeeting)
      .then(() => {
        close(true)
        window.location.reload()
      })
      .catch(err => setError(err.message))
      .finally(() => setSending(false))
  }

  return <div id="meeting-overlay" className="overlay" onClick={() => close(false)}>
    <div onClick={e => e.stopPropagation()}>
      <h1>Edit Meeting Details</h1>
      <span>With: {meeting.invitee.name}</span>
      <label>
        <input type="text" name="Meeting Topic" placeholder="Topic"
          value={topic} onChange={e => setTopic(e.target.value)}/>
      </label>
      <label>
        <textarea name="Meeting Description" placeholder="Description"
          value={desc} onChange={e => setDesc(e.target.value)}/>
      </label>
      <label>
        <span>Duration (minutes)</span>
        <input type="number" name="Meeting Duration" placeholder="Duration (minutes)"
          value={duration} onChange={e => setDuration(+e.target.value)}/>
      </label>

      {error && <div className="error">{error}</div>}
      <button id="meeting-submit" className="emp" onClick={submit}>Update</button>
      <button id="meeting-cancel" onClick={() => close(false)}>Cancel</button>
    </div>
  </div>
}

export function Home() {
  const [ self, setSelf ] = useState<UserSelf | null>(null)
  const [ meetings, setMeetings ] = useState<Meeting[]>([])
  const [ expanded, setExpanded ] = useState<string[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)
  const [ showOverlay, setShowOverlay ] = useState<Meeting | null>(null)
  const [ dataVersion, setDataVersion ] = useState(0)

  // Initial fetch
  useEffect(() => {
    Promise.all([ MEETING.list(), USER.get() ])
      .then(([ meetings, user ]) => {
        setMeetings(meetings)
        setSelf(user)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [dataVersion])

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
        <span>You have {meetingsToday.length === 0 ? 'no' : meetingsToday.length} meeting{meetingsToday.length === 1 ? '' : 's'} today.</span>
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
                {meeting.is_virtual &&
                    <a href={`https://meet.jit.si/meetsphere/${meeting.title.replaceAll(' ', '_').substring(0, 30)}_${meeting.id}`}
                      onClick={e => e.stopPropagation()}>
                      <button className="alt"><Icon icon="icomoon-free:enter"/></button>
                    </a>
                }
                <button onClick={() => setShowOverlay(meeting)}>
                  <Icon icon="fluent:edit-20-filled"/>
                </button>
                <button
                  className="warn delete"
                  onClick={e => {
                    e.stopPropagation()
                    deleteMeeting(meeting.id)
                  }}>
                  <Icon icon="fluent:delete-20-filled"/>
                </button>
              </div>


              {showOverlay && <EditMeetingOverlay close={(submit: boolean) => {
                setShowOverlay(null)
                if (submit) {
                  setDataVersion(dataVersion + 1)  // Increment dataVersion
                }
              }} meeting={showOverlay} />}
            </article>
          ))}
        </section>
      </div>
    </main>}

    <Loading loading={loading} error={error} />
  </>
}
