import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--c-slate9)' 
        }}>
          <div style={{
            background: 'var(--c-surface)',
            padding: '40px',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-lg)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            borderTop: '4px solid var(--c-red)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
            <h2 style={{ color: 'var(--c-text)', margin: '0 0 12px 0', fontSize: '24px' }}>Oops! Terjadi Kesalahan</h2>
            <p style={{ color: 'var(--c-text2)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Aplikasi mendeteksi adanya masalah yang tidak terduga.<br/>
              Silakan muat ulang halaman atau kembali ke beranda.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                background: 'var(--c-red-bg)', 
                color: 'var(--c-red)', 
                padding: '12px', 
                borderRadius: 'var(--r-md)',
                fontSize: '13px',
                textAlign: 'left',
                marginBottom: '24px',
                wordBreak: 'break-all'
              }}>
                <strong>Error:</strong> {this.state.errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
              >
                Kembali ke Beranda
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
