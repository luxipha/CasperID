import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Webhooks from '../../business/pages/Webhooks';

const mockGetBusinessApps = vi.fn();
const mockGetBusinessWebhooks = vi.fn();
const mockCreateBusinessWebhook = vi.fn();
const mockDeleteBusinessWebhook = vi.fn();
const mockTestBusinessWebhook = vi.fn();
const mockGetBusinessWebhookLogs = vi.fn();

vi.mock('../../services/api', () => ({
  apiService: {
    getBusinessApps: (...args: any[]) => mockGetBusinessApps(...args),
    getBusinessWebhooks: (...args: any[]) => mockGetBusinessWebhooks(...args),
    createBusinessWebhook: (...args: any[]) => mockCreateBusinessWebhook(...args),
    deleteBusinessWebhook: (...args: any[]) => mockDeleteBusinessWebhook(...args),
    testBusinessWebhook: (...args: any[]) => mockTestBusinessWebhook(...args),
    getBusinessWebhookLogs: (...args: any[]) => mockGetBusinessWebhookLogs(...args),
  },
}));

describe('Webhooks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows no apps state', async () => {
    mockGetBusinessApps.mockResolvedValue({ apps: [] });
    render(<MemoryRouter><Webhooks /></MemoryRouter>);
    expect(await screen.findByText(/no apps found/i)).toBeInTheDocument();
  });

  it('renders webhook form and existing webhooks list', async () => {
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] });
    mockGetBusinessWebhooks.mockResolvedValue({
      webhooks: [{ _id: 'wh_1', url: 'https://api.test.com/hook', events: ['user.verified'], active: true, created_at: '2025-01-01' }],
    });
    render(<MemoryRouter><Webhooks /></MemoryRouter>);

    expect(await screen.findByText(/new endpoint/i)).toBeInTheDocument();
    expect(await screen.findByText(/api\.test\.com/)).toBeInTheDocument();
  });

  it('creates a webhook and shows signing secret', async () => {
    const user = userEvent.setup();
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] });
    mockGetBusinessWebhooks.mockResolvedValue({ webhooks: [] });
    mockCreateBusinessWebhook.mockResolvedValue({
      success: true,
      webhook: { _id: 'wh_2', signing_secret: 'sec_abc123' },
    });
    render(<MemoryRouter><Webhooks /></MemoryRouter>);

    await screen.findByText(/new endpoint/i);
    await user.type(screen.getByPlaceholderText(/https:\/\/api/i), 'https://myapp.com/webhook');
    await user.click(screen.getByText(/save endpoint/i));

    await waitFor(() => {
      expect(mockCreateBusinessWebhook).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://myapp.com/webhook' })
      );
    });
    expect(await screen.findByText(/signing secret/i)).toBeInTheDocument();
    expect(screen.getByText('sec_abc123')).toBeInTheDocument();
  });

  it('shows empty webhooks state', async () => {
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] });
    mockGetBusinessWebhooks.mockResolvedValue({ webhooks: [] });
    render(<MemoryRouter><Webhooks /></MemoryRouter>);

    expect(await screen.findByText(/no data/i)).toBeInTheDocument();
  });

  it('shows logs modal with stats', async () => {
    const user = userEvent.setup();
    mockGetBusinessApps.mockResolvedValue({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] });
    mockGetBusinessWebhooks.mockResolvedValue({
      webhooks: [{ _id: 'wh_1', url: 'https://api.test.com/hook', events: ['user.verified'], active: true, created_at: '2025-01-01' }],
    });
    mockGetBusinessWebhookLogs.mockResolvedValue({
      success: true,
      logs: [{ _id: 'log_1', event_type: 'user.verified', status: 'success', status_code: 200, duration_ms: 120, delivery_id: 'del_1', created_at: '2025-01-01T00:00:00Z' }],
      stats: { success: { count: 1, avg_duration: 120 }, failed: { count: 0, avg_duration: 0 }, total: 1 },
    });
    render(<MemoryRouter><Webhooks /></MemoryRouter>);

    await screen.findByText(/new endpoint/i);
    await user.click(screen.getByTitle(/view delivery logs/i));

    expect(await screen.findByText(/delivery logs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/user\.verified/).length).toBeGreaterThan(0);
  });

  it('handles API error gracefully', async () => {
    mockGetBusinessApps.mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><Webhooks /></MemoryRouter>);

    expect(await screen.findByText(/webhooks & events/i)).toBeInTheDocument();
  });
});
