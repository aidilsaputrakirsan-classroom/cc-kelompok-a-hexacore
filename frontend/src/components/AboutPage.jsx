import React from 'react';

function AboutPage({ onBack }) {
  const team = [
    { name: "Maulana Malik Ibrahim", nim: "10231051", role: "Lead Backend" },
    { name: "Micka Mayulia Utama", nim: "10231053", role: "Lead Frontend" },
    { name: "Khanza Nabila Tsabita", nim: "10231049", role: "Lead DevOps" },
    { name: "Muhammad Aqila Ardhi", nim: "10231057", role: "Lead QA & Docs" },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", animation: 'fadeUp .3s ease' }}>
      
      {/* Header Section */}
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 className="page-title">Tentang LenteraPustaka</h1>
          <p className="page-sub">Aplikasi Cloud-Native yang dibangun untuk mata kuliah Komputasi Awan (HEXACORE)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Project Description Card */}
        <div className="card card-p" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--c-accent)', opacity: '0.05', borderRadius: '50%', pointerEvents: 'none' }}></div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--c-text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📚</span> Visi Proyek
          </h2>
          <p style={{ color: 'var(--c-text2)', lineHeight: '1.7', fontSize: '14.5px' }}>
            <strong>LenteraPustaka</strong> adalah sistem manajemen perpustakaan modern yang didesain menggunakan arsitektur <em>microservices-ready</em>. Proyek ini mengimplementasikan siklus CI/CD penuh, deployment berbasis kontainer, dan dirancang dengan antarmuka yang terintegrasi secara profesional.
          </p>
        </div>

        {/* Tech Stack Card */}
        <div className="card card-p">
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--c-text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span> Teknologi Utama
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-card-bar" style={{ background: 'var(--c-green)' }}></div>
              <div className="stat-card-label" style={{ marginBottom: '4px' }}>Backend API</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>FastAPI + Python</div>
              <div style={{ fontSize: '12px', color: 'var(--c-text3)', marginTop: '4px' }}>PostgreSQL Database</div>
            </div>
            
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-card-bar" style={{ background: 'var(--c-accent)' }}></div>
              <div className="stat-card-label" style={{ marginBottom: '4px' }}>Frontend UI</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>React + Vite</div>
              <div style={{ fontSize: '12px', color: 'var(--c-text3)', marginTop: '4px' }}>Pure CSS Architecture</div>
            </div>

            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-card-bar" style={{ background: 'var(--c-violet)' }}></div>
              <div className="stat-card-label" style={{ marginBottom: '4px' }}>Infrastructure</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>Docker Compose</div>
              <div style={{ fontSize: '12px', color: 'var(--c-text3)', marginTop: '4px' }}>Multi-stage Nginx</div>
            </div>

            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-card-bar" style={{ background: 'var(--c-amber)' }}></div>
              <div className="stat-card-label" style={{ marginBottom: '4px' }}>DevOps</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)' }}>GitHub Actions</div>
              <div style={{ fontSize: '12px', color: 'var(--c-text3)', marginTop: '4px' }}>CI/CD Pipeline</div>
            </div>
          </div>
        </div>

        {/* Team Table */}
        <div className="card">
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--c-border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span style={{ fontSize: '20px' }}>👨‍💻</span> Tim Pengembang (HEXACORE)
            </h2>
          </div>
          <div className="table-wrap" style={{ border: 'none', boxShadow: 'none', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  <th>NIM</th>
                  <th>Peran Khusus</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500', color: 'var(--c-text)' }}>{m.name}</td>
                    <td style={{ color: 'var(--c-text2)' }}>{m.nim}</td>
                    <td>
                      <span className="badge badge-blue">
                        {m.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;
