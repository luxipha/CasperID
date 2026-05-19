import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SDK Login Screen', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders email input and continue button', () => {
    render(<Login onNext={vi.fn()} />);
    expect(screen.getByPlaceholderText(/name@example/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('validates invalid email format', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Login onNext={onNext} />);

    await user.type(screen.getByPlaceholderText(/name@example/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('calls onNext with email and verificationId on success', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, verificationId: 'vid_123' }),
    });

    render(<Login onNext={onNext} apiBaseUrl="https://api.test.com" />);

    await user.type(screen.getByPlaceholderText(/name@example/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/auth/send-otp',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com'),
        })
      );
      expect(onNext).toHaveBeenCalledWith('test@example.com', 'vid_123');
    });
  });

  it('shows error on API failure', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: 'Rate limited' }),
    });

    render(<Login onNext={vi.fn()} onError={onError} apiBaseUrl="https://api.test.com" />);

    await user.type(screen.getByPlaceholderText(/name@example/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Rate limited');
    });
  });

  it('shows sending code text while loading', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<Login onNext={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/name@example/i), 'test@test.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/sending code/i)).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<Login onNext={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/please enter your email/i)).toBeInTheDocument();
  });

  it('uses preview mode with mock delay', async () => {
    const onNext = vi.fn();
    render(<Login onNext={onNext} previewMode={true} />);

    // Manually trigger the email and button click using fireEvent
    const input = screen.getByPlaceholderText(/name@example/i);
    const btn = screen.getByRole('button', { name: /continue/i });

    // Use fireEvent to avoid timer conflicts
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { value: 'test@test.com' } });
    vi.useFakeTimers();
    fireEvent.click(btn);
    expect(onNext).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    await vi.waitFor(() => {
      expect(onNext).toHaveBeenCalledWith('test@test.com', 'mock-v-id-123456789');
    });
    vi.useRealTimers();
  });
});
