import * as React from 'react'
import { clz } from '../lib/ui.ts'
import { LoginOverlay } from './LoginOverlay.tsx'
import { useState } from 'react'

export function NavBar(): React.JSX.Element {
  const path = window.location.pathname
  const isLogin = path === '/'
  const [ isSignup, setIsSignup ] = useState(false)
  const [ loginOverlay, setLoginOverlay ] = useState(false)

  const paths = {
    home: '/home',
    calendar: '/calendar',
    contacts: '/contacts',
  }

  function clickLogin(signup: boolean) {
    setIsSignup(signup)
    setLoginOverlay(true)
  }

  return <>
    <header className="nav">
      <div className="nav-content">
        <a href="/" className="left">
          <img src="/favicons/android-chrome-512x512.png" alt="Logo"/>
          <div className="title">MeetSphere</div>
        </a>

        {isLogin && (
          <div className="right" id="ms-nav-welcome">
            <button onClick={_ => clickLogin(false)}>Log in</button>
            <button onClick={_ => clickLogin(true)} className="emp">
              Get started
            </button>
          </div>
        )}

        {!isLogin && (
          <div className="right" id="ms-nav-portal">
            {Object.keys(paths).map(key => (
              <a href={paths[key]} key={key}>
                <button className={clz({ emp: path.toLowerCase().startsWith(paths[key]) })}>{key}</button>
              </a>
            ))}
          </div>
        )}
      </div>
    </header>

    {loginOverlay && <LoginOverlay isSignup={isSignup} close={() => setLoginOverlay(false)}/>}
  </>
}
