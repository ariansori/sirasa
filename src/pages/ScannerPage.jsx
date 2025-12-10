import React from 'react';
import { X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();

  const handleScan = (detectedCodes) => {
    // Library ini mengembalikan array, kita ambil yang pertama
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (code) {
        // Efek getar sedikit jika HP support (Feedback user)
        if (navigator.vibrate) navigator.vibrate(200);
        
        // Pindah ke halaman detail aset
        navigate(`/asset/${code}`);
      }
    }
  };

  const handleError = (err) => {
    console.error("Error Kamera:", err);
    // Jangan alert error terus menerus agar tidak mengganggu
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:100}}>
      
      {/* Header Tombol Close */}
      <div style={{position:'absolute', top:0, left:0, right:0, zIndex:20, padding:'24px', textAlign:'center', color:'white', background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'}}>
        <button onClick={() => navigate(-1)} style={{position:'absolute', left:'24px', background:'none', border:'none', color:'white', cursor:'pointer'}}>
          <X size={28} />
        </button>
        <h2 style={{margin:0, fontSize:'18px', fontWeight:600}}>Scan Barcode</h2>
        <p style={{fontSize:'12px', opacity:0.9, margin:'4px 0 0'}}>Arahkan kamera ke label aset</p>
      </div>

      {/* KOMPONEN SCANNER UTAMA */}
      <Scanner 
        onScan={handleScan}
        onError={handleError}
        // 👇 INI BAGIAN PENTINGNYA: Aktifkan semua jenis barcode umum
        formats={[
          'qr_code', 
          'code_128', // Paling umum untuk aset kantor
          'code_39',  // Umum untuk inventaris lama
          'code_93', 
          'ean_13',   // Produk retail
          'ean_8', 
          'upc_a',
          'codabar'
        ]}
        components={{ 
          audio: false, // Matikan bunyi beep bawaan (kita pakai vibrate)
          finder: false // Kita pakai overlay manual di bawah agar lebih bagus
        }}
        styles={{ 
          container: { height: '100%', width: '100%' },
          video: { objectFit: 'cover' }
        }}
        // Gunakan kamera belakang
        constraints={{ facingMode: 'environment' }}
      />

      {/* --- OVERLAY VISUAL (Kotak Fokus) --- */}
      <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
          width:'280px', height:'180px', // Sedikit persegi panjang agar pas untuk barcode panjang
          zIndex:10, pointerEvents:'none'
      }}>
          {/* Garis Pojok Biru */}
          <div style={{position:'absolute', top:0, left:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'16px 0 0 0'}}></div>
          <div style={{position:'absolute', top:0, right:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 16px 0 0'}}></div>
          <div style={{position:'absolute', bottom:0, left:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'0 0 0 16px'}}></div>
          <div style={{position:'absolute', bottom:0, right:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 0 16px 0'}}></div>
          
          {/* Garis Merah Scanning (Animasi) */}
          <div style={{
            position: 'absolute', top: '10%', left: '5%', right: '5%', height: '2px', 
            background: 'rgba(239, 68, 68, 0.8)', boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
            animation: 'scanMove 2s infinite linear'
          }}></div>
      </div>

      {/* Tambahkan CSS Animasi Garis */}
      <style>{`
        @keyframes scanMove {
          0% { top: 10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>

    </div>
  );
};

export default ScannerPage;