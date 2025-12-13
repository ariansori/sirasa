import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, User, Calendar, DollarSign, Activity, TrendingDown, Target } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_LINK_API_SIRASA;

// Helper Format Tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

// Helper Format Rupiah
const formatRupiah = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

const TreatmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID Treatment

  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Style
  const styles = {
    container: { background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: '480px', margin: '0 auto', position: 'relative' },
    headerSticky: { position: 'sticky', top: 0, background: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', zIndex: 10 },
    pageTitle: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#1e293b', marginRight: '24px' },
    card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
    sectionTitle: { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    label: { fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' },
    value: { fontSize: '14px', color: '#334155', fontWeight: '500' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const res = await fetch(`${API_URL}/api/risk-treatments/${id}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!res.ok) {
           throw new Error(`Gagal mengambil data treatment (Status: ${res.status})`);
        }

        const data = await res.json();
        // Normalisasi: data mungkin dibungkus property .data atau array
        const treatmentData = Array.isArray(data) ? data[0] : (data.data || data);
        
        setTreatment(treatmentData);

      } catch (err) {
        console.error("Error fetch treatment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div style={{...styles.container, display:'flex', alignItems:'center', justifyContent:'center'}}>Memuat...</div>;
  if (!treatment) return <div style={{...styles.container, padding:'20px', textAlign:'center'}}>Data tidak ditemukan</div>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.headerSticky}>
        <button onClick={() => navigate(-1)} style={{background:'none', border:'none', cursor:'pointer', color:'#3b82f6', padding:'4px'}}>
          <ChevronLeft size={24} />
        </button>
        <span style={styles.pageTitle}>Detail Penanganan</span>
      </div>

      <div style={{padding:'20px'}}>
        
        {/* CARD 1: INFORMASI UTAMA */}
        <div style={styles.card}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
               <span style={{fontSize:'11px', fontWeight:'700', color:'#1e40af', background:'#dbeafe', padding:'4px 8px', borderRadius:'6px', textTransform:'uppercase'}}>
                  {treatment.strategy}
               </span>
               <span style={{fontSize:'11px', fontWeight:'700', color:'#059669', background:'#d1fae5', padding:'4px 8px', borderRadius:'6px', textTransform:'uppercase'}}>
                  {treatment.status}
               </span>
            </div>
            
            <h2 style={{fontSize:'18px', fontWeight:'800', color:'#1e293b', margin:'0 0 16px', lineHeight:'1.3'}}>
                {treatment.action}
            </h2>

            <div style={styles.grid2}>
                <div><p style={styles.label}>PIC / Owner</p><p style={styles.value}>{treatment.action_owner || '-'}</p></div>
                <div><p style={styles.label}>Target Selesai</p><p style={styles.value}>{formatDate(treatment.target_date)}</p></div>
            </div>
        </div>

        {/* CARD 2: BIAYA & EFEKTIVITAS */}
        <div style={styles.card}>
            <div style={styles.sectionTitle}><Activity size={18} color="#f59e0b"/> Analisis Efektivitas</div>
            
            <div style={{display:'flex', alignItems:'center', gap:'12px', background:'#fffbeb', padding:'12px', borderRadius:'12px', marginBottom:'16px'}}>
                <div style={{background:'#fcd34d', padding:'8px', borderRadius:'8px', color:'#92400e'}}><DollarSign size={20}/></div>
                <div>
                    <p style={styles.label}>Estimasi Biaya</p>
                    <p style={{fontSize:'16px', fontWeight:'800', color:'#b45309'}}>{formatRupiah(treatment.cost)}</p>
                </div>
            </div>

            <div style={{marginBottom:'16px'}}>
                <p style={styles.label}>Efektivitas Penanganan</p>
                <p style={{fontSize:'14px', fontWeight:'bold', color:'#334155'}}>{treatment.effectiveness || '-'}</p>
            </div>
        </div>

        {/* CARD 3: HASIL MITIGASI (RESIDUAL) */}
        <div style={styles.card}>
            <div style={styles.sectionTitle}><TrendingDown size={18} color="#16a34a"/> Prediksi Residual</div>
            <p style={{fontSize:'12px', color:'#64748b', marginBottom:'16px'}}>Prediksi skor risiko setelah penanganan dilakukan:</p>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', textAlign:'center'}}>
                <div style={{background:'#f0fdf4', padding:'10px', borderRadius:'10px', border:'1px solid #bbf7d0'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'#166534'}}>{treatment.new_probability}</div>
                    <div style={{fontSize:'10px', color:'#166534', textTransform:'uppercase', fontWeight:'600'}}>Probabilitas</div>
                </div>
                <div style={{background:'#f0fdf4', padding:'10px', borderRadius:'10px', border:'1px solid #bbf7d0'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'#166534'}}>{treatment.new_impact_score}</div>
                    <div style={{fontSize:'10px', color:'#166534', textTransform:'uppercase', fontWeight:'600'}}>Dampak</div>
                </div>
                <div style={{background:'#16a34a', padding:'10px', borderRadius:'10px'}}>
                    <div style={{fontSize:'18px', fontWeight:'800', color:'white'}}>{treatment.residual_level}</div>
                    <div style={{fontSize:'10px', color:'white', textTransform:'uppercase', fontWeight:'600'}}>Total Skor</div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TreatmentDetailPage;