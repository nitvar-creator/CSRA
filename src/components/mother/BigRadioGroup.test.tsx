import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BigRadioGroup from './BigRadioGroup';

describe('BigRadioGroup', () => {
  const options = [
    { value: 'yes', label: 'Yes', tone: 'neutral' as const },
    { value: 'no', label: 'No', tone: 'neutral' as const },
  ];

  it('renders all options', () => {
    render(<BigRadioGroup name="t" value="" onChange={() => {}} options={options} />);
    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('marks selected value as checked', () => {
    render(<BigRadioGroup name="t" value="yes" onChange={() => {}} options={options} />);
    expect((screen.getByLabelText('Yes') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('No') as HTMLInputElement).checked).toBe(false);
  });

  it('calls onChange with the clicked value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BigRadioGroup name="t" value="" onChange={onChange} options={options} />);
    await user.click(screen.getByLabelText('Yes'));
    expect(onChange).toHaveBeenCalledWith('yes');
  });
});
