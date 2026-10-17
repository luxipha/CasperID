import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Integrations from '../../business/pages/Integrations';

const mockGetBusinessApps = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: { getBusinessApps: (...args: any[]) => mockGetBusinessApps(...args) },
}));

describe('Integrations', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state', () => {
    mockGetBusinessApps.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Integrations /></MemoryRouter>);
    expect(screen.getByText('Your Integrations')).toBeInTheDocument();
  });

  it('renders app cards when loaded', async () => {
    mockGetBusinessApps.mockResolvedValue({
      apps: [
        { app_id: '1', name: 'My App', environment: 'production', active: true, allowed_origins: ['https://example.com'], created_at: '2025-01-01' },
        { app_id: '2', name: 'Test App', environment: 'sandbox', active: false, allowed_origins: [], created_at: '2025-02-01' },
      ],
    });
    render(<MemoryRouter><Integrations /></MemoryRouter>);

    expect(await screen.findByText('My App')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('shows empty state when no apps', async () => {
    mockGetBusinessApps.mockResolvedValue({ apps: [] });
    render(<MemoryRouter><Integrations /></MemoryRouter>);

    expect(await screen.findByText(/no apps found/i)).toBeInTheDocument();
    expect(screen.getByText(/go to api management/i)).toBeInTheDocument();
  });

  it('renders environment badges', async () => {
    mockGetBusinessApps.mockResolvedValue({
      apps: [{ app_id: '1', name: 'My App', environment: 'production', active: true, allowed_origins: [], created_at: '2025-01-01' }],
    });
    render(<MemoryRouter><Integrations /></MemoryRouter>);

    expect(await screen.findByText('Active')).toBeInTheDocument();
  });

  it('renders Create New button', () => {
    mockGetBusinessApps.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Integrations /></MemoryRouter>);
    expect(screen.getByText(/create new/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockGetBusinessApps.mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><Integrations /></MemoryRouter>);

    expect(await screen.findByText('Your Integrations')).toBeInTheDocument();
  });
});
