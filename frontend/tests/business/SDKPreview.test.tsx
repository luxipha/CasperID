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

  it('renders the hosted authorization request', () => {
    render(<SDKPreview {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Authorize Your application' })).toBeInTheDocument();
  });

  it('renders hosted authorization actions for desktop', () => {
    render(<SDKPreview {...defaultProps} platform="desktop" />);
    expect(screen.getByText('Desktop popup preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue securely' })).toBeInTheDocument();
  });

  it('hides extension button on mobile', () => {
    render(<SDKPreview {...defaultProps} platform="mobile" />);
    expect(screen.queryByText(/sign in with extension/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue securely' })).toBeInTheDocument();
  });

  it('renders feature badges', () => {
    render(<SDKPreview {...defaultProps} />);
    expect(screen.getByText('Confirm your CasperID identity')).toBeInTheDocument();
    expect(screen.getByText('Share your verification result')).toBeInTheDocument();
  });

  it('renders Spanish translations', () => {
    render(<SDKPreview {...defaultProps} language="ES" />);
    expect(screen.getByText('Autorizar Your application')).toBeInTheDocument();
  });

  it('renders French translations', () => {
    render(<SDKPreview {...defaultProps} language="FR" />);
    expect(screen.getByText('Autoriser Your application')).toBeInTheDocument();
  });

  it('renders German translations', () => {
    render(<SDKPreview {...defaultProps} language="DE" />);
    expect(screen.getByText('Autorisieren Your application')).toBeInTheDocument();
  });

  it('displays custom logo when provided', () => {
    render(<SDKPreview {...defaultProps} logoUrl="https://example.com/logo.png" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });
});
