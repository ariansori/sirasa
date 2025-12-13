import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Keyboard, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      if (rawValue) processCode(rawValue);
    }
  };

  const processCode = (code) => {
    if (navigator.vibrate) navigator.vibrate(200);

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

  // --- STYLE TOMBOL "JUMBO" ---
  const buttonStyle = {
    background: 'rgba(0, 0, 0, 0.75)',    // Hitam Pekat Transparan
    border: '2px solid rgba(255, 255, 255, 0.8)', // Garis Putih Tebal
    borderRadius: '50%', 
    width: '56px',      // UKURAN BESAR
    height: '56px',     // UKURAN BESAR
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    backdropFilter: 'blur(4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', // Bayangan agar ngambang
    zIndex: 50
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:100}}>
      
      {/* Header Bar */}
      <div style={{
          position:'absolute', top:0, left:0, right:0, zIndex:30, 
          padding:'24px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', 
          background:'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)' 
      }}>
        
        {/* Tombol KEMBALI (Ganti Icon Panah Besar) */}
        <button onClick={() => navigate(-1)} style={buttonStyle}>
          <ArrowLeft size={32} color="#ffffff" strokeWidth={3} />
        </button>

        {/* Judul di Tengah */}
        <div style={{
            color:'white', fontSize:'18px', fontWeight:800, 
            textShadow:'0 1px 2px black', letterSpacing:'1px',
            background:'#3b82f6', padding:'4px 12px', borderRadius:'20px'
        }}>
            SCANNER
        </div>

        {/* Tombol KEYBOARD (Input Manual) */}
        <button onClick={() => setShowInput(!showInput)} style={buttonStyle}>
          {showInput ? (
             <X size={32} color="#ef4444" strokeWidth={3} /> // Icon Silang Merah jika input aktif
          ) : (
             <Keyboard size={32} color="#ffffff" strokeWidth={3} /> // Icon Keyboard Putih
          )}
        </button>
      </div>

      {/* COMPONENT SCANNER */}
      <Scanner 
        onScan={handleScan}
        onError={(err) => console.log(err)}
        formats={['qr_code', 'code_128', 'code_39', 'codabar', 'ean_13']}
        components={{ audio: false, finder: false }}
        styles={{ container: { height: '100%', width: '100%' }, video: { objectFit: 'cover' } }}
        constraints={{ facingMode: 'environment' }}
        scanDelay={500}
      />

      {/* OVERLAY VISUAL (KOTAK FOKUS) */}
      {!showInput && (
        <div style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
            width:'350px', height:'140px', 
            zIndex:10, pointerEvents:'none'
        }}>
            {/* Sudut-sudut Tebal */}
            <div style={{position:'absolute', top:0, left:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'16px 0 0 0'}}></div>
            <div style={{position:'absolute', top:0, right:0, width:'40px', height:'40px', borderTop:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 16px 0 0'}}></div>
            <div style={{position:'absolute', bottom:0, left:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderLeft:'6px solid #3b82f6', borderRadius:'0 0 0 16px'}}></div>
            <div style={{position:'absolute', bottom:0, right:0, width:'40px', height:'40px', borderBottom:'6px solid #3b82f6', borderRight:'6px solid #3b82f6', borderRadius:'0 0 16px 0'}}></div>
            
            <p style={{
                position:'absolute', bottom:'-60px', width:'100%', textAlign:'center', 
                color:'white', fontSize:'14px', fontWeight:'600', 
                textShadow:'0 2px 4px black', padding:'4px 0', borderRadius:'8px'
            }}>
               Arahkan kamera ke barcode
            </p>
        </div>
      )}

      {/* PANEL INPUT MANUAL */}
      {showInput && (
        <div style={{
            position:'absolute', bottom:0, left:0, right:0, 
            background:'white', padding:'30px 24px 50px', 
            borderRadius:'24px 24px 0 0', zIndex:40,
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
        }}>
           <h3 style={{margin:'0 0 16px', fontSize:'18px', color:'#1e293b', fontWeight:400}}>Ketik Kode Aset</h3>
           <form onSubmit={handleManualSubmit} style={{display:'flex', gap:'12px'}}>
              <input 
                autoFocus
                type="text" 
                placeholder="Contoh: AST-123..." 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                    flex:1, padding:'16px 20px', borderRadius:'16px', 
                    border:'2px solid #e2e8f0', fontSize:'18px', outline:'none',
                    background:'#f8f9fa', color:'#334155', fontWeight:'300'
                }}
              />
              <button type="submit" style={{
                  background:'#3b82f6', color:'white', border:'none', 
                  borderRadius:'16px', width:'64px', display:'flex', 
                  alignItems:'center', justifyContent:'center', cursor:'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}>
                 <ArrowRight size={32} strokeWidth={3} />
              </button>
           </form>
        </div>
      )}
      
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