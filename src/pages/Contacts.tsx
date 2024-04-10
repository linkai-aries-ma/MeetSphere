import * as React from 'react'
import './Contacts.scss'
import { Calendar, Contact, NewContact, NewMeeting } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { CALENDAR, CONTACT, MEETING, send } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'
import { clz, getAvatar } from '../lib/ui.ts'
import { Icon } from '@iconify/react'
import { toggle } from '../lib/utils.ts'

function InviteOverlay({ close, contact, calendar }: {close: (submit: boolean) => void, contact: Contact, calendar: number}) {
  const [ topic, setTopic ] = useState<string>('')
  const [ desc, setDesc ] = useState<string>('')
  const [ online, setOnline ] = useState<boolean>(true)
  const [ location, setLocation ] = useState<string>('')
  const [ duration, setDuration ] = useState<number>(30)
  const [ error, setError ] = useState<string>()
  const [ sending, setSending ] = useState<boolean>(false)

  function submit() {
    if (!topic || !desc) return setError('Please fill in topic and description.')

    // Check duration between 1 minute and 1 day
    if (duration < 1) return setError('Duration must be at least 1 minute.')
    if (duration > 24 * 60) return setError('Duration must be at most 1 day.')

    // Check location if not online
    if (!online && !location) return setError('Please fill in location for an in-person meeting.')

    // Create the meeting
    const meeting: NewMeeting = {
      title: topic, description: desc, is_virtual: online,
      location, duration, regularity: 'once',
      invitee: contact.id, calendar
    }

    // Send to server
    setSending(true)
    MEETING.add(meeting)
      .then(response => {
      // The meeting was created successfully
        close(true)

        // Send the invite
        MEETING.invite(response.id)
          .catch(err => setError(err.message))
      })
      .catch(err => setError(err.message))
      .finally(() => setSending(false))
  }

  return <div id="meeting-overlay" className="overlay" onClick={() => close(false)}>
    <div onClick={e => e.stopPropagation()}>
      <h1>Meeting Details</h1>
      <span>With: {contact.name}</span>
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
      <button id="meeting-submit" className="emp" onClick={submit}>Submit</button>
      <button id="meeting-cancel" onClick={() => close(false)}>Cancel</button>
    </div>
  </div>
}

