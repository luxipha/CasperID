import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SDKDesign from '../../business/pages/SDKDesign';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SDKDesign', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFetch.mockReset(); mockFetch.mockResolvedValue({ ok: true, json: async () => ({ apps: [] }) }); });

  it('shows page header', () => {
    render(<SDKDesign />);
    expect(screen.getByText('Hosted Flow Design Studio')).toBeInTheDocument();
  });

  it('shows no apps message when empty', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ apps: [] }) });
    render(<SDKDesign />);
    expect(await screen.findByText(/no apps yet/i)).toBeInTheDocument();
  });

  it('shows app selector and loads config', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, sdk_config: { primary_color: '#ff0000', border_radius: '16', font_family: 'Roboto' } }) });

    render(<SDKDesign />);
    expect(await screen.findByText('Hosted Flow Design Studio')).toBeInTheDocument();
    // Wait for the hex color input to appear with the loaded value
    const els = await screen.findAllByDisplayValue('#ff0000', {}, { timeout: 3000 });
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it('saves config with PATCH request', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, sdk_config: {} }) })
      .mockResolvedValueOnce({ ok: true });

    render(<SDKDesign />);
    expect(await screen.findByText('Hosted Flow Design Studio')).toBeInTheDocument();

    await user.click(screen.getByText(/save config/i));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/business/apps/1/sdk-config'),
        expect.objectContaining({ method: 'PATCH' })
      );
    }, { timeout: 5000 });
  });

  it('renders config code preview', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ apps: [{ app_id: '1', name: 'Test App', environment: 'sandbox' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, sdk_config: {} }) });

    render(<SDKDesign />);
    expect(await screen.findByText('Hosted Flow Design Studio')).toBeInTheDocument();

    expect(screen.getByText(/clientId=/i)).toBeInTheDocument();
  });
});
