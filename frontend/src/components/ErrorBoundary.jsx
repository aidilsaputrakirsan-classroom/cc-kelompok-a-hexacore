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
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e53e3e' }}>Oops! Sesuatu berjalan tidak semestinya.</h2>
          <p>Terjadi kesalahan pada aplikasi. Silakan coba muat ulang halaman ini.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
