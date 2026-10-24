import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import PrevalenceIncidence from './pages/PrevalenceIncidence';
import WorldPopulation from './pages/WorldPopulation';
import Survival from './pages/Survival';
import GeneticTesting from './pages/GeneticTesting';
import Mortality from './pages/Mortality';
import Incidence from './pages/Incidence';
import MutationRate from './pages/MutationRate';
import { Definitions, Contact } from './pages/OtherPages';
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
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/world-population" element={
            <ProtectedRoute><Layout><WorldPopulation /></Layout></ProtectedRoute>
          } />
          <Route path="/prevalence" element={
            <ProtectedRoute><Layout><PrevalenceIncidence /></Layout></ProtectedRoute>
          } />
          <Route path="/incidence" element={
            <ProtectedRoute><Layout><Incidence /></Layout></ProtectedRoute>
          } />
          <Route path="/mutation-rate" element={
            <ProtectedRoute><Layout><MutationRate /></Layout></ProtectedRoute>
          } />
          <Route path="/survival" element={
            <ProtectedRoute><Layout><Survival /></Layout></ProtectedRoute>
          } />
          <Route path="/genetic-testing" element={
            <ProtectedRoute><Layout><GeneticTesting /></Layout></ProtectedRoute>
          } />
          <Route path="/mortality" element={
            <ProtectedRoute><Layout><Mortality /></Layout></ProtectedRoute>
          } />
          <Route path="/definitions" element={
            <ProtectedRoute><Layout><Definitions /></Layout></ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute><Layout><Contact /></Layout></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
