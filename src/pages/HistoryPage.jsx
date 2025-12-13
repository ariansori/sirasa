import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, CheckCircle, Search, Filter, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../component/BottomNav';

const API_URL = import.meta.env.VITE_LINK_API_SIRASA;

// --- HELPER FORMAT ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('selesai') || s.includes('completed')) return '#22c55e'; // Hijau
  if (s.includes('proses') || s.includes('progress')) return '#3b82f6';   // Biru
  return '#94a3b8'; // Abu-abu
};

const HistoryPage = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- STYLE OBJECTS ---
  const styles = {
    container: { 
        background: '#f8f9fa', minHeight: '100vh', paddingBottom: '100px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        maxWidth: '480px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)', position: 'relative'
    },
    header: { 
        position: 'sticky', top: 0, background: 'white', zIndex: 10,
        padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    title: { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 },
    searchBox: {
        background: 'white', padding: '16px 20px', position: 'sticky', top: '60px', zIndex: 9,
        borderBottom: '1px solid #f1f5f9'
    },
    inputWrapper: {
        background: '#f1f5f9', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px'
    },
    input: {
        border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#334155'
    },
    card: {
        background: 'white', padding: '16px', borderRadius: '16px', marginBottom: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
        display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer'
    },
    iconBox: (color) => ({
        minWidth: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, 
        color: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),
    date: { fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
    assetName: { fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px', lineHeight: '1.3' },
    note: { fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4' },
    statusBadge: (color) => ({
        fontSize: '10px', fontWeight: '700', color: color, background: `${color}15`, 
        padding: '2px 8px', borderRadius: '6px', marginTop: '8px', display: 'inline-block'
    })
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        const headers = { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        };

        // 1. Ambil Semua Aset (Untuk Mapping Nama Aset nanti)
        const resAssets = await fetch(`${API_URL}/api/assets`, { headers }); // Pakai public biar cepat
        const rawAssets = await resAssets.json();
        const assetsList = Array.isArray(rawAssets) ? rawAssets : (rawAssets.data || []);
        
        // Buat Map: ID -> Nama Aset & Barcode (Supaya pencarian cepat)
        const assetMap = {};
        assetsList.forEach(a => {
            assetMap[a.id] = { name: a.name, barcode: a.barcode };
        });

        // 2. Ambil Data Maintenance
        const resMaint = await fetch(`${API_URL}/api/maintenance`, { headers });
        if (resMaint.ok) {
            const rawMaint = await resMaint.json();
            const maintList = Array.isArray(rawMaint) ? rawMaint : (rawMaint.data || []);

            // Gabungkan Data
            const mergedData = maintList.map(m => ({
                ...m,
                asset_name: assetMap[m.asset_id]?.name || 'Aset Tidak Dikenal',
                asset_barcode: assetMap[m.asset_id]?.barcode || null,
                // Gunakan completion_date sebagai tanggal utama riwayat, jika tidak ada pakai scheduled
                display_date: m.completion_date || m.scheduled_date 
            }));

            // Filter: Hanya yang punya tanggal (valid) & Urutkan Terbaru
            const sorted = mergedData
                .filter(m => m.display_date) 
                .sort((a, b) => new Date(b.display_date) - new Date(a.display_date));

            setData(sorted);
        }
      } catch (err) {
        console.error("Gagal load history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTERING ---
  const filteredData = data.filter(item => 
    item.asset_name.toLowerCase().includes(search.toLowerCase()) ||
    (item.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Riwayat Aktivitas</h1>
        <div style={{background:'#f1f5f9', padding:'8px', borderRadius:'50%'}}>
            <Filter size={20} color="#64748b"/>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBox}>
        <div style={styles.inputWrapper}>
            <Search size={18} color="#94a3b8" />
            <input 
                style={styles.input} 
                placeholder="Cari aset atau aktivitas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Content List */}
      <div style={{padding:'20px'}}>
        {loading ? (
            <p style={{textAlign:'center', color:'#94a3b8', fontSize:'13px', marginTop:'20px'}}>Memuat riwayat...</p>
        ) : filteredData.length > 0 ? (
            filteredData.map((item, index) => {
                const color = getStatusColor(item.status);
                const isCompleted = item.completion_date != null;

                return (
                    <div 
                        key={index} 
                        style={styles.card}
                        onClick={() => item.asset_barcode && navigate(`/asset/${item.asset_barcode}`)} // Klik card -> Ke detail aset
                    >
                        {/* Icon Kiri */}
                        <div style={styles.iconBox(isCompleted ? '#22c55e' : '#f59e0b')}>
                            {isCompleted ? <CheckCircle size={20}/> : <Wrench size={20}/>}
                        </div>

                        {/* Content Kanan */}
                        <div style={{flex:1}}>
                            <div style={styles.date}>
                                <Calendar size={10}/> {formatDate(item.display_date)}
                            </div>
                            <h3 style={styles.assetName}>{item.asset_name}</h3>
                            <p style={styles.note}>{item.notes || 'Tidak ada catatan aktivitas.'}</p>
                            
                            {/* Status Badge */}
                            <span style={styles.statusBadge(color)}>
                                {item.status || (isCompleted ? 'Selesai' : 'Terjadwal')}
                            </span>
                        </div>
                    </div>
                );
            })
        ) : (
            <div style={{textAlign:'center', marginTop:'40px'}}>
                <div style={{background:'#f1f5f9', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
                    <Search size={24} color="#cbd5e1"/>
                </div>
                <p style={{color:'#64748b', fontSize:'14px'}}>Tidak ada riwayat ditemukan.</p>
            </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HistoryPage;