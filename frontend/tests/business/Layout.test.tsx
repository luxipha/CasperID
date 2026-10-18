import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../business/components/Layout';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { display_name: 'Test User', email: 'test@company.com', cns_name: 'testuser' },
  }),
}));

describe('Business Layout', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders sidebar with all nav items', () => {
    render(
      <MemoryRouter initialEntries={['/business']}>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('SDK Design')).toBeInTheDocument();
    expect(screen.getByText('API Management')).toBeInTheDocument();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows user profile from AuthContext', () => {
    render(
      <MemoryRouter initialEntries={['/business']}>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@company.com')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <MemoryRouter initialEntries={['/business']}>
        <Layout><div data-testid="test-content">Page Content</div></Layout>
      </MemoryRouter>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(
      <MemoryRouter initialEntries={['/business']}>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    );
    const notificationBtn = screen.getByText(/notifications/i);
    expect(notificationBtn).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(
      <MemoryRouter initialEntries={['/business']}>
        <Layout><div>Content</div></Layout>
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/search apps/i)).toBeInTheDocument();
  });
});
