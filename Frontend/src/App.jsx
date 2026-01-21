import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes (with Navbar and Footer) */}
          <Route path="/" element={
            <>
              <Navbar />
              <main><Home /></main>
              <Footer />
            </>
          } />
          <Route path="/signup" element={
            <>
              <Navbar />
              <main>
                <RedirectIfAuthenticated>
                  <SignUp />
                </RedirectIfAuthenticated>
              </main>
              <Footer />
            </>
          } />
          <Route path="/signin" element={
            <>
              <Navbar />
              <main>
                <RedirectIfAuthenticated>
                  <SignIn />
                </RedirectIfAuthenticated>
              </main>
              <Footer />
            </>
          } />

          {/* Protected Dashboard Routes (without Navbar and Footer) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
