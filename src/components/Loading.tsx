import * as React from 'react'
import './Loading.sass'
import {Icon} from '@iconify/react'

interface LoadingProps {
    loading: boolean
    error: string | null
}

export function Loading({loading, error}: LoadingProps) {
  return <>
    {loading && <div className="overlay">
      <div className="spinner">
        <Icon icon='line-md:loading-twotone-loop'/>
      </div>
    </div>}
    {error && <div className="overlay err">
      <div>
        <div className="error">Error: {error}</div>

        <div>Please try again later, or contact the site maintainer to report the issue.</div>

        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    </div>}
  </>
}