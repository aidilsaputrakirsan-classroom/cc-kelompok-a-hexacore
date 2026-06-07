import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// Helper format uptime
const formatUptime = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} jam`);
  if (mins > 0) parts.push(`${mins} menit`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} detik`);
  return parts.join(' ');
};

function ErrorRateBar({ rate }) {
  const isDanger = rate > 5;
  const isWarning = rate > 0 && rate <= 5;
  const color = isDanger ? 'var(--c-red)' : isWarning ? 'var(--c-amber)' : 'var(--c-green)';
  
  return (
    <div style={{ width: '100%', backgroundColor: 'var(--c-slate3)', borderRadius: '4px', overflow: 'hidden', height: '12px', marginTop: '12px' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, rate))}%`,
        backgroundColor: color,
        transition: 'width 0.5s ease'
      }} />
    </div>
  );
}

function ServiceCard({ name, icon, healthUrl, metricsUrl, refreshTrigger }) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const healthPromise = fetch(healthUrl)
        .then(res => res.json())
        .catch(() => ({ status: 'unreachable' }));

      const metricsPromise = fetch(metricsUrl)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .catch(() => null);

      const [healthData, metricsData] = await Promise.all([healthPromise, metricsPromise]);

      setHealth(healthData);
      setMetrics(metricsData);
      setError(healthData.status === 'unreachable');
    } catch (err) {
      setHealth({ status: 'unreachable' });
      setMetrics(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'healthy':
        return { color: 'var(--c-green)', bg: 'var(--c-green-bg)', label: 'Normal', icon: '🟢' };
      case 'degraded':
        return { color: 'var(--c-amber)', bg: 'var(--c-amber-bg)', label: 'Degraded', icon: '🟡' };
      case 'unhealthy':
        return { color: 'var(--c-red)', bg: 'var(--c-red-bg)', label: 'Unhealthy', icon: '🔴' };
      case 'unreachable':
      default:
        return { color: 'var(--c-text3)', bg: 'var(--c-bg)', label: 'Terputus', icon: '⚪' };
    }
  };

  const statusVal = health?.status || 'unreachable';
  const cfg = getStatusConfig(statusVal);

  return (
    <div className="card card-p" style={{
      position: 'relative',
      borderLeft: `5px solid ${cfg.color}`,
      boxShadow: 'var(--sh-md)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      background: 'var(--c-surface)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--c-text)' }}>{name}</h3>
            <span style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {metricsUrl.includes('auth') ? 'Auth & User Service' : 'Library & Fines Service'}
            </span>
          </div>
        </div>
        <span className="badge" style={{
          backgroundColor: cfg.bg,
          color: cfg.color,
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: `1px solid ${cfg.color}33`
        }}>
          <span style={{ fontSize: '10px', animation: statusVal === 'healthy' ? 'pulse 2s infinite' : 'none' }}>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>

      {/* Skeletons/Loader */}
      {loading && !health ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--c-text3)' }}>
          <div className="spinner-icon" style={{
            margin: '0 auto 10px',
            width: '24px',
            height: '24px',
            border: '3px solid var(--c-border)',
            borderTop: '3px solid var(--c-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Memperbarui data...
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: 'var(--c-red-bg)',
          color: '#DC2626',
          padding: '12px 16px',
          borderRadius: 'var(--r-md)',
          fontSize: '13px',
          fontWeight: '500',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          ⚠️ Tidak dapat terhubung ke service. Pastikan kontainer docker sudah berjalan dan dapat diakses.
        </div>
      ) : (
        <div>
          {/* Dashboard Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Uptime</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-text)', marginTop: '4px' }}>
                {formatUptime(metrics?.uptime_seconds)}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Total Request</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-text)', marginTop: '4px' }}>
                {metrics?.total_requests ?? 0}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Gagal (Error)</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: (metrics?.total_errors > 0) ? 'var(--c-red)' : 'var(--c-text)', marginTop: '4px' }}>
                {metrics?.total_errors ?? 0}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Error Rate</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: (metrics?.error_rate_percent > 5) ? 'var(--c-amber)' : 'var(--c-text)' }}>
                  {metrics?.error_rate_percent ?? 0}%
                </div>
              </div>
              <ErrorRateBar rate={metrics?.error_rate_percent ?? 0} />
            </div>

            <div style={{ padding: '12px', background: 'var(--c-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--c-text3)', textTransform: 'uppercase', fontWeight: '700' }}>Avg Latency</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-accent)', marginTop: '4px' }}>
                {metrics?.latency?.avg_ms ?? '—'} <span style={{ fontSize: '12px', fontWeight: '500' }}>ms</span>
              </div>
            </div>
          </div>

          {/* Latency Percentiles Section */}
          {metrics?.latency && (
            <div style={{
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              padding: '12px 16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--c-text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Latency Distribution (Percentiles)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p50 (Median)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{metrics.latency.p50_ms} ms</div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p95 (95%)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: metrics.latency.p95_ms > 500 ? 'var(--c-amber)' : 'inherit', marginTop: '2px' }}>
                    {metrics.latency.p95_ms} ms
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center', borderRight: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>p99 (99%)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: metrics.latency.p99_ms > 1000 ? 'var(--c-red)' : 'inherit', marginTop: '2px' }}>
                    {metrics.latency.p99_ms} ms
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '70px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-text3)' }}>Max Latency</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{metrics.latency.p99_ms} ms</div>
                </div>
              </div>
            </div>
          )}

          {/* Database & Dependency Status */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 16px',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text2)' }}>🔌 Database Connection</span>
              <span className={`badge ${health?.database === 'connected' || health?.dependencies?.database?.status === 'connected' ? 'badge-green' : 'badge-red'}`}>
                {health?.database || health?.dependencies?.database?.status || 'disconnected'}
              </span>
            </div>

            {health?.dependencies?.['auth-service'] && (
              <div style={{
                flex: 1,
                minWidth: '240px',
                padding: '12px 16px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text2)' }}>⛓️ Circuit Breaker (Auth)</span>
                  <span style={{ fontSize: '10px', color: 'var(--c-text3)' }}>
                    State: <strong>{health.dependencies['auth-service'].circuit_breaker?.state}</strong> (failures: {health.dependencies['auth-service'].circuit_breaker?.failure_count}/5)
                  </span>
                </div>
                <span className={`badge ${health.dependencies['auth-service'].status === 'available' ? 'badge-green' : 'badge-red'}`}>
                  {health.dependencies['auth-service'].status}
                </span>
              </div>
            )}
          </div>

          {/* Top Endpoints */}
          {metrics?.endpoints && Object.keys(metrics.endpoints).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--c-text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Traffic Endpoint Teratas
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)', color: 'var(--c-text3)' }}>
                      <th style={{ padding: '8px 12px' }}>Endpoint</th>
                      <th style={{ padding: '8px 12px', width: '80px', textAlign: 'right' }}>Calls</th>
                      <th style={{ padding: '8px 12px', width: '80px', textAlign: 'right' }}>Errors</th>
                      <th style={{ padding: '8px 12px', width: '100px', textAlign: 'right' }}>Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.endpoints).map(([endpoint, stats]) => (
                      <tr key={endpoint} style={{ borderBottom: '1px solid var(--c-border)', color: 'var(--c-text2)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--c-text)' }}>{endpoint}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>{stats.count}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: stats.errors > 0 ? 'var(--c-red)' : 'inherit', fontWeight: '600' }}>
                          {stats.errors}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{stats.avg_latency_ms} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setTimeLeft(10);
  }, []);

  // Timer logic for auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRefreshTrigger(t => t + 1);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  return (
    <div style={{ animation: 'fadeUp 0.3s ease both' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Status Sistem & Observabilitas</h1>
          <p className="page-sub">Monitoring performa layanan mikro LenteraPustaka secara real-time</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {autoRefresh && (
            <span style={{ fontSize: '13px', color: 'var(--c-text3)', marginRight: '4px' }}>
              Pembaruan otomatis dalam: <strong>{timeLeft}s</strong>
            </span>
          )}
          
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setAutoRefresh(prev => !prev)}
            style={{ fontWeight: '600' }}
          >
            {autoRefresh ? '⏸️ Jeda Auto-Refresh' : '▶️ Aktifkan Auto-Refresh'}
          </button>
          
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleRefresh}
            style={{ fontWeight: '600' }}
          >
            🔄 Perbarui Sekarang
          </button>
        </div>
      </div>

      {/* Services status cards container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        marginTop: '16px'
      }}>
        <ServiceCard
          name="Lentera Auth Service"
          icon="🔐"
          healthUrl={`${API_URL}/auth/health`}
          metricsUrl={`${API_URL}/auth/metrics`}
          refreshTrigger={refreshTrigger}
        />
        
        <ServiceCard
          name="Lentera Library Service"
          icon="📚"
          healthUrl={`${API_URL}/items/health`}
          metricsUrl={`${API_URL}/items/metrics`}
          refreshTrigger={refreshTrigger}
        />
      </div>
      
      {/* CSS Keyframes for animation pulse */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
