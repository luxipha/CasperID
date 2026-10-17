import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityHeatmap from '../../business/components/ActivityHeatmap';

describe('ActivityHeatmap', () => {
  it('renders title and subtitle', () => {
    render(<ActivityHeatmap title="Activity" subtitle="Last 6 months" />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Last 6 months')).toBeInTheDocument();
  });

  it('renders default title when not provided', () => {
    render(<ActivityHeatmap />);
    expect(screen.getByText('Activity Overview')).toBeInTheDocument();
  });

  it('renders month labels', () => {
    render(<ActivityHeatmap data={[]} />);
    expect(screen.getByText('Sep')).toBeInTheDocument();
    expect(screen.getByText('Oct')).toBeInTheDocument();
    expect(screen.getByText('Nov')).toBeInTheDocument();
  });

  it('renders day labels', () => {
    render(<ActivityHeatmap />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<ActivityHeatmap />);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('renders with activity data', () => {
    const data = [
      { date: '2025-01-15', count: 5 },
      { date: '2025-01-16', count: 12 },
    ];
    render(<ActivityHeatmap data={data} />);
    expect(screen.getByText('Activity Overview')).toBeInTheDocument();
  });
});
