import React from 'react'
import ReactDOM from 'react-dom/client'
import "./global.scss"
import 'modern-normalize/modern-normalize.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

const router = createBrowserRouter([
    {
        path: '/',
        component: App,
    },
])

// @ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>,
)
