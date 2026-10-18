import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import IntegrationDetail from '../../business/pages/IntegrationDetail';

const mockGet = vi.fn();
const mockPatch = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
  },
}));

function renderIntegrationDetail() {
  return render(
    <MemoryRouter initialEntries={['/business/integrations/app_123']}>
      <Routes>
        <Route path="/business/integrations/:id" element={<IntegrationDetail />} />
        <Route path="/business/integrations" element={<div>Integrations List</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('IntegrationDetail', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders app configuration form', async () => {
    mockGet.mockResolvedValue({
      success: true,
      app: { app_id: 'app_123', name: 'My App', environment: 'sandbox', active: true, allowed_origins: [], sdk_config: { requiredTier: 'L2', proofs: ['liveness', 'email'] } },
    });
    renderIntegrationDetail();

    expect(await screen.findByDisplayValue('My App')).toBeInTheDocument();
    expect(screen.getByText('App Configuration')).toBeInTheDocument();
    expect(screen.getByText('Verification Requirements')).toBeInTheDocument();
  });

  it('shows error when app not found', async () => {
    mockGet.mockResolvedValue({ success: false });
    renderIntegrationDetail();
    expect(await screen.findByText(/app not found/i)).toBeInTheDocument();
  });

  it('shows API error message', async () => {
    mockGet.mockRejectedValue(new Error('Failed to fetch'));
    renderIntegrationDetail();
    expect(await screen.findByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('saves changes on button click', async () => {
    mockGet.mockResolvedValue({
      success: true,
      app: { app_id: 'app_123', name: 'My App', environment: 'sandbox', active: true, allowed_origins: [], sdk_config: { requiredTier: 'L2', proofs: [] } },
    });
    mockPatch.mockResolvedValue({ success: true });

    renderIntegrationDetail();
    await screen.findByDisplayValue('My App');
    fireEvent.click(screen.getByText(/save changes/i));

    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
  });

  it('toggles verification tier', async () => {
    mockGet.mockResolvedValue({
      success: true,
      app: { app_id: 'app_123', name: 'My App', environment: 'sandbox', active: true, allowed_origins: [], sdk_config: { requiredTier: 'L2', proofs: [] } },
    });
    mockPatch.mockResolvedValue({ success: true });

    renderIntegrationDetail();
    await screen.findByText('L2');
    fireEvent.click(screen.getByText('L3'));
    fireEvent.click(screen.getByText(/save changes/i));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        expect.stringContaining('/api/business/apps/app_123'),
        expect.objectContaining({ sdk_config: expect.objectContaining({ requiredTier: 'L3' }) })
      );
    });
  });

  it('opens redirect URL modal', async () => {
    mockGet.mockResolvedValue({
      success: true,
      app: { app_id: 'app_123', name: 'My App', environment: 'sandbox', active: true, allowed_origins: [], sdk_config: {} },
    });

    renderIntegrationDetail();
    await screen.findByText('OAuth Redirect URIs');
    fireEvent.click(screen.getByRole('button', { name: /add url/i }));

    expect(screen.getByText(/add oauth redirect uri/i)).toBeInTheDocument();
  });
});
