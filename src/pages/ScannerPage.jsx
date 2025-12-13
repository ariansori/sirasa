import React, { useState } from 'react';
import { X, ArrowRight, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      if (rawValue) {
        processCode(rawValue);
      }
    }
  };

  const processCode = (code) => {
    // Feedback getar
    if (navigator.vibrate) navigator.vibrate(200);

    // Cek apakah URL atau Kode Mentah
    if (code.includes('http')) {
        const parts = code.split('/');
        const assetId = parts[parts.length - 1]; 
        navigate(`/asset/${assetId}`);
    } else {
        navigate(`/asset/${code}`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCode(manualCode.trim());
    }
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:100}}>
      
      {/* Header */}
      <div style={{position:'absolute', top:0, left:0, right:0, zIndex:30, padding:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'}}>
        <button onClick={() => navigate(-1)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(4px)'}}>
          <X size={24} />
        </button>
        <div style={{color:'white', fontSize:'14px', fontWeight:600, textShadow:'0 1px 2px rgba(0,0,0,0.5)'}}>
            Scan Aset
        </div>
        <button onClick={() => setShowInput(!showInput)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(4px)'}}>
          <Keyboard size={20} />
        </button>
      </div>

      {/* SCANNER */}
      <Scanner 
        onScan={handleScan}
        onError={(err) => console.log(err)}
        // Format lengkap
        formats={['qr_code', 'code_128', 'code_39', 'codabar', 'ean_13']}
        components={{ audio: false, finder: false }}
        styles={{ container: { height: '100%', width: '100%' }, video: { objectFit: 'cover' } }}
        constraints={{ facingMode: 'environment' }}
        scanDelay={500} // Beri jeda antar scan agar tidak spam
      />

      {/* OVERLAY VISUAL (Kotak Fokus) */}
      {!showInput && (
        <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
            width:'320px', height:'140px', // Lebar untuk barcode panjang
            zIndex:10, pointerEvents:'none'
        }}>
            <div style={{position:'absolute', top:0, left:0, width:'30px', height:'30px', borderTop:'4px solid #3b82f6', borderLeft:'4px solid #3b82f6', borderRadius:'12px 0 0 0'}}></div>
            <div style={{position:'absolute', top:0, right:0, width:'30px', height:'30px', borderTop:'4px solid #3b82f6', borderRight:'4px solid #3b82f6', borderRadius:'0 12px 0 0'}}></div>
            <div style={{position:'absolute', bottom:0, left:0, width:'30px', height:'30px', borderBottom:'4px solid #3b82f6', borderLeft:'4px solid #3b82f6', borderRadius:'0 0 0 12px'}}></div>
            <div style={{position:'absolute', bottom:0, right:0, width:'30px', height:'30px', borderBottom:'4px solid #3b82f6', borderRight:'4px solid #3b82f6', borderRadius:'0 0 12px 0'}}></div>
            
            <p style={{position:'absolute', bottom:'-40px', width:'100%', textAlign:'center', color:'white', fontSize:'12px', textShadow:'0 1px 2px black'}}>
               Posisikan barcode di dalam kotak
            </p>
        </div>
      )}

      {/* INPUT MANUAL (Muncul jika tombol keyboard diklik) */}
      {showInput && (
        <div style={{
            position:'absolute', bottom:0, left:0, right:0, 
            background:'white', padding:'24px 20px 40px', 
            borderRadius:'24px 24px 0 0', zIndex:40,
            animation: 'slideUp 0.3s ease-out'
        }}>
           <h3 style={{margin:'0 0 12px', fontSize:'16px', color:'#1e293b'}}>Input Kode Manual</h3>
           <form onSubmit={handleManualSubmit} style={{display:'flex', gap:'10px'}}>
              <input 
                autoFocus
                type="text" 
                placeholder="Contoh: AST-123..." 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                    flex:1, padding:'12px 16px', borderRadius:'12px', 
                    border:'1px solid #e2e8f0', fontSize:'16px', outline:'none',
                    background:'#f8f9fa'
                }}
              />
              <button type="submit" style={{
                  background:'#3b82f6', color:'white', border:'none', 
                  borderRadius:'12px', width:'50px', display:'flex', 
                  alignItems:'center', justifyContent:'center', cursor:'pointer'
              }}>
                 <ArrowRight size={24} />
              </button>
           </form>
        </div>
      )}
      
      {/* Tambahkan CSS Animasi di file ini langsung */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ScannerPage;