import React from 'react';
import { X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();

  const handleScan = (result) => {
    if (result) {
      const scannedBarcode = result[0]?.rawValue;
      if (scannedBarcode) {
        // PENTING: Arahkan ke halaman PublicAssetPage dengan parameter barcode
        navigate(`/asset/${scannedBarcode}`);
      }
    }
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:100}}>
      
      {/* Tombol Close */}
      <div style={{position:'absolute', top:0, left:0, right:0, zIndex:20, padding:'24px', textAlign:'center', color:'white'}}>
        <button onClick={() => navigate(-1)} style={{position:'absolute', left:'24px', background:'none', border:'none', color:'white', cursor:'pointer'}}>
          <X size={28} />
        </button>
        <h2 style={{margin:0, fontSize:'18px', fontWeight:600}}>Scan Barcode</h2>
      </div>

      {/* Scanner */}
      <Scanner 
        onScan={handleScan}
        onError={(err) => console.log(err)}
        components={{ audio: false, finder: false }}
        styles={{ container: { height: '100%' } }}
      />

      {/* Overlay Visual Kotak */}
      <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
          width:'250px', height:'250px', border:'2px solid rgba(255,255,255,0.5)', borderRadius:'16px', pointerEvents:'none'
      }}></div>

    </div>
  );
};

export default ScannerPage;