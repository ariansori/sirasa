import React, { useState, useEffect, useRef } from 'react';
import { FileText, Clock, AlertTriangle, ShieldAlert, LogOut, User, X, ChevronDown } from 'lucide-react'; // Tambah Icon Baru
import { useNavigate } from 'react-router-dom';
import BottomNav from '../component/BottomNav';

const API_URL = import.meta.env.VITE_LINK_API_SIRASA;
const AUTO_LOGOUT_TIME = 15 * 60 * 1000; 

const HomePage = () => {
  const navigate = useNavigate();
  const logoutTimerRef = useRef(null);

  // State Data Utama
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, maintenance: 0, broken: 0, total: 0 });

  // State UI (Menu & Modal)
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Dropdown Menu
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Modal Profil

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // --- LOGOUT ---
  const handleLogout = (isAuto = false) => {
    if (isAuto || window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      navigate('/login', { replace: true });
    }
  };

  // --- AUTO LOGOUT & FETCH DATA (Code Lama - Tidak Berubah) ---
  useEffect(() => {
    const resetTimer = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(() => {
        alert("Sesi habis.");
        handleLogout(true);
      }, AUTO_LOGOUT_TIME);
    };
    ['click', 'scroll', 'keypress', 'touchstart'].forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => ['click', 'scroll', 'keypress', 'touchstart'].forEach(e => window.removeEventListener(e, resetTimer));
  }, []);

  useEffect(() => {
    // 1. Ambil Token & User Data dari LocalStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Fetch ke Endpoint Protected dengan Bearer Token
    if (token) {
      fetch(`${API_URL}/api/assets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // <--- Token disisipkan di sini
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        // Cek jika token expired (401 Unauthorized)
        if (res.status === 401) {
          // Opsional: Paksa logout jika token tidak valid lagi
          localStorage.removeItem('token');
          window.location.href = '/login'; 
          throw new Error("Sesi habis, silakan login ulang.");
        }
        return res.ok ? res.json() : [];
      })
      .then(res => {
        // Handle struktur data (kadang dibungkus .data)
        const data = Array.isArray(res) ? res : (res.data || []);
        setAssets(data);
        calculateStats(data);
      })
      .catch(err => {
        console.error("Gagal load aset:", err);
        setAssets([]);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false); // Stop loading jika tidak ada token
    }
  }, []);

  const calculateStats = (data) => {
    if (!Array.isArray(data)) return;
    setStats({
      active: data.filter(a => a.status?.name?.toLowerCase().includes('aktif')).length,
      maintenance: data.filter(a => a.status?.name?.toLowerCase().includes('pemeliharaan')).length,
      broken: data.filter(a => {
        const c = a.condition?.name?.toLowerCase() || '';
        return c.includes('rusak ringan') || c.includes('rusak berat');
      }).length,
      total: data.length
    });
  };

  const statCards = [
    { label: 'Total Aset', val: stats.total, icon: <FileText size={20}/>, bg: '#dbeafe', text: '#1e40af' },
    { label: 'Aset Aktif', val: stats.active, icon: <Clock size={20}/>, bg: '#dcfce7', text: '#166534' },
    { label: 'Dalam Perbaikan', val: stats.maintenance, icon: <ShieldAlert size={20}/>, bg: '#fef9c3', text: '#854d0e' },
    { label: 'Aset Rusak', val: stats.broken, icon: <AlertTriangle size={20}/>, bg: '#fee2e2', text: '#991b1b' },
  ];

  return (
    <div className="app-container" style={{position:'relative'}}> {/* Relative untuk Modal */}
      
      {/* HEADER SECTION */}
      <div className="header-hero">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
          <div>
            <h1 style={{fontSize:'18px', margin:0, fontWeight:700, lineHeight:'1.4'}}>
              Hi, {user ? user.name.split(' ')[0] : 'User'} <br/>
              <span style={{fontSize:'14px', fontWeight:400}}>{user ? user.role : 'Selamat Datang'}</span>
            </h1>
            <p style={{margin:'6px 0 0', opacity:0.9, fontSize:'12px', background:'rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:'10px', display:'inline-block'}}>{today}</p>
          </div>

          {/* AREA PROFIL & DROPDOWN */}
          <div style={{position:'relative'}}>
            {/* Tombol Trigger Dropdown */}
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', background:'rgba(255,255,255,0.15)', padding:'4px 8px 4px 4px', borderRadius:'30px', border:'1px solid rgba(255,255,255,0.3)'}}
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff`} 
                alt="Profile" 
                style={{width:'38px', height:'38px', borderRadius:'50%', background:'white'}} 
              />
              <ChevronDown size={16} color="white" />
            </div>

            {/* DROPDOWN MENU */}
            {isMenuOpen && (
              <div style={{
                position: 'absolute', top: '50px', right: 0,
                background: 'white', borderRadius: '12px', width: '160px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 50, overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div 
                  onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                  style={{padding:'12px 16px', fontSize:'13px', color:'#334155', borderBottom:'1px solid #f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
                >
                  <User size={16} className="text-blue-500" /> Profil Saya
                </div>
                <div 
                  onClick={() => handleLogout(false)}
                  style={{padding:'12px 16px', fontSize:'13px', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontWeight:600}}
                >
                  <LogOut size={16} /> Keluar
                </div>
              </div>
            )}
          </div>
        </div>
        <p style={{fontSize:'13px', opacity:0.9}}>{user?.department || 'Sistem Informasi Risiko dan Aset'}</p>
      </div>

      {/* STATS GRID */}
      <div style={{padding:'0 20px', marginTop:'-40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100px', margin:0}}>
            <div style={{width:'36px', height:'36px', borderRadius:'50%', background:s.bg, color:s.text, display:'flex', alignItems:'center', justifyContent:'center'}}>{s.icon}</div>
            <div>
              <p style={{fontSize:'11px', color:'#64748b', margin:0, fontWeight:600}}>{s.label}</p>
              <h3 style={{fontSize:'22px', margin:'2px 0 0', color:'#1e293b'}}>{loading ? '...' : s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* LIST ASET */}
      <div style={{padding:'24px 20px'}}>
        <h3 style={{fontSize:'16px', margin:'0 0 16px', color:'#1e293b'}}>Aset Terbaru</h3>
        {loading ? <p className="text-center" style={{fontSize:'12px'}}>Memuat...</p> : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {assets.slice(0, 5).map((asset, index) => (
              <div key={index} className="card" onClick={() => navigate(`/asset/${asset.barcode}`)} style={{cursor:'pointer', margin:0}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <h4 style={{margin:0, fontSize:'14px', color:'#1e293b'}}>{asset.name}</h4>
                    <p style={{margin:'4px 0', fontSize:'11px', color:'#64748b'}}>{asset.barcode}</p>
                  </div>
                  <span className={`badge ${asset.status?.name?.toLowerCase().includes('aktif') ? 'badge-active' : 'badge-process'}`}>{asset.status?.name || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {/* --- MODAL PROFIL --- */}
      {isProfileOpen && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%', 
          background:'rgba(0,0,0,0.5)', zIndex:100, 
          display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
        }}>
          <div style={{
            background:'white', width:'100%', maxWidth:'340px', borderRadius:'24px', 
            padding:'24px', position:'relative', boxShadow:'0 10px 40px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setIsProfileOpen(false)}
              style={{position:'absolute', top:'16px', right:'16px', background:'#f1f5f9', border:'none', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}
            >
              <X size={18} color="#64748b" />
            </button>

            {/* Header Profil */}
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&color=fff&size=128`} 
                alt="Big Profile" 
                style={{width:'80px', height:'80px', borderRadius:'50%', border:'4px solid #f8f9fa', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}} 
              />
              <h2 style={{fontSize:'18px', fontWeight:700, margin:'12px 0 4px', color:'#1e293b'}}>{user?.name}</h2>
              <span style={{background:'#dbeafe', color:'#1e40af', padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:600}}>{user?.role?.replace('_', ' ').toUpperCase()}</span>
            </div>

            {/* Detail Data User */}
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {[
                { label: 'NIP', value: user?.nip },
                { label: 'Jabatan', value: user?.position },
                { label: 'Unit Kerja', value: user?.department },
                { label: 'Email', value: user?.email },
                { label: 'No. HP', value: user?.phone_number }
              ].map((item, i) => (
                <div key={i} style={{display:'flex', flexDirection:'column', borderBottom:'1px solid #f8f9fa', paddingBottom:'8px'}}>
                  <span style={{fontSize:'11px', color:'#94a3b8', fontWeight:600}}>{item.label}</span>
                  <span style={{fontSize:'13px', color:'#334155', fontWeight:500}}>{item.value || '-'}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsProfileOpen(false)}
              style={{marginTop:'24px', width:'100%', padding:'12px', background:'#3b82f6', color:'white', border:'none', borderRadius:'12px', fontWeight:600, cursor:'pointer'}}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;