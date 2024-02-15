import React from 'react'
import ReactDOM from 'react-dom/client'
import "./global.scss"
import 'modern-normalize/modern-normalize.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Welcome} from "./pages/Welcome.tsx";
import {NavBar} from "./components/NavBar.tsx";
import {Home} from "./pages/Home.tsx";

const router = createBrowserRouter([
  {path: '/', Component: Welcome},
  {path: '/home', Component: Home},
])

ReactDOM.createRoot(document.getElementById('root')!).render(<>
  <NavBar isLogin={true} />

  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
</>)
