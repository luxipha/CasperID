import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AdminDashboard from '../admin/dashboard';

const mockLoginAdmin = vi.fn();
const mockGetVerificationRequests = vi.fn();
vi.mock('../services/api', () => ({
  apiClient: {
    loginAdmin: (...args: any[]) => mockLoginAdmin(...args),
    getVerificationRequests: (...args: any[]) => mockGetVerificationRequests(...args),
  },
}));

describe('AdminDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows login form when not authenticated', () => {
    render(<AdminDashboard />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin password/i)).toBeInTheDocument();
  });

  it('calls login API on form submit', async () => {
    mockLoginAdmin.mockResolvedValue({ token: 'admin_token_123' });
    mockGetVerificationRequests.mockResolvedValue({ requests: [] });

    render(<AdminDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/admin password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLoginAdmin).toHaveBeenCalledWith('admin', 'secret');
    }, { timeout: 8000 });
  });

  it('renders requests list after login', async () => {
    mockLoginAdmin.mockResolvedValue({ token: 'tok' });
    mockGetVerificationRequests.mockResolvedValue({
      requests: [
        { id: '1', tier: 'layer_3', status: 'pending', email: 'user@test.com', wallet: '0x123', created_at: '2025-01-01', updated_at: '2025-01-01' },
      ],
    });

    render(<AdminDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/admin password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/0x123/)).toBeInTheDocument();
  });

  it('shows empty state when no requests', async () => {
    mockLoginAdmin.mockResolvedValue({ token: 'tok' });
    mockGetVerificationRequests.mockResolvedValue({ requests: [] });

    render(<AdminDashboard />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/admin password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/no requests found/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
