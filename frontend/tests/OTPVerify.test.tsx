import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OTPVerify } from '../components/OTPVerify';

const mockVerifyOTP = vi.fn();
const mockResendOTP = vi.fn();
vi.mock('../services/api', () => ({
  apiService: {
    verifyOTP: (...args: any[]) => mockVerifyOTP(...args),
    resendOTP: (...args: any[]) => mockResendOTP(...args),
  },
}));

describe('OTPVerify', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders 6 digit inputs and masked email', () => {
    render(<OTPVerify email="test@example.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it('enables verify button only when all digits entered', async () => {
    const user = userEvent.setup();
    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    const verifyBtn = screen.getByRole('button', { name: /verify & continue/i });

    expect(verifyBtn).toBeDisabled();
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], `${i}`);
    }
    expect(verifyBtn).not.toBeDisabled();
  });

  it('calls onSuccess on valid OTP', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockVerifyOTP.mockResolvedValue({ success: true });

    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={onSuccess} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) await user.type(inputs[i], `${i}`);
    await user.click(screen.getByRole('button', { name: /verify & continue/i }));

    await waitFor(() => {
      expect(mockVerifyOTP).toHaveBeenCalledWith('vid_1', '012345');
      expect(onSuccess).toHaveBeenCalledWith('test@test.com');
    });
  });

  it('shows error on invalid OTP', async () => {
    const user = userEvent.setup();
    mockVerifyOTP.mockResolvedValue({ success: false, error: 'Invalid code. 2 attempts left.' });

    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) await user.type(inputs[i], `${i}`);
    await user.click(screen.getByRole('button', { name: /verify & continue/i }));

    expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
  });

  it('shows network error message', async () => {
    const user = userEvent.setup();
    mockVerifyOTP.mockRejectedValue(new Error('Network error'));

    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');

    for (let i = 0; i < 6; i++) await user.type(inputs[i], `${i}`);
    await user.click(screen.getByRole('button', { name: /verify & continue/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it('shows resend link after timer expires', async () => {
    vi.useFakeTimers();
    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/resend code in/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(60000); });

    await vi.waitFor(() => {
      expect(screen.queryByText(/resend code now/i)).toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  it('resends OTP and resets timer', async () => {
    vi.useFakeTimers();
    mockResendOTP.mockResolvedValue({ success: true });
    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={vi.fn()} />);

    act(() => { vi.advanceTimersByTime(60000); });

    const { fireEvent } = await import('@testing-library/react');
    const resendBtn = screen.getByText(/resend code now/i);
    fireEvent.click(resendBtn);

    await vi.waitFor(() => {
      expect(mockResendOTP).toHaveBeenCalledWith('vid_1');
    });
    expect(screen.getByText(/resend code in 59s/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn();
    render(<OTPVerify email="test@test.com" verificationId="vid_1" onSuccess={vi.fn()} onBack={onBack} />);

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText(/change email/i));

    expect(onBack).toHaveBeenCalled();
  });
});
