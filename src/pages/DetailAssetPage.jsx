import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertTriangle, Calendar, Activity, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// URL API
const API_URL = import.meta.env.VITE_LINK_API_SIRASA; 

// Helper Warna Badge Status
const getBadgeClass = (statusName) => {
  if (!statusName) return 'badge-default';
  const s = statusName.toLowerCase();
  if (s.includes('aktif') && !s.includes('tidak')) return 'badge-active'; 
  if (s.includes('rusak') || s.includes('hilang')) return 'badge-danger'; 
  return 'badge-process'; 
};

// Helper Format Tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const DetailAssetPage = () => {
  const navigate = useNavigate();
  const { barcode } = useParams();

  // STATE
  const [asset, setAsset] = useState(null);
  const [risks, setRisks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Fetch Data (Full Private API)
  useEffect(() => {
    if (barcode) {
      setLoading(true);

      // 1. AMBIL TOKEN & BUAT HEADER (Wajib di awal)
      const token = localStorage.getItem('token');
      
      // Jika token tidak ada, stop (atau redirect)
      if (!token) {
        setError("Akses ditolak. Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }

      const authHeaders = { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      };

      // 2. Fetch Data Aset (PRIVATE - Pakai Header)
      fetch(`${API_URL}/api/assets/barcode/${barcode}`, { headers: authHeaders })
        .then(res => {
          if (res.status === 401) throw new Error('Sesi habis. Silakan login kembali.');
          if (res.status === 404) throw new Error('Aset tidak ditemukan.');
          if (!res.ok) throw new Error('Gagal mengambil data.');
          return res.json();
        })
        .then(data => {
          // Normalisasi data
          const assetData = data.data ? data.data : data;
          setAsset(assetData);
          setError(null);

          // 3. Fetch Data Tambahan (Pakai authHeaders yang sama)
          if (assetData?.id) {
             
             // A. Ambil Risiko
             fetch(`${API_URL}/api/risks`, { headers: authHeaders })
               .then(r => r.ok ? r.json() : [])
               .then(riskData => {
                  const raw = Array.isArray(riskData) ? riskData : (riskData.data || []);
                  setRisks(raw.filter(r => r.asset_id === assetData.id && r.approval_status === 'approved'));
               })
               .catch(console.error);

             // B. Ambil Maintenance (Jadwal & Riwayat)
             fetch(`${API_URL}/api/maintenance`, { headers: authHeaders })
               .then(r => r.ok ? r.json() : [])
               .then(maintData => {
                  const raw = Array.isArray(maintData) ? maintData : (maintData.data || []);
                  const myMaint = raw.filter(m => m.asset_id === assetData.id);
                  
                  setSchedules(myMaint.filter(m => !m.completion_date && m.scheduled_date));
                  setHistory(myMaint.filter(m => m.completion_date));
               })
               .catch(console.error);
          }
        })
        .catch(err => {
          setError(err.message);
          setAsset(null);
          // Opsional: Jika error 401, redirect ke login
          if (err.message.includes('Sesi habis')) {
             localStorage.removeItem('token');
             navigate('/login');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [barcode]);

  // --- Tampilan Loading / Error ---
  if (loading) return <div className="app-container" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>Memuat Detail...</div>;
  
  if (error) return (
    <div className="app-container">
      <div className="page-header">
         <button onClick={() => navigate(-1)} className="btn-back"><ChevronLeft /></button>
         <span className="page-title">Error</span>
      </div>
      <div style={{padding:'20px', textAlign:'center', marginTop:'50px'}}>
        <p style={{color:'#ef4444', fontWeight:'bold'}}>{error}</p>
        <button onClick={() => navigate('/')} style={{marginTop:'20px', padding:'10px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'8px'}}>Kembali ke Home</button>
      </div>
    </div>
  );

  // --- Tampilan Utama ---
  return (
    <div className="app-container" style={{background:'#f8f9fa', minHeight:'100vh', paddingBottom:'40px'}}>
      
      {/* Header Sticky */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back"><ChevronLeft /></button>
        <span className="page-title">Detail Aset</span>
      </div>

      <div style={{padding:'20px'}}>
        
        {/* Judul Besar & Update Terakhir */}
        <div style={{marginBottom:'20px'}}>
          <h2 style={{fontSize:'16px', margin:'0 0 6px', textTransform:'uppercase', color:'#1e293b', lineHeight:'1.4', fontWeight:'bold'}}>
            {asset?.name || 'Nama Aset Tidak Tersedia'}
          </h2>
          <p style={{fontSize:'12px', color:'#64748b', margin:0}}>
            {asset?.barcode} • {asset?.updated_at ? formatDate(asset.updated_at) : 'Data lama'}
          </p>
        </div>

        {/* KARTU 1: Informasi Utama */}
        <div className="card">
          <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#0f172a', fontWeight:'700', borderLeft:'4px solid #3b82f6', paddingLeft:'8px'}}>Informasi Utama</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            
            <div><p className="text-label">Merk / Tipe</p><p className="text-value">{asset?.merk_type || '-'}</p></div>
            <div><p className="text-label">Kategori</p><p className="text-value">{asset?.category?.name || '-'}</p></div>
            <div><p className="text-label">Nomor Serial</p><p className="text-value">{asset?.serial_number || '-'}</p></div>
            <div><p className="text-label">Sub-Kategori</p><p className="text-value">{asset?.sub_category?.name || '-'}</p></div>
            <div><p className="text-label">Lokasi</p><p className="text-value">{asset?.lokasi || '-'}</p></div>
            <div><p className="text-label">Departemen</p><p className="text-value">{asset?.department?.name || '-'}</p></div>
            <div><p className="text-label">Vendor</p><p className="text-value">{asset?.vendor || '-'}</p></div>

            <div>
              <p className="text-label">Status</p>
              <span className={`badge ${getBadgeClass(asset?.status?.name)}`}>
                {asset?.status?.name || 'Unknown'}
              </span>
            </div>
            
             <div>
              <p className="text-label">Kondisi</p>
              <span className="text-value" style={{fontWeight:600}}>
                {asset?.condition?.name || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* KARTU 2: Siklus Hidup */}
        <div className="card">
          <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#0f172a', fontWeight:'700'}}>Siklus Hidup</h3>
          <div style={{display:'flex', flexDirection:'column'}}>
            
            {/* Timeline: Pengadaan */}
            <div style={{display:'flex', gap:'12px', position:'relative', paddingBottom:'24px'}}>
              <div style={{position:'absolute', left:'5px', top:'10px', bottom:0, width:'2px', background:'#e2e8f0'}}></div>
              <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#22c55e', marginTop:'4px', flexShrink:0, zIndex:1}}></div>
              <span style={{fontSize:'13px', color:'#334155', fontWeight:'600'}}>
                Pengadaan (Terdaftar) <br/>
                <span style={{fontSize:'11px', color:'#94a3b8', fontWeight:'400'}}>
                  {asset?.created_at ? formatDate(asset.created_at) : '-'}
                </span>
              </span>
            </div>

            {/* Timeline: Update Terakhir */}
            <div style={{display:'flex', gap:'12px', position:'relative'}}>
              <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#3b82f6', marginTop:'4px', flexShrink:0, zIndex:1}}></div>
              <span style={{fontSize:'13px', color:'#334155', fontWeight:'600'}}>
                Update Terakhir <br/>
                <span style={{fontSize:'11px', color:'#94a3b8', fontWeight:'400'}}>
                   {asset?.updated_at ? formatDate(asset.updated_at) : '-'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* KARTU 3: Keterkaitan Risiko */}
        <div className="card">
           <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#c2410c', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px'}}>
             <AlertTriangle size={16}/> Keterkaitan Risiko
           </h3>
           
           {risks.length > 0 ? risks.map((r, i) => (
             <div key={i} style={{background:'#fff7ed', padding:'12px', borderRadius:'10px', border:'1px solid #ffedd5', marginBottom:'10px'}}>
               <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                 <span style={{fontSize:'10px', fontWeight:'bold', color:'#c2410c', background:'white', padding:'2px 6px', borderRadius:'4px', border:'1px solid #fed7aa'}}>{r.risk_code}</span>
                 <span style={{fontSize:'10px', color:'#9a3412'}}>{formatDate(r.created_at)}</span>
               </div>
               <p style={{fontSize:'12px', fontWeight:'600', color:'#431407', margin:'0 0 4px'}}>{r.description}</p>
               <p style={{fontSize:'11px', color:'#7c2d12', margin:0}}>Dampak: {r.impact}</p>
             </div>
           )) : (
             <div style={{textAlign:'center', padding:'12px', background:'#f8f9fa', borderRadius:'10px', border:'1px dashed #e2e8f0'}}>
                <p style={{fontSize:'12px', color:'#94a3b8', margin:0}}>Tidak ada risiko terkait.</p>
             </div>
           )}
        </div>

        {/* KARTU 4: Jadwal Pemeliharaan */}
        <div className="card">
           <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#2563eb', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px'}}>
             <Calendar size={16}/> Jadwal Pemeliharaan
           </h3>
           
           {schedules.length > 0 ? schedules.map((s, i) => (
             <div key={i} style={{display:'flex', gap:'12px', background:'#eff6ff', padding:'12px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #dbeafe'}}>
                <div style={{background:'white', padding:'6px 12px', borderRadius:'8px', textAlign:'center', minWidth:'50px'}}>
                   <div style={{fontSize:'10px', color:'#94a3b8', fontWeight:'bold', textTransform:'uppercase'}}>{new Date(s.scheduled_date).toLocaleString('id-ID', {month:'short'})}</div>
                   <div style={{fontSize:'18px', color:'#2563eb', fontWeight:'800', lineHeight:'1'}}>{new Date(s.scheduled_date).getDate()}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
                  <div style={{fontSize:'12px', fontWeight:'bold', color:'#1e3a8a'}}>{s.notes || 'Pemeliharaan Rutin'}</div>
                  <div style={{fontSize:'11px', color:'#3b82f6', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px'}}>
                    <Clock size={12}/> Akan Datang
                  </div>
                </div>
             </div>
           )) : (
             <div style={{textAlign:'center', padding:'12px', background:'#f8f9fa', borderRadius:'10px', border:'1px dashed #e2e8f0'}}>
                <p style={{fontSize:'12px', color:'#94a3b8', margin:0}}>Belum ada jadwal.</p>
             </div>
           )}
        </div>

        {/* KARTU 5: Riwayat Aktivitas */}
        <div className="card">
           <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#7e22ce', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px'}}>
             <Activity size={16}/> Riwayat Aktivitas
           </h3>
           
           {history.length > 0 ? (
             <div style={{marginLeft:'6px'}}>
                {history.map((h, i) => (
                   <div key={i} style={{position:'relative', paddingLeft:'24px', paddingBottom: i === history.length-1 ? 0 : '24px'}}>
                      {i !== history.length - 1 && <div style={{position:'absolute', left:'5px', top:'10px', bottom:0, width:'2px', background:'#e2e8f0'}}></div>}
                      <div style={{position:'absolute', left:0, top:'4px', width:'12px', height:'12px', borderRadius:'50%', background:'#22c55e', zIndex:1}}></div>
                      <p style={{fontSize:'12px', fontWeight:'bold', color:'#333', margin:0}}>{h.notes || 'Pemeliharaan Selesai'}</p>
                      <p style={{fontSize:'11px', color:'#64748b', margin:'2px 0 0'}}>
                          {formatDate(h.completion_date)} • <span style={{color:'#166534', fontWeight:'600'}}>{h.status}</span>
                      </p>
                   </div>
                ))}
             </div>
           ) : (
             <div style={{textAlign:'center', padding:'12px', background:'#f8f9fa', borderRadius:'10px', border:'1px dashed #e2e8f0'}}>
                <p style={{fontSize:'12px', color:'#94a3b8', margin:0}}>Belum ada riwayat tambahan.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default DetailAssetPage;