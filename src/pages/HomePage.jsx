import React, { useState, useEffect } from 'react';
import { FileText, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../component/BottomNav';

// URL API Backend
const API_URL = "https://asset-risk-management.vercel.app";

const HomePage = () => {
  const navigate = useNavigate();
  
  // State Data
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, maintenance: 0, broken: 0, total: 0 });

  // 1. Setup Tanggal Hari Ini
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // 2. Load Data API (Menggunakan Endpoint PUBLIC)
  useEffect(() => {
    // 👇 PERUBAHAN DI SINI: Menggunakan /api/assets/public agar tidak kena 401
    fetch(`${API_URL}/api/assets/public`) 
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data public");
        return res.json();
      })
      .then(response => {
        // Cek struktur data, kadang API membungkus array di dalam properti .data
        const dataAset = Array.isArray(response) ? response : (response.data || []);
        
        setAssets(dataAset);
        calculateStats(dataAset); // Hitung statistik
      })
      .catch(err => {
        console.error("Gagal load dashboard:", err);
        setAssets([]); // Set kosong jika error agar aplikasi tidak crash
      })
      .finally(() => setLoading(false));

  }, []);

  // 3. Rumus Hitung Statistik dari Data Real
  const calculateStats = (data) => {
    if (!Array.isArray(data)) return;

    // Filter berdasarkan nama status (sesuaikan string-nya dengan database Anda)
    const active = data.filter(a => a.status?.name?.toLowerCase().includes('aktif')).length;
    const maintenance = data.filter(a => a.status?.name?.toLowerCase().includes('perbaikan')).length;
    const broken = data.filter(a => a.status?.name?.toLowerCase().includes('rusak') || a.status?.name?.toLowerCase().includes('hilang')).length;
    
    setStats({
      active,
      maintenance,
      broken,
      total: data.length
    });
  };

  // Konfigurasi Kartu Statistik
  const statCards = [
    { label: 'Total Aset', val: stats.total, icon: <FileText size={20}/>, bg: '#dbeafe', text: '#1e40af' },
    { label: 'Aset Aktif', val: stats.active, icon: <Clock size={20}/>, bg: '#dcfce7', text: '#166534' },
    { label: 'Dalam Perbaikan', val: stats.maintenance, icon: <ShieldAlert size={20}/>, bg: '#fef9c3', text: '#854d0e' },
    { label: 'Aset Rusak', val: stats.broken, icon: <AlertTriangle size={20}/>, bg: '#fee2e2', text: '#991b1b' },
  ];

  return (
    <div className="app-container">
      
      {/* HEADER SECTION */}
      <div className="header-hero">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
          <div>
            <h1 style={{fontSize:'18px', margin:0, fontWeight:700, lineHeight:'1.4'}}>
              Hi, Guest <br/>
              <span style={{fontSize:'14px', fontWeight:400}}>Selamat Datang di SIRASA</span>
            </h1>
            <p style={{margin:'6px 0 0', opacity:0.9, fontSize:'12px', background:'rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:'10px', display:'inline-block'}}>
              {today}
            </p>
          </div>
          {/* Avatar Default */}
          <img 
            src="https://ui-avatars.com/api/?name=Guest&background=random" 
            alt="Profile" 
            style={{width:'48px', height:'48px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.5)', background:'white'}} 
          />
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{padding:'0 20px', marginTop:'-40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100px', margin:0}}>
            <div style={{width:'36px', height:'36px', borderRadius:'50%', background:s.bg, color:s.text, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {s.icon}
            </div>
            <div>
              <p style={{fontSize:'11px', color:'#64748b', margin:0, fontWeight:600}}>{s.label}</p>
              <h3 style={{fontSize:'22px', margin:'2px 0 0', color:'#1e293b'}}>
                {loading ? '...' : s.val}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* LIST ASET TERBARU */}
      <div style={{padding:'24px 20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <h3 style={{fontSize:'16px', margin:0, color:'#1e293b'}}>Aset Terbaru</h3>
        </div>
        
        {loading ? <p className="text-center" style={{fontSize:'12px', color:'#64748b'}}>Memuat data...</p> : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {/* Tampilkan 5 data teratas saja */}
            {assets.slice(0, 5).map((asset, index) => (
              <div key={index} className="card" onClick={() => navigate(`/asset/${asset.barcode}`)} style={{cursor:'pointer', margin:0}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <h4 style={{margin:0, fontSize:'14px', color:'#1e293b'}}>{asset.name}</h4>
                    <p style={{margin:'4px 0', fontSize:'11px', color:'#64748b'}}>Barcode: {asset.barcode}</p>
                    <p style={{margin:0, fontSize:'11px', color:'#94a3b8'}}>{asset.lokasi || 'Tidak ada lokasi'}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className={`badge ${
                        asset.status?.name?.toLowerCase().includes('aktif') ? 'badge-active' : 
                        asset.status?.name?.toLowerCase().includes('rusak') ? 'badge-danger' : 'badge-process'
                    }`}>
                      {asset.status?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {assets.length === 0 && (
              <p style={{textAlign:'center', fontSize:'12px', color:'#94a3b8'}}>Belum ada data aset.</p>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;