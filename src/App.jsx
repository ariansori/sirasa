import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailAssetPage from './pages/DetailAssetPage';
import ScannerPage from './pages/ScannerPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScannerPage />} />
        
        {/* PENTING: Gunakan :barcode sebagai parameter */}
        <Route path="/asset/:barcode" element={<DetailAssetPage />} />
        
        {/* Placeholder halaman lain */}
        <Route path="/history" element={<div className="app-container" style={{padding:20}}>Halaman Riwayat</div>} />
      </Routes>
    </Router>
  );
}

export default App;