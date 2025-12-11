import React from 'react';
import { X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      
      if (rawValue) {
        // --- LOGIKA PINTAR ---
        // 1. Cek apakah ini URL (QR Code Public)
        if (rawValue.includes('http') || rawValue.includes('vercel.app')) {
            // Ambil bagian akhir URL saja (ID Asetnya)
            // Contoh: https://.../public/asset/AST-123 -> Ambil AST-123
            const parts = rawValue.split('/');
            const assetId = parts[parts.length - 1]; // Ambil bagian paling belakang
            navigate(`/asset/${assetId}`);
        } 
        // 2. Jika bukan URL, berarti ini Code 128 (ID Murni)
        else {
            // Langsung navigate karena isinya pasti "AST-xxxx"
            navigate(`/asset/${rawValue}`);
        }

        // Feedback Getar
        if (navigator.vibrate) navigator.vibrate(200);
      }
    }
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:100}}>
      
      <div style={{position:'absolute', top:0, left:0, right:0, zIndex:20, padding:'24px', textAlign:'center', color:'white', background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'}}>
        <button onClick={() => navigate(-1)} style={{position:'absolute', left:'24px', background:'none', border:'none', color:'white', cursor:'pointer'}}>
          <X size={28} />
        </button>
        <h2 style={{margin:0, fontSize:'18px', fontWeight:600}}>Scan Barcode</h2>
        <p style={{fontSize:'12px', opacity:0.9, margin:'4px 0 0'}}>Mendukung QR Code & Barcode Aset (128)</p>
      </div>

      <Scanner 
        onScan={handleScan}
        onError={(err) => console.error(err)}
        // AKTIFKAN SEMUA FORMAT AGAR CODE 128 TERBACA
        formats={[
          'qr_code', 
          'code_128', 
          'code_39', 
          'codabar'
        ]}
        components={{ audio: false, finder: false }}
        styles={{ container: { height: '100%', width: '100%' }, video: { objectFit: 'cover' } }}
        constraints={{ facingMode: 'environment' }}
      />

      {/* Overlay Visual */}
      <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
          width:'280px', height:'150px', // Agak pipih agar cocok untuk barcode panjang
          zIndex:10, pointerEvents:'none'
      }}>
          {/* Garis Pojok */}
          <div style={{position:'absolute', top:0, left:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'16px 0 0 0'}}></div>
          <div style={{position:'absolute', top:0, right:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 16px 0 0'}}></div>
          <div style={{position:'absolute', bottom:0, left:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'0 0 0 16px'}}></div>
          <div style={{position:'absolute', bottom:0, right:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 0 16px 0'}}></div>
          
          {/* Laser Merah */}
          <div style={{
            position: 'absolute', top: '50%', left: '5%', right: '5%', height: '2px', 
            background: 'rgba(239, 68, 68, 0.8)', boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
          }}></div>
      </div>

    </div>
  );
};

export default ScannerPage;