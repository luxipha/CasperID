import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Analytics from '../../business/pages/Analytics';

const mockGet = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: { get: (...args: any[]) => mockGet(...args) },
}));

describe('Analytics', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Analytics /></MemoryRouter>);
    expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
  });

  it('renders key metrics', async () => {
    mockGet.mockResolvedValue({
      success: true,
      stats: { total_requests: 5000, total_verifications: 4500, active_apps: 3, total_apps: 5, top_apps: [{ name: 'App1', value: 3000 }] },
    });
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    expect(await screen.findByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('4,500')).toBeInTheDocument();
    expect(screen.getByText('Total Verifications')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockGet.mockResolvedValue({ success: false });
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    expect(await screen.findByText(/failed to load analytics/i)).toBeInTheDocument();
  });

  it('shows API error message', async () => {
    mockGet.mockRejectedValue(new Error('Server error'));
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it('shows empty chart state', async () => {
    mockGet.mockResolvedValue({
      success: true,
      stats: { total_requests: 0, active_apps: 0, total_apps: 0, top_apps: [] },
    });
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    expect(await screen.findByText(/no app usage data yet/i)).toBeInTheDocument();
  });

  it('renders the verification time-series heatmap', async () => {
    mockGet.mockResolvedValue({
      success: true,
      stats: { total_requests: 0, active_apps: 0, total_apps: 0, top_apps: [] },
    });
    render(<MemoryRouter><Analytics /></MemoryRouter>);

    expect(await screen.findByText('Time-Series Analytics')).toBeInTheDocument();
  });
});
