import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import StatusPage from '../pages/StatusPage';

// Mock fetch global
global.fetch = vi.fn();

describe('StatusPage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders StatusPage layout and loading state initially', async () => {
    // Mock response untuk auth-service
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy', database: 'connected' }),
    });
    // Mock response untuk auth-service metrics
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        service: 'auth-service', 
        uptime_seconds: 300, 
        total_requests: 12,
        total_errors: 0,
        error_rate_percent: 0,
        latency: { avg_ms: 25, p50_ms: 20, p95_ms: 30, p99_ms: 35 },
        endpoints: {}
      }),
    });
    // Mock response untuk library-service
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        status: 'healthy', 
        dependencies: { 
        database: { status: 'connected' },
        'auth-service': { status: 'available', circuit_breaker: { state: 'CLOSED', failure_count: 0 } }
        } 
      }),
    });
    // Mock response untuk library-service metrics
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        service: 'library-service', 
        uptime_seconds: 300, 
        total_requests: 7,
        total_errors: 0,
        error_rate_percent: 0,
        latency: { avg_ms: 15, p50_ms: 11, p95_ms: 18, p99_ms: 22 },
        endpoints: {}
      }),
    });

    render(<StatusPage />);

    // Memastikan judul halaman dirender
    expect(screen.getByText('📊 Status Sistem & Observabilitas')).toBeInTheDocument();
    expect(screen.getByText('Lentera Auth Service')).toBeInTheDocument();
    expect(screen.getByText('Lentera Library Service')).toBeInTheDocument();

    // Tunggu data termuat
    await waitFor(() => {
      expect(screen.getAllByText('Normal')).toHaveLength(2); // Kedua service berstatus Normal
    });

    // Memastikan metrik berhasil ditampilkan
    expect(screen.getByText('12')).toBeInTheDocument(); // Total request auth-service
    expect(screen.getByText('7')).toBeInTheDocument(); // Total request library-service
  });

  it('renders error message when a service is unreachable', async () => {
    // Mock fetch error (reject)
    fetch.mockRejectedValue(new Error('Network Error'));

    render(<StatusPage />);

    await waitFor(() => {
      // Menunggu alert error dirender
      expect(screen.getAllByText(/Tidak dapat terhubung ke service/)).toHaveLength(2);
    });
  });
});
