import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DecimalNumberInput } from '.';

const typeIntoField = (typedText: string): ReturnType<typeof vi.fn> => {
  const changeHandler = vi.fn();

  render(<DecimalNumberInput aria-label="Width" onChange={changeHandler} />);
  fireEvent.change(screen.getByLabelText('Width'), { target: { value: typedText } });

  return changeHandler;
};

describe('DecimalNumberInput', () => {
  it('takes a comma as the decimal mark', () => {
    expect(typeIntoField('12,5')).toHaveBeenLastCalledWith(12.5);
  });

  it('takes a dot as the decimal mark', () => {
    expect(typeIntoField('12.5')).toHaveBeenLastCalledWith(12.5);
  });

  it('leaves a cleared field empty rather than 0', () => {
    const changeHandler = vi.fn();

    render(<DecimalNumberInput aria-label="Width" defaultValue={3} onChange={changeHandler} />);
    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '' } });

    expect(changeHandler).toHaveBeenLastCalledWith(null);
  });
});
