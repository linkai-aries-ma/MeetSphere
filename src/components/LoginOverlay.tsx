import * as React from 'react'
import { useState } from 'react'
import { login, register } from '../lib/sdk.ts'

interface LoginOverlayProps {
  isSignup: boolean
  close: (success: boolean) => void
}

export function LoginOverlay({ isSignup, close }: LoginOverlayProps): React.JSX.Element {
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ passwordConfirm, setPasswordConfirm ] = useState('')
  const [ error, setError ] = useState('')

  async function handleClick() {
    if (!email || !password || (isSignup && (!name || !passwordConfirm))) {
      setError('Please fill in all fields')
      return
    }

    if (isSignup && password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    if (isSignup) {
      register(name, email, password).then(() => close(true)).catch(err => setError(err.message))
    }
    else {
      login(email, password).then(() => close(true)).catch(err => setError(err.message))
    }
  }
  return (
    <div id="login-overlay" className="overlay" onClick={() => close(false)}>
      <div onClick={e => e.stopPropagation()}>
        <h1>{isSignup ? 'Sign up' : 'Login'}</h1>
        {error && <div className="error">{error}</div>}
        <label>
          <input type="text" name="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}/>
        </label>

        {isSignup && (
          <label>
            <input type="text" name="username" placeholder="Username"
              value={name} onChange={e => setName(e.target.value)}/>
          </label>
        )}

        <label>
          <input type="password" name="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}/>
        </label>

        {isSignup && (
          <label>
            <input type="password" name="pw-confirm" placeholder="Confirm password"
              value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
            />
          </label>
        )}

        <button type="submit" onClick={handleClick}>
          <span>{isSignup ? 'Sign up' : 'Login'}</span>
        </button>
      </div>
    </div>
  )
}
