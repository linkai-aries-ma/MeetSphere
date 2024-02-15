import * as React from 'react';
import {useState} from "react";

interface LoginOverlayProps {
  isSignup: boolean;
  close: (success: boolean) => void;
}

export function LoginOverlay({isSignup, close}: LoginOverlayProps): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  function handleClick() {
    // Check if all fields have value
    if (!username || !password || (isSignup && (!email || !passwordConfirm))) {
      setError('Please fill in all fields');
      return;
    }

    // Check if password and passwordConfirm match
    if (isSignup && password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    // TODO: Send request to server

    // Close overlay
    close(true);
  }

  return <>
    <div id="login-overlay" className="overlay" onClick={() => close(false)}>
      <div onClick={e => e.stopPropagation()}>
        <h1>{isSignup ? 'Sign up' : 'Login'}</h1>
        {error && <div className="error">{error}</div>}
        <label>
          <input type="text" name="username" placeholder="Username"
                 value={username} onChange={e => setUsername(e.target.value)}/>
        </label>
        {isSignup && <label>
            <input type="text" name="email" placeholder="Email"
                   value={email} onChange={e => setEmail(e.target.value)}/>
        </label>}
        <label>
          <input type="password" name="password" placeholder="Password"
                 value={password} onChange={e => setPassword(e.target.value)}/>
        </label>
        {isSignup && <label>
            <input type="password" name="password-confirm" placeholder="Confirm password"
                   value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}/>
        </label>}
        <button type="submit" onClick={handleClick}>
          <span>{isSignup ? 'Sign up' : 'Login'}</span>
        </button>
      </div>
    </div>
  </>
}