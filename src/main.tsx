import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.scss'
import 'modern-normalize/modern-normalize.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Welcome } from './pages/Welcome.tsx'
import { NavBar } from './components/NavBar.tsx'
import { Home } from './pages/Home.tsx'
import { CalendarView } from './pages/CalendarView.tsx'
import { Schedule } from './pages/Schedule.tsx'
import { Contacts } from './pages/Contacts.tsx'

const routes = createBrowserRouter([
  { path: '/', Component: Welcome },
  { path: '/home', Component: Home },
  { path: '/calendar', Component: CalendarView },
  { path: '/schedule/:uuid', Component: Schedule },
  { path: '/contacts', Component: Contacts },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <NavBar/>

    <React.StrictMode>
      <RouterProvider router={routes}/>
    </React.StrictMode>
  </>
)
