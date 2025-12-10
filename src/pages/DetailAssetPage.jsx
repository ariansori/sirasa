import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// URL API
const API_URL = "https://asset-risk-management.vercel.app"; 

// Helper Warna Badge Status
const getBadgeClass = (statusName) => {
  if (!statusName) return 'badge-default';
  const s = statusName.toLowerCase();
  if (s.includes('aktif') && !s.includes('tidak')) return 'badge-active'; // Hijau
  if (s.includes('rusak') || s.includes('hilang')) return 'badge-danger'; // Merah
  return 'badge-process'; // Biru/Kuning (Maintenance/Lainnya)
};

const DetailAssetPage = () => {
  const navigate = useNavigate();
  const { barcode } = useParams(); // Menggunakan parameter barcode dari URL

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Data API Real
  useEffect(() => {
    if (barcode) {
      setLoading(true);
      fetch(`${API_URL}/api/assets/public/barcode/${barcode}`)
        .then(res => {
          if (res.status === 404) throw new Error('Aset tidak ditemukan.');
          if (!res.ok) throw new Error('Gagal mengambil data.');
          return res.json();
        })
        .then(data => {
          setAsset(data);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setAsset(null);
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

  // --- Tampilan Utama Sesuai Desain ---
  return (
    <div className="app-container" style={{background:'#f8f9fa'}}>
      {/* Header Sticky */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back"><ChevronLeft /></button>
        <span className="page-title">Detail Aset</span>
      </div>

      <div style={{padding:'20px'}}>
        {/* Judul Besar & Update Terakhir */}
        <div style={{marginBottom:'20px'}}>
          <h2 style={{fontSize:'16px', margin:'0 0 6px', textTransform:'uppercase', color:'#1e293b', lineHeight:'1.4'}}>
            {asset?.name || 'Nama Aset Tidak Tersedia'}
          </h2>
          <p style={{fontSize:'12px', color:'#64748b', margin:0}}>
            {asset?.barcode} • {asset?.updated_at ? new Date(asset.updated_at).toLocaleDateString('id-ID') : 'Data lama'}
          </p>
        </div>

        {/* KARTU 1: Informasi Utama */}
        <div className="card">
          <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#0f172a', fontWeight:700}}>Informasi Utama</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            
            {/* Field Data (Mapping API ke UI) */}
            <div><p className="text-label">Merk / Tipe</p><p className="text-value">{asset?.merk_type || '-'}</p></div>
            <div><p className="text-label">Kategori</p><p className="text-value">{asset?.category?.name || '-'}</p></div>
            <div><p className="text-label">Nomor Serial</p><p className="text-value">{asset?.serial_number || '-'}</p></div>
            <div><p className="text-label">Sub-Kategori</p><p className="text-value">{asset?.sub_category?.name || '-'}</p></div>
            <div><p className="text-label">Lokasi</p><p className="text-value">{asset?.lokasi || '-'}</p></div>
            <div><p className="text-label">Departemen</p><p className="text-value">{asset?.department?.name || '-'}</p></div>
            <div><p className="text-label">Vendor</p><p className="text-value">{asset?.vendor || '-'}</p></div>

            {/* Status dengan Badge */}
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

        {/* KARTU 2: Siklus Hidup (Timeline Dummy - Karena API belum menyediakan history) */}
        {/* Kita pertahankan UI-nya agar sesuai desain, tapi datanya statis dulu */}
        <div className="card">
          <h3 style={{fontSize:'14px', margin:'0 0 16px', color:'#0f172a', fontWeight:700}}>Siklus Hidup</h3>
          <div style={{display:'flex', flexDirection:'column'}}>
            
            {/* Contoh Item Timeline 1 (Created At) */}
            <div style={{display:'flex', gap:'12px', position:'relative', paddingBottom:'24px'}}>
              <div style={{position:'absolute', left:'5px', top:'10px', bottom:0, width:'2px', background:'#e2e8f0'}}></div>
              <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#22c55e', marginTop:'4px', flexShrink:0, zIndex:1}}></div>
              <span style={{fontSize:'13px', color:'#334155'}}>
                Terdaftar di Sistem <br/>
                <span style={{fontSize:'11px', color:'#94a3b8'}}>
                  {asset?.created_at ? new Date(asset.created_at).toLocaleDateString('id-ID') : '-'}
                </span>
              </span>
            </div>

            {/* Contoh Item Timeline 2 (Posisi Sekarang) */}
            <div style={{display:'flex', gap:'12px', position:'relative'}}>
              <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#3b82f6', marginTop:'4px', flexShrink:0, zIndex:1}}></div>
              <span style={{fontSize:'13px', color:'#334155'}}>
                Update Terakhir <br/>
                <span style={{fontSize:'11px', color:'#94a3b8'}}>
                   {asset?.updated_at ? new Date(asset.updated_at).toLocaleDateString('id-ID') : '-'}
                </span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailAssetPage;