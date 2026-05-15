import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with auto label', () => {
    render(<ProgressBar current={3} total={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps current to total when over', () => {
    render(<ProgressBar current={20} total={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');
  });

  it('uses provided label', () => {
    render(<ProgressBar current={5} total={11} label="Halfway there" />);
    expect(screen.getByText(/Halfway there/i)).toBeInTheDocument();
  });
});
