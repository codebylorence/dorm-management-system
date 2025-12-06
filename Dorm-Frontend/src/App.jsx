import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Unitoverview from './Components/Unitoverview.jsx'
import UnitProfile from './Components/UnitProfile.jsx'
import Tenantsoverview from './Components/tenantoverview.jsx'
import Paymenthistory from './Components/paymenthistory.jsx'
import Tenantprofile from './Components/tenantprofile.jsx'

function App() {


  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Unitoverview/>} />
        <Route path="/unit/:unitNumber" element={<UnitProfile/>} />
        <Route path="/tenantoverview" element={<Tenantsoverview/>} />
        <Route path="/paymenthistory" element={<Paymenthistory/>} />
        <Route path="//tenantprof" element={<Tenantprofile/>} />
      </Routes>
    </Router>
  )
}

export default App