function AddContactOverlay({ close, contact }: { close: (submit: Contact | null) => void, contact?: Contact }) {
  const [ name, setName ] = useState<string>(contact ? contact.name : '')
  const [ email, setEmail ] = useState<string>(contact ? contact.email : '')
  const [ pfp, setPfp ] = useState<string>(contact ? contact.pfp : '')
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ error, setError ] = useState<string>()

  const onPfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0]
    if (file) {
      // Upload file
      setLoading(true)
      CONTACT.uploadPfp(contact ? contact.id : 0, file)
        .then(() => {
          setPfp(URL.createObjectURL(file))
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }

  const onSubmit = () => {
    if (name && email) {
      close({ id: contact ? contact.id : 0, name, email, pfp })
    } else {
      close(null)
    }
  }

  return <div id="contact-overlay" className="overlay" onClick={() => close(null)}>
    <div onClick={e => e.stopPropagation()}>
      <h1>{contact ? 'Edit Contact' : 'Add New Contact'}</h1>
      <label>
        <input type="text" name="contact-name" placeholder="Name"
          value={name} onChange={e => setName(e.target.value)}/>
      </label>
      <label>
        <input type="email" name="contact-email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}/>
      </label>
      {contact && <label>
        <input type="file" name="contact-pfp" onChange={onPfpChange}/>
        {pfp && <img src={pfp} alt="contact-pfp" style={{ maxWidth: '100px', maxHeight: '100px' }}/>}
      </label>}
      <button id="contact-submit" className="emp"
        onClick={onSubmit}>Submit
      </button>
      <button id="contact-cancel" onClick={() => close(null)}>Cancel</button>
    </div>
  </div>
}

export function Contacts() {
  const [ contacts, setContacts ] = useState<Contact[]>([])
  const [ selectCalendar, setSelectCalendar ] = useState<Calendar>(null)
  const [ error, setError ] = useState<string>()
  const [ loading, setLoading ] = useState<boolean>(true)

  const [ selectDone, setSelectDone ] = useState<boolean>(false)
  const [ ovAdd, setOvAdd ] = useState<boolean>(false)
  const [ ovInvite, setOvInvite ] = useState<Contact | null>(null)
  const [ ovContact, setOvContact ] = useState<Contact | null>(null)

  const [ invited, setInvited ] = useState<number[]>([])
  const [ expanded, setExpanded ] = useState<number[]>([])

  // Check if send parameter is on
  const params = new URLSearchParams(window.location.search)
  const select = params.get('select')

  // Load contacts (and optionally, the calendar that we're selecting a contact for)
  const refresh = () => {
    Promise.all([ CONTACT.list(), select && CALENDAR.list(), select && MEETING.list() ])
      .then(([ contacts, cals, meetings ]) => {
        setContacts(contacts)
        if (select)
        {
          setSelectCalendar(cals.find(cal => cal.id === +select))
          setInvited(meetings.filter(m => m.calendar.id === +select).map(m => m.invitee.id))
          console.log(invited)
        }
      }).catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Fetch contacts from server
  useEffect(() => refresh(), [])

  function deleteContact(contact: Contact) {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) return

    CONTACT.delete(contact.id).then(() => {
      setContacts(contacts.filter(c => c.id !== contact.id))
    }).catch(err => setError(err.message))
  }

  function addContact(d: NewContact) {
    CONTACT.add(d).then(refresh)
      .catch(err => setError(err.message))
      .finally(() => setOvAdd(false))
  }

  function updateContact(d: Contact) {
    CONTACT.update(d).then(refresh)
      .catch(err => setError(err.message))
      .finally(() => setOvContact(null))
  }

  return <>
    {contacts && <main>
      <div id="contact-list">
        <div className="section-header">
          <h2>Contacts</h2>
          <p className="hide-select">Click on the contact you want to invite.</p>
        </div>

        {contacts.map(contact => <div key={contact.id}
          onClick={() => {setExpanded(arr => toggle(arr, contact.id))}}
          className={clz({ opened: expanded.includes(contact.id) }, 'contact')}>

          <img src={getAvatar(contact)} alt="contact-pfp" onClick={() => setOvContact(contact)}/>
          <div>
            <span>{contact.name}</span>
            <span>{contact.email}</span>
          </div>
          {select && <button className="emp send" onClick={e => {
            if (invited.includes(contact.id) &&
              !confirm(`You've already invited ${contact.name} for a meeting. ` +
                'Do you want to invite them for another meeting?')) return
            setOvInvite(contact)
            e.stopPropagation()
          }}>{invited.includes(contact.id) ? '✔' : 'Send'}</button>}

          <button className="warn delete icon" onClick={() => deleteContact(contact)}>
            <Icon icon="fluent:delete-20-filled" />
          </button>
        </div>)}

        <div className="button-group">
          <button onClick={() => setOvAdd(true)}>+</button>
          {(select && selectDone) && <button id="cont-done-button" className="emp" onClick={() => window.location.href = '/calendar'}>Done</button>}
        </div>
      </div>

      {ovAdd && <AddContactOverlay close={d => {
        if (d) addContact(d)
        else setOvAdd(false)
      }}/>}
      {ovInvite && <InviteOverlay calendar={selectCalendar.id} close={submit => {
        setOvInvite(null)
        if (submit) {
          setSelectDone(true)
          setInvited([ ...invited, ovInvite.id ])
        }
      }} contact={ovInvite}/>}
      {ovContact && <AddContactOverlay close={contact => {
        if (contact) updateContact(contact)
        else setOvContact(null)
      }} contact={ovContact}/>}
    </main>}

    <Loading loading={loading} error={error}/>
  </>
}