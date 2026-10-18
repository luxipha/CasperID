import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Billing from '../../business/pages/Billing';

const mockGet = vi.fn();
vi.mock('../../services/api', () => ({
  apiService: { get: (...args: any[]) => mockGet(...args) },
}));

describe('Billing', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders current plan card', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Billing /></MemoryRouter>);
    expect(screen.getByText(/current plan/i)).toBeInTheDocument();
    expect(screen.getByText(/developer access/i)).toBeInTheDocument();
  });

  it('renders usage metrics', async () => {
    mockGet.mockResolvedValue({
      success: true,
      stats: { total_requests: 1500, active_apps: 2, total_apps: 3, top_apps: [] },
    });
    render(<MemoryRouter><Billing /></MemoryRouter>);

    expect(await screen.findByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders upcoming plans preview', async () => {
    mockGet.mockResolvedValue({
      success: true,
      stats: { total_requests: 0, active_apps: 0, total_apps: 0, top_apps: [] },
    });
    render(<MemoryRouter><Billing /></MemoryRouter>);

    expect(await screen.findByText(/upcoming plans/i)).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('shows free beta badge', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<MemoryRouter><Billing /></MemoryRouter>);
    expect(screen.getByText(/free beta/i)).toBeInTheDocument();
  });
});
