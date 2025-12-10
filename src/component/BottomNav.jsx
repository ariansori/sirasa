import React from 'react';
import { Home, History, Scan } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  const navStyle = {
    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: '480px', height: '80px', background: 'white',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 50
  };

  const itemStyle = (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
    color: active ? '#3b82f6' : '#94a3b8', gap: '4px'
  });

  return (
    <div style={navStyle}>
      <div onClick={() => navigate('/')} style={itemStyle(isActive('/'))}>
        <Home size={24} />
        <span style={{fontSize:'10px', fontWeight:600}}>Beranda</span>
      </div>

      <div style={{position:'relative', top:'-25px'}}>
        <button onClick={() => navigate('/scan')} style={{
          width:'64px', height:'64px', borderRadius:'50%', background:'#3b82f6', border:'6px solid white', 
          display:'flex', alignItems:'center', justifyContent:'center', color:'white', 
          boxShadow:'0 8px 20px rgba(59, 130, 246, 0.4)', cursor:'pointer'
        }}>
          <Scan size={28} />
        </button>
      </div>

      <div onClick={() => navigate('/history')} style={itemStyle(isActive('/history'))}>
        <History size={24} />
        <span style={{fontSize:'10px', fontWeight:600}}>Riwayat</span>
      </div>
    </div>
  );
};

export default BottomNav;