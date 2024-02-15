import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.scss'
import 'modern-normalize/modern-normalize.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Welcome } from './pages/Welcome.tsx'
import { NavBar } from './components/NavBar.tsx'
import { Home } from './pages/Home.tsx'
import {Calendar} from './pages/Calendar.tsx'
import {Schedule} from './pages/Schedule.tsx'

const routes = createBrowserRouter([
  { path: '/', Component: Welcome },
  { path: '/home', Component: Home },
  { path: '/calendar', Component: Calendar },
  { path: '/schedule/:uuid', Component: Schedule },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <NavBar />

    <React.StrictMode>
      <RouterProvider router={routes} />
    </React.StrictMode>
  </>
)
