// src/pages/PublicAssetPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PublicAssetPage.css'; // <-- 1. IMPORT CSS EKSTERNAL BARU ANDA

// ⬇️ URL API Backend Anda
const API_URL = "https://asset-risk-management.vercel.app"; 

// --- FUNGSI HELPER BARU ---
// Ini sekarang mengembalikan string (nama class), bukan objek style
const getBadgeClass = (status) => {
  if (!status) return 'badge-default';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('aktif') && !lowerStatus.includes('tidak')) {
    return 'badge-success';
  }
  if (lowerStatus.includes('tidak aktif') || lowerStatus.includes('non-aktif') || lowerStatus.includes('rusak')) {
    return 'badge-danger';
  }
  if (lowerStatus.includes('perbaikan') || lowerStatus.includes('maintenance')) {
    return 'badge-warning';
  }
  return 'badge-default';
};
// --- AKHIR FUNGSI HELPER ---


export default function PublicAssetPage() {
  const { barcode } = useParams(); 
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (barcode) {
      setLoading(true);
      
      fetch(`${API_URL}/api/assets/public/barcode/${barcode}`)
        .then(res => {
          if (res.status === 404) throw new Error('Aset tidak ditemukan.');
          if (!res.ok) throw new Error('Gagal mengambil data aset.');
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
        .finally(() => {
          setLoading(false);
        });
    }
  }, [barcode]);

  // --- Tampilan Halaman (Render) ---
  // Perhatikan semua 'style={...}' telah diganti dengan 'className="..."'

  if (loading) {
    return (
      <div className="container">
        <p>Memuat data aset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        {/* Gabungkan dua class: 'card' and 'error' */}
        <div className="card error"> 
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container">
        <div className="card">
          <p>Aset tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  // Jika berhasil, tampilkan datanya
  return (
    <div className="container">
      <div className="card">
        <h1 
          style={{ 
            color: 'black', 
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 20px 0', // Margin atas 0, bawah 20px
            paddingBottom: '16px',
            borderBottom: '1px solid #eee' // Garis bawah untuk memisahkan judul
          }}
        >
          Detail Aset
        </h1>
        {/* Header Kartu */}
        <div className="card-header">
          <h1 className="asset-name">{asset.name}</h1>
          {/* Gabungkan class 'badge' dengan class warna dinamis */}
          <span className={`badge ${getBadgeClass(asset.status?.name)}`}>
            {asset.status?.name || 'N/A'}
          </span>
        </div>

        {/* Garis Pemisah */}
        <hr className="divider" />

        {/* Detail Aset */}
        <ul className="detail-list">
          <li className="detail-item">
            <span className="detail-label">Lokasi</span>
            <span className="detail-value">{asset.lokasi || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Merk/Tipe</span>
            <span className="detail-value">{asset.merk_type || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Kondisi</span>
            <span className="detail-value">{asset.condition?.name || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Serial Number</span>
            <span className="detail-value">{asset.serial_number || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Kategori</span>
            <span className="detail-value">{asset.category?.name || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Sub-Kategori</span>
            <span className="detail-value">{asset.sub_category?.name || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Departemen</span>
            <span className="detail-value">{asset.department?.name || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">Vendor</span>
            <span className="detail-value">{asset.vendor || 'N/A'}</span>
          </li>
          <li className="detail-item">
            <span className="detail-label">ID Barcode</span>
            <span className="detail-value">{asset.barcode || 'N/A'}</span>
          </li>
        </ul>
      </div>
      <footer className="footer">
        Powered by Cybera Management
      </footer>
    </div>
  );
}