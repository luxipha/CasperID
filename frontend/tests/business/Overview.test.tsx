import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Overview from '../../business/pages/Overview';

const mockGetBusinessStats = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: { getBusinessStats: (...args: any[]) => mockGetBusinessStats(...args) },
}));

describe('Business Overview', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page header', () => {
    mockGetBusinessStats.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Overview /></MemoryRouter>);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('renders stats cards when data loads', async () => {
    mockGetBusinessStats.mockResolvedValue({
      success: true,
      stats: { total_verifications: 1500, active_apps: 3, total_apps: 5, activity: [] },
    });
    render(<MemoryRouter><Overview /></MemoryRouter>);

    expect(await screen.findByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
  });

  it('shows zero state when no activity', async () => {
    mockGetBusinessStats.mockResolvedValue({
      success: true,
      stats: { total_verifications: 0, active_apps: 0, total_apps: 0, activity: [] },
    });
    render(<MemoryRouter><Overview /></MemoryRouter>);

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
  });

  it('renders quick links', async () => {
    mockGetBusinessStats.mockResolvedValue({
      success: true,
      stats: { total_verifications: 0, active_apps: 0, total_apps: 0, activity: [] },
    });
    render(<MemoryRouter><Overview /></MemoryRouter>);

    expect(await screen.findByText(/manage api keys/i)).toBeInTheDocument();
    expect(screen.getByText(/configure webhooks/i)).toBeInTheDocument();
  });

  it('renders integration guide card', async () => {
    mockGetBusinessStats.mockResolvedValue({
      success: true,
      stats: { total_verifications: 0, active_apps: 0, total_apps: 0, activity: [] },
    });
    render(<MemoryRouter><Overview /></MemoryRouter>);

    expect(await screen.findByText(/integration guide/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockGetBusinessStats.mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><Overview /></MemoryRouter>);

    expect(await screen.findByText('Dashboard Overview')).toBeInTheDocument();
  });
});
