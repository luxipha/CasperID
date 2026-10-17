import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SDKPreview from '../../business/components/SDKPreview';

describe('SDKPreview', () => {
  const defaultProps = {
    primaryColor: '#8651e1',
    borderRadius: '12',
    fontFamily: 'Inter',
    isDark: false,
  };

  it('renders welcome back text', () => {
    render(<SDKPreview {...defaultProps} />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders sign in buttons for desktop', () => {
    render(<SDKPreview {...defaultProps} platform="desktop" />);
    expect(screen.getByText(/sign in with extension/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in with otp/i)).toBeInTheDocument();
  });

  it('hides extension button on mobile', () => {
    render(<SDKPreview {...defaultProps} platform="mobile" />);
    expect(screen.queryByText(/sign in with extension/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sign in with otp/i)).toBeInTheDocument();
  });

  it('renders feature badges', () => {
    render(<SDKPreview {...defaultProps} />);
    expect(screen.getByText(/fully audited/i)).toBeInTheDocument();
    expect(screen.getByText(/non-custodial/i)).toBeInTheDocument();
  });

  it('renders Spanish translations', () => {
    render(<SDKPreview {...defaultProps} language="ES" />);
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('renders French translations', () => {
    render(<SDKPreview {...defaultProps} language="FR" />);
    expect(screen.getByText('Bon retour')).toBeInTheDocument();
  });

  it('renders German translations', () => {
    render(<SDKPreview {...defaultProps} language="DE" />);
    expect(screen.getByText('Willkommen zurück')).toBeInTheDocument();
  });

  it('displays custom logo when provided', () => {
    render(<SDKPreview {...defaultProps} logoUrl="https://example.com/logo.png" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });
});
