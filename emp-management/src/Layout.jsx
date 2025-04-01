import React from 'react'

import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/navbar'


function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-4">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
