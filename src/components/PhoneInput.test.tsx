import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneInput from './PhoneInput';

describe('PhoneInput', () => {
  it('shows the +91 prefix', () => {
    render(<PhoneInput name="m" value="" onChange={() => {}} />);
    expect(screen.getByText('+91')).toBeInTheDocument();
  });

  it('strips non-digit characters', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput name="m" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Mobile number'), '98abc76');
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toMatch(/^\d+$/);
  });

  it('caps input at 10 digits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput name="m" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Mobile number'), '987654321012345');
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.length).toBeLessThanOrEqual(10);
  });
});
