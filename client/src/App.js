import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import PrevalenceIncidence from './pages/PrevalenceIncidence';
import WorldPopulation from './pages/WorldPopulation';
import { Definitions, Mortality, Contact } from './pages/OtherPages';
import './styles/global.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/world-population" element={
            <ProtectedRoute>
              <Layout><WorldPopulation /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/prevalence" element={
            <ProtectedRoute>
              <Layout><PrevalenceIncidence /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/mortality" element={
            <ProtectedRoute>
              <Layout><Mortality /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/definitions" element={
            <ProtectedRoute>
              <Layout><Definitions /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <Layout><Contact /></Layout>
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}