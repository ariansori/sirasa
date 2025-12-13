import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertTriangle, ShieldCheck, User, Calendar, CheckCircle, BarChart2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_LINK_API_SIRASA;

// --- HELPER FORMAT TANGGAL ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

// --- HELPER WARNA LEVEL RISIKO ---
const getLevelColor = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'high' || l === 'tinggi' || l === 'extreme') return { bg: '#fee2e2', text: '#991b1b', border: '#f87171' }; // Merah
  if (l === 'medium' || l === 'sedang') return { bg: '#ffedd5', text: '#9a3412', border: '#fb923c' }; // Orange
  return { bg: '#dcfce7', text: '#166534', border: '#4ade80' }; // Hijau (Low)
};

const RiskDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [risk, setRisk] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STYLES ---
  const styles = {
    container: { 
        background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        maxWidth: '480px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)', position: 'relative'
    },
    headerSticky: { 
        position: 'sticky', top: 0, background: 'white', padding: '12px 16px', 
        display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', zIndex: 10 
    },
    pageTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#1e293b', marginRight: '24px' },
    card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
    sectionTitle: { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' },
    value: { fontSize: '14px', color: '#334155', fontWeight: '500', lineHeight: '1.5' },
    divider: { height: '1px', background: '#f1f5f9', margin: '16px 0' },
    
    // Badge Level
    levelBadge: (colors) => ({
        background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
        padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', 
        display: 'flex', justifyContent: 'center', textTransform: 'uppercase', width: '100%'
    })
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Detail Risiko
        const resRisk = await fetch(`${API_URL}/api/risks/${id}`, { headers });
        if (!resRisk.ok) throw new Error('Gagal mengambil data risiko');

        const data = await resRisk.json();
        const riskData = Array.isArray(data) ? data[0] : (data.data || data);
        setRisk(riskData);

        // 2. Fetch Treatments (PERBAIKAN DI SINI)
        // Kita coba kirim parameter ?risk_id=... agar server tidak menolak (Error 400)
        // Jika endpoint backend mendukung filtering via query param:
        const resTreat = await fetch(`${API_URL}/api/risk-treatments?risk_id=${id}`, { headers });
        
        if (resTreat.ok) {
            const dataTreat = await resTreat.json();
            const listTreat = Array.isArray(dataTreat) ? dataTreat : (dataTreat.data || []);
            // Filter lagi di client untuk memastikan (double check)
            setTreatments(listTreat.filter(t => t.risk_id === id));
        } else {
            // Fallback: Jika endpoint ?risk_id gagal, coba endpoint khusus lain atau kosongkan
            console.warn("Gagal fetch treatments dengan query param, status:", resTreat.status);
            setTreatments([]); 
        }

      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail risiko.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div style={{...styles.container, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>Memuat...</div>;
  if (error || !risk) return <div style={{...styles.container, padding:'20px', textAlign:'center', color:'#ef4444'}}>{error || 'Data tidak ditemukan'}</div>;

  const levelColor = getLevelColor(risk.criteria || 'Low'); // 'criteria' berisi "Medium", etc.

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.headerSticky}>
        <button onClick={() => navigate(-1)} style={{background:'none', border:'none', cursor:'pointer', color:'#3b82f6', padding:'4px'}}>
          <ChevronLeft size={24} />
        </button>
        <span style={styles.pageTitle}>Detail Risiko</span>
      </div>

      <div style={{padding:'20px'}}>
        
        {/* CARD 1: JUDUL & LEVEL */}
        <div style={styles.card}>
            {/* Tipe Risiko (Positif/Negatif) */}
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                <span style={{fontSize:'11px', fontWeight:'700', color:'#475569', background:'#f1f5f9', padding:'4px 8px', borderRadius:'6px', textTransform:'uppercase'}}>
                    {risk.type || 'Risiko Aset'}
                </span>
                <span style={{fontSize:'11px', fontWeight:'700', color:'#0891b2', background:'#cffafe', padding:'4px 8px', borderRadius:'6px', textTransform:'uppercase'}}>
                    {risk.type_of_risk || 'Risiko'}
                </span>
            </div>

            <h2 style={{fontSize:'20px', fontWeight:'800', color:'#1e293b', margin:'0 0 16px', lineHeight:'1.3'}}>
                {risk.title || 'Tanpa Judul'}
            </h2>
            
            {/* Indikator Level (Criteria) */}
            <div style={styles.levelBadge(levelColor)}>
                {risk.criteria || 'NORMAL'}
            </div>
            
            <div style={{marginTop:'12px', textAlign:'center', fontSize:'12px', color:'#64748b'}}>
                Status: <span style={{fontWeight:'bold', textTransform:'uppercase', color:'#334155'}}>{risk.approval_status}</span>
            </div>
        </div>

        {/* CARD 2: SKOR MATRIKS (PENTING) */}
        <div style={styles.card}>
            <div style={styles.sectionTitle}><BarChart2 size={18} color="#8b5cf6"/> Skor Matriks</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', textAlign:'center'}}>
                <div style={{background:'#f5f3ff', padding:'10px', borderRadius:'10px'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'#7c3aed'}}>{risk.probability}</div>
                    <div style={{fontSize:'10px', color:'#6d28d9', textTransform:'uppercase', fontWeight:'600'}}>Probabilitas</div>
                </div>
                <div style={{background:'#f5f3ff', padding:'10px', borderRadius:'10px'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'#7c3aed'}}>{risk.impact_score}</div>
                    <div style={{fontSize:'10px', color:'#6d28d9', textTransform:'uppercase', fontWeight:'600'}}>Dampak</div>
                </div>
                <div style={{background:'#8b5cf6', padding:'10px', borderRadius:'10px'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'white'}}>{risk.entry_level}</div>
                    <div style={{fontSize:'10px', color:'white', textTransform:'uppercase', fontWeight:'600'}}>Total Skor</div>
                </div>
            </div>
        </div>

        {/* CARD 3: ANALISIS DETAIL */}
        <div style={styles.card}>
            <div style={styles.sectionTitle}><AlertTriangle size={18} color="#f59e0b"/> Analisis Detail</div>
            
            <div style={{marginBottom:'16px'}}>
                <p style={styles.label}>Deskripsi</p>
                <p style={styles.value}>{risk.description || '-'}</p>
            </div>

            <div style={styles.divider}></div>

            <div style={{marginBottom:'16px'}}>
                <p style={styles.label}>Penyebab (Cause)</p>
                <p style={styles.value}>{risk.cause || '-'}</p>
            </div>
            
            <div style={{marginBottom:'0'}}>
                <p style={styles.label}>Dampak (Impact)</p>
                <p style={styles.value}>{risk.impact || '-'}</p>
            </div>
        </div>

        {/* CARD 4: PENANGANAN (TREATMENT) */}
        <div style={styles.card}>
            <div style={styles.sectionTitle}><ShieldCheck size={18} color="#3b82f6"/> Penanganan Risiko</div>
            
            {treatments.length > 0 ? (
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    {treatments.map((t, i) => (
                        <div 
                            key={i} 
                            onClick={() => navigate(`/treatment/${t.id}`)} // KLIK KE DETAIL TREATMENT
                            style={{
                                background:'#eff6ff', borderRadius:'12px', padding:'16px', 
                                border:'1px solid #dbeafe', cursor:'pointer', position:'relative'
                            }}
                        >
                            {/* Panah Indikator Klik */}
                            <div style={{position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)', color:'#3b82f6'}}>
                                <ChevronLeft size={20} style={{transform:'rotate(180deg)'}} />
                            </div>

                            {/* Strategi (Transfer/Mitigasi/dll) */}
                            <span style={{fontSize:'10px', fontWeight:'700', color:'#1e40af', background:'#dbeafe', padding:'2px 8px', borderRadius:'4px', textTransform:'uppercase', marginBottom:'6px', display:'inline-block'}}>
                                {t.strategy || 'Mitigasi'}
                            </span>

                            {/* Nama Action */}
                            <p style={{fontSize:'14px', fontWeight:'700', color:'#1e3a8a', margin:'4px 0 8px', paddingRight:'20px'}}>
                                {t.action || 'Tanpa Nama Aksi'}
                            </p>
                            
                            <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                {/* PIC */}
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <User size={12} color="#64748b"/>
                                    <span style={{fontSize:'12px', color:'#475569'}}>PIC: <b>{t.action_owner || '-'}</b></span>
                                </div>
                                
                                {/* Target Date */}
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <Calendar size={12} color="#64748b"/>
                                    <span style={{fontSize:'12px', color:'#475569'}}>Target: {formatDate(t.target_date)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:'13px', fontStyle:'italic'}}>
                    Belum ada rencana penanganan.
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default RiskDetailPage;