import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import ProtectedRoute from './Components/ProtectedRoute';
import Login from './Components/Login';
import Unitoverview from './Components/Unitoverview.jsx'
import UnitProfile from './Components/UnitProfile.jsx'
import Tenantsoverview from './Components/tenantoverview.jsx'
import Payments from './Components/Payments.jsx'
import Settings from './Components/Settings.jsx'
import Tenantprofile from './Components/tenantprofile.jsx'

function App() {


  return (
    <Router>
      <SystemProvider>
        <AuthProvider>
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
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Unitoverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/unit/:unitNumber" 
              element={
                <ProtectedRoute>
                  <UnitProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tenantoverview" 
              element={
                <ProtectedRoute>
                  <Tenantsoverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payments" 
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tenantprof/:id?" 
              element={
                <ProtectedRoute>
                  <Tenantprofile />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </SystemProvider>
    </Router>
  )
}

export default App
