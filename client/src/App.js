import Landing from './pages/Landing';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import PrevalenceIncidence from './pages/PrevalenceIncidence';
import { Definitions, Mortality, WorldPopulation, Contact } from './pages/OtherPages';
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
          <Route path="/login" element={<Login />} />

          {/* Protected */}
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
          <Route path="/world-population" element={
            <ProtectedRoute>
              <Layout><WorldPopulation /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <Layout><Contact /></Layout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
