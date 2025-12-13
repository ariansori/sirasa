import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import DetailAssetPage from './pages/DetailAssetPage';
import HistoryPage from './pages/HistoryPage';
import RiskDetailPage from './pages/RiskDetailPage';
import TreatmentDetailPage from './pages/TreatmentDetailPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Public (Bisa diakses tanpa login) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route Private (Harus Login Dulu) */}
        <Route path="/" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />
        
        <Route path="/scan" element={
          <PrivateRoute>
            <ScannerPage />
          </PrivateRoute>
        } />

        <Route path="/asset/:barcode" element={
          <PrivateRoute>
            <DetailAssetPage />
          </PrivateRoute>
        } />

        <Route path="/history" element={
          <PrivateRoute>
            <HistoryPage />
          </PrivateRoute>
        } />

        <Route path="/risk/:id" element={
          <PrivateRoute>
            <RiskDetailPage />
          </PrivateRoute>
        } />

        <Route path="/treatment/:id" element={
          <PrivateRoute>
            <TreatmentDetailPage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;