import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DetailRiskPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back"><ChevronLeft /></button>
        <span className="page-title">Detail Risiko</span>
      </div>

      <div style={{padding:'0 24px'}}>
        {/* Detail Card */}
        <div className="card">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div>
              <p style={{fontSize:'10px', color:'#94a3b8', fontWeight:700, margin:0}}>ID RISIKO</p>
              <p style={{fontSize:'14px', fontWeight:600, margin:'4px 0 0'}}>RISK-102-2025</p>
            </div>
            <div>
              <p style={{fontSize:'10px', color:'#94a3b8', fontWeight:700, margin:0}}>DAMPAK</p>
              <p style={{fontSize:'13px', margin:'4px 0 0'}}>Kebocoran data, Gangguan Layanan.</p>
            </div>
            
            {/* Full Width Desc */}
            <div style={{gridColumn:'1 / -1'}}>
              <p style={{fontSize:'10px', color:'#94a3b8', fontWeight:700, margin:0}}>DESKRIPSI</p>
              <p style={{fontSize:'13px', lineHeight:'1.5', margin:'4px 0 0'}}>Risiko ini dapat menyebabkan kebocoran data, gangguan operasional, kehilangan kepercayaan publik.</p>
            </div>

             <div style={{gridColumn:'1 / -1'}}>
              <p style={{fontSize:'10px', color:'#94a3b8', fontWeight:700, margin:0}}>KRITERIA DAMPAK</p>
              <p style={{fontSize:'13px', margin:'4px 0 0', fontWeight:600}}>Keterlambatan layanan {"<"} 1 jam tanpa kerugian finansial.</p>
            </div>
          </div>
        </div>

        {/* Rencana Mitigasi Section */}
        <h3 style={{fontSize:'15px', margin:'24px 0 12px'}}>Rencana Mitigasi</h3>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'12px'}}>
            <thead style={{background:'#f8f9fa', color:'#64748b'}}>
              <tr>
                <th style={{padding:'12px', textAlign:'left'}}>Aksi</th>
                <th style={{padding:'12px', textAlign:'left'}}>Status</th>
                <th style={{padding:'12px', textAlign:'left'}}>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding:'12px', borderBottom:'1px solid #f1f5f9'}}>Meningkatkan keamanan sistem.</td>
                <td style={{padding:'12px', borderBottom:'1px solid #f1f5f9'}}><span className="badge badge-process">Proses</span></td>
                <td style={{padding:'12px', borderBottom:'1px solid #f1f5f9', fontWeight:600}}>10-10-2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailRiskPage;