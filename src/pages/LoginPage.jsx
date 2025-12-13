import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Menggunakan style global yang sudah ada

const API_SSO_URL = import.meta.env.VITE_LINK_API_SSO;

const LoginPage = () => {
  const navigate = useNavigate();
  
  // State form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_SSO_URL}/api/sso/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal. Periksa email/password.');
      }

      // LOGIN SUKSES
      // 1. Simpan Token & Data User ke LocalStorage (Agar tetap login saat di-refresh)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      // 2. Redirect ke Halaman Utama
      navigate('/', { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{display:'flex', flexDirection:'column', justifyContent:'center', minHeight:'100vh', padding:'24px', background:'white'}}>
      
      {/* Logo / Header */}
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <img src="/sirasa.png" alt="Logo" style={{width:'80px', marginBottom:'16px'}} />
        <h1 style={{fontSize:'24px', fontWeight:'700', color:'#1e293b', margin:'0'}}>Masuk SIRASA</h1>
        <p style={{color:'#64748b', fontSize:'14px', marginTop:'8px'}}>Sistem Informasi Manajemen Aset dan Risiko</p>
      </div>

      {/* Form Login */}
      <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        
        {error && (
          <div style={{background:'#fee2e2', color:'#991b1b', padding:'12px', borderRadius:'12px', fontSize:'13px', textAlign:'center'}}>
            {error}
          </div>
        )}

        <div>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#1e293b', display:'block', marginBottom:'6px'}}>Email Dinas</label>
          <input 
            type="email" 
            required
            placeholder="xxxxx@dinas.go.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
          />
        </div>

        <div>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#1e293b', display:'block', marginBottom:'6px'}}>Kata Sandi</label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop:'20px',
            background: loading ? '#94a3b8' : '#3b82f6',
            color:'white',
            padding:'16px',
            borderRadius:'16px',
            border:'none',
            fontSize:'16px',
            fontWeight:'700',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p style={{textAlign:'center', fontSize:'12px', color:'#94a3b8', marginTop:'30px'}}>
        Versi 1.0.0 • Diskominfo
      </p>
    </div>
  );
};

export default LoginPage;