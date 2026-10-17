import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthEntry } from '../components/AuthEntry';

const mockSendOTP = vi.fn();
vi.mock('../services/api', () => ({
  apiService: { sendOTP: (...args: any[]) => mockSendOTP(...args) },
}));

// Mock the login function from AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe('AuthEntry', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders email input and submit button', () => {
    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);
    expect(screen.getByPlaceholderText(/name@company/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument();
  });

  it('disables submit when email is empty', () => {
    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);
    expect(screen.getByRole('button', { name: /continue with email/i })).toBeDisabled();
  });

  it('calls onEmailSubmit for new user flow', async () => {
    const user = userEvent.setup();
    mockSendOTP.mockResolvedValue({ success: true, verificationId: 'vid_123' });
    const onEmailSubmit = vi.fn();

    render(<AuthEntry onEmailSubmit={onEmailSubmit} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/name@company/i), 'new@user.com');
    await user.click(screen.getByRole('button', { name: /continue with email/i }));

    await waitFor(() => {
      expect(mockSendOTP).toHaveBeenCalledWith('new@user.com');
      expect(onEmailSubmit).toHaveBeenCalledWith('new@user.com', 'vid_123');
    });
  });

  it('shows spinner while loading', async () => {
    const user = userEvent.setup();
    mockSendOTP.mockImplementation(() => new Promise(() => {}));

    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/name@company/i), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /continue with email/i }));

    expect(await screen.findByText(/sending/i)).toBeInTheDocument();
  });

  it('shows error banner on API failure', async () => {
    const user = userEvent.setup();
    mockSendOTP.mockResolvedValue({ success: false, error: 'Rate limited. Try again.' });

    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/name@company/i), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /continue with email/i }));

    expect(await screen.findByText(/rate limited/i)).toBeInTheDocument();
  });

  it('shows error on network failure', async () => {
    const user = userEvent.setup();
    mockSendOTP.mockRejectedValue(new Error('Network request failed'));

    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/name@company/i), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /continue with email/i }));

    expect(await screen.findByText(/network request failed/i)).toBeInTheDocument();
  });

  it('renders branded header with appLogo and appName', () => {
    render(
      <AuthEntry
        onEmailSubmit={vi.fn()}
        onReturningUser={vi.fn()}
        onBiometricLogin={vi.fn()}
        appLogo="https://example.com/logo.png"
        appName="MyApp"
      />
    );
    expect(screen.getByText('Authorize')).toBeInTheDocument();
    expect(screen.getByText('MyApp')).toBeInTheDocument();
  });

  it('renders disabled SSO buttons', () => {
    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);
    const ssoButtons = screen.getAllByRole('button').filter(b => b.textContent?.match(/Google|Apple/));
    ssoButtons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('enables button when email is entered', async () => {
    const user = userEvent.setup();
    render(<AuthEntry onEmailSubmit={vi.fn()} onReturningUser={vi.fn()} onBiometricLogin={vi.fn()} />);

    const btn = screen.getByRole('button', { name: /continue with email/i });
    expect(btn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/name@company/i), 'a@b.com');
    expect(btn).not.toBeDisabled();
  });
});
