import { Routes, Route } from 'react-router-dom';
import PublicAssetPage from './pages/PublicAssetPage'; // Import halaman Anda

function App() {
  return (
    <Routes>
      {/* Rute utama akan menangkap parameter barcode */}
      <Route 
        path="/public/asset/:barcode" 
        element={<PublicAssetPage />} 
      />
      
      {/* Tambahkan rute "Home" sederhana */}
      <Route 
        path="/" 
        element={<div>Silakan scan QR Code aset.</div>} 
      />

      {/* Rute fallback jika URL tidak cocok */}
      <Route 
        path="*" 
        element={<div>404: Halaman Tidak Ditemukan</div>} 
      />
    </Routes>
  );
}

export default App;