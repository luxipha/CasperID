import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import APIManagement from '../../business/pages/APIManagement';

const mockGetBusinessApps = vi.fn();
const mockCreateBusinessApp = vi.fn();
const mockRotateBusinessAppKey = vi.fn();
const mockDeleteBusinessApp = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: {
    getBusinessApps: (...args: any[]) => mockGetBusinessApps(...args),
    createBusinessApp: (...args: any[]) => mockCreateBusinessApp(...args),
    rotateBusinessAppKey: (...args: any[]) => mockRotateBusinessAppKey(...args),
    deleteBusinessApp: (...args: any[]) => mockDeleteBusinessApp(...args),
  },
}));

describe('APIManagement', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state', () => {
    mockGetBusinessApps.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><APIManagement /></MemoryRouter>);
    expect(screen.getByText('API Management')).toBeInTheDocument();
  });

  it('renders apps list and credentials', async () => {
    mockGetBusinessApps.mockResolvedValue({
      apps: [{ app_id: 'app_123', name: 'My App', environment: 'sandbox', allowed_origins: ['https://example.com'], request_count: 50, last_used_at: null, created_at: '2025-01-01' }],
    });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    expect(await screen.findByText('My App')).toBeInTheDocument();
    expect(screen.getAllByText(/app_123/).length).toBeGreaterThan(0);
  });

  it('shows empty state when no apps', async () => {
    mockGetBusinessApps.mockResolvedValue({ apps: [] });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    expect(await screen.findByText(/no apps yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create first app/i)).toBeInTheDocument();
  });

  it('opens create app modal', async () => {
    const user = userEvent.setup();
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: 'app_123', name: 'My App', environment: 'sandbox', allowed_origins: [], request_count: 0, last_used_at: null, created_at: '2025-01-01' }] });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    await screen.findByText('My App');
    await user.click(screen.getByText(/new app/i));

    expect(screen.getByText(/new application/i)).toBeInTheDocument();
  });

  it('creates a new app', async () => {
    const user = userEvent.setup();
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: 'app_123', name: 'My App', environment: 'sandbox', allowed_origins: [], request_count: 0, last_used_at: null, created_at: '2025-01-01' }] });
    mockCreateBusinessApp.mockResolvedValue({ success: true, api_secret: 'secret_abc' });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    await screen.findByText('My App');
    await user.click(screen.getByText(/new app/i));

    await user.type(screen.getByPlaceholderText(/my restaurant/i), 'New App');
    await user.click(screen.getByRole('button', { name: /create app/i }));

    await waitFor(() => {
      expect(mockCreateBusinessApp).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New App' })
      );
    });
    expect(await screen.findByText(/save your api secret/i)).toBeInTheDocument();
  });

  it('displays usage stats', async () => {
    mockGetBusinessApps.mockResolvedValue({
      apps: [{ app_id: 'app_123', name: 'My App', environment: 'production', allowed_origins: [], request_count: 50, last_used_at: null, created_at: '2025-01-01' }],
    });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    expect(await screen.findByText('50')).toBeInTheDocument();
  });

  it('opens upgrade plan modal', async () => {
    const user = userEvent.setup();
    mockGetBusinessApps.mockResolvedValue({
      apps: [{ app_id: 'app_123', name: 'My App', environment: 'sandbox', allowed_origins: [], request_count: 0, last_used_at: null, created_at: '2025-01-01' }],
    });
    render(<MemoryRouter><APIManagement /></MemoryRouter>);

    await screen.findByText('My App');
    await user.click(screen.getByText(/upgrade plan/i));

    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });
});
