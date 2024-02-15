import * as React from 'react';
import './Welcome.scss';
import {useState} from "react";

export function Welcome(): React.JSX.Element {

  function loginSubmit() {
    // Redirect to /home

  }

  return <main id="index">
    <div className="title">
      <div className="text">
        Where calendars collide, <br/>
        opportunities arise.
      </div>
      <div className="subtitle">
        MeetSphere is your one-stop solution for scheduling perfect meeting time with people far away, no troublesome
        email exchanges needed!
      </div>
    </div>

    <div className="image">
      <img src="/assets/front-page.jpg" alt=""/>
    </div>
  </main>
}