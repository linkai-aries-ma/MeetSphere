import * as React from 'react'
import './Contacts.scss'
import { Contact } from '../lib/types.ts'
import { useEffect, useState } from 'react'
import { CONTACT } from '../lib/sdk.ts'
import { Loading } from '../components/Loading.tsx'
import { clz } from '../lib/ui.ts'
import { Icon } from '@iconify/react'
import { toggle } from '../lib/utils.ts'

function InviteOverlay({ close, contact }: {close: (submit: boolean) => void, contact: Contact}) {
  const [ topic, setTopic ] = useState<string>()
  const [ desc, setDesc ] = useState<string>()
  const [ online, setOnline ] = useState<boolean>(false)
  const [ location, setLocation ] = useState<string>()

  return <div id="meeting-overlay" className="overlay" onClick={() => close(true)}>
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
      <button id="switch-online-btn" className={online ? 'alt' : ''} onClick={() => setOnline(!online)}>
        {online ? 'Online Meeting' : 'In-Person Meeting'}
      </button>
      {online && <label>
        <input type="text" name="Meeting Location" placeholder="Location"
          value={location} onChange={e => setLocation(e.target.value)}/>
      </label>}
      <button id="meeting-submit" className="emp">Submit</button>
      <button id="meeting-cancel" onClick={() => close(true)}>Cancel</button>
    </div>
  </div>
}

function AddContactOverlay({ close }: { close: (submit: Contact | null) => void }) {
  const [ name, setName ] = useState<string>()
  const [ email, setEmail ] = useState<string>()

  // TODO: Edit contact
  // TODO: Contact pfp

  return <div id="contact-overlay" className="overlay" onClick={() => close(null)}>
    <div onClick={e => e.stopPropagation()}>
      <h1>Add New Contact</h1>
      <label>
        <input type="text" name="contact-name" placeholder="Name"
          value={name} onChange={e => setName(e.target.value)}/>
      </label>
      <label>
        <input type="email" name="contact-email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}/>
      </label>
      <button id="contact-submit" className="emp"
        onClick={() => close({ id: 0, name, email, pfp: '' })}>Submit</button>
      <button id="contact-cancel" onClick={() => close(null)}>Cancel</button>
    </div>
  </div>
}

interface ContactsProps {
  select?: boolean
}

export function Contacts({ select }: ContactsProps) {
  select = true

  const [ contacts, setContacts ] = useState<Contact[]>([])
  const [ error, setError ] = useState<string>()
  const [ loading, setLoading ] = useState<boolean>(true)

  const [ selectDone, setSelectDone ] = useState<boolean>(false)
  const [ ovAdd, setOvAdd ] = useState<boolean>(false)
  const [ ovInvite, setOvInvite ] = useState<Contact | null>(null)

  const [ invited, setInvited ] = useState<number[]>([])
  const [ expanded, setExpanded ] = useState<number[]>([])

  // Fetch contacts from server
  useEffect(() => {
    CONTACT.list().then(setContacts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function deleteContact(contact: Contact) {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) return

    CONTACT.delete(contact.id).then(() => {
      setContacts(contacts.filter(c => c.id !== contact.id))
    }).catch(err => setError(err.message))
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

          <img src={contact.pfp} alt="contact-pfp"/>
          <div>
            <span>{contact.name}</span>
            <span>{contact.email}</span>
          </div>
          {select && <button className="emp send" onClick={e => {
            setOvInvite(contact)
            e.stopPropagation()
          }}>Send</button>}

          <button className="warn delete icon" onClick={() => deleteContact(contact)}>
            <Icon icon="fluent:delete-20-filled" />
          </button>
        </div>)}

        <div className="button-group">
          <button onClick={() => setOvAdd(true)}>+</button>
          {(select && selectDone) && <button id="cont-done-button" className="emp">Done</button>}
        </div>
      </div>

      {ovAdd && <AddContactOverlay close={() => setOvAdd(false)}/>}
      {ovInvite && <InviteOverlay close={submit => {
        setOvInvite(null)
        if (submit) {
          setSelectDone(true)
          setInvited([ ...invited, ovInvite.id ])
        }
      }} contact={ovInvite}/>}
    </main>}

    <Loading loading={loading} error={error}/>
  </>
}