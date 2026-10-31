import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { SegmentedControl } from '.';
import type { SegmentedOption } from './interfaces/SegmentedOption';

const GROUP_LABEL = 'Unit';
const MILLIMETRE_VALUE = 'mm';
const INCH_VALUE = 'in';
const PIXEL_VALUE = 'px';
const MILLIMETRE_LABEL = 'Millimetres';
const INCH_LABEL = 'Inches';
const PIXEL_LABEL = 'Pixels';
const RADIO_ROLE = 'radio';
const ARROW_RIGHT_KEY = 'ArrowRight';
const ARROW_LEFT_KEY = 'ArrowLeft';
const OPTIONS: SegmentedOption[] = [
  { value: MILLIMETRE_VALUE, label: MILLIMETRE_LABEL },
  { value: INCH_VALUE, label: INCH_LABEL },
  { value: PIXEL_VALUE, label: PIXEL_LABEL },
];

const renderControl = (selectedValue: string, onSelect: (value: string) => void, isDisabled?: boolean): void => {
  render(
    <SegmentedControl
      label={GROUP_LABEL}
      options={OPTIONS}
      selectedValue={selectedValue}
      onSelect={onSelect}
      isDisabled={isDisabled}
    />,
  );
};

describe(SegmentedControl.name, () => {
  it('exposes a labelled radio group with the selected option checked', () => {
    renderControl(INCH_VALUE, vi.fn());

    expect(screen.getByRole('radiogroup', { name: GROUP_LABEL })).toBeInTheDocument();
    expect(screen.getByRole(RADIO_ROLE, { name: INCH_LABEL })).toBeChecked();
    expect(screen.getByRole(RADIO_ROLE, { name: MILLIMETRE_LABEL })).not.toBeChecked();
  });

  it('selects an option on click', () => {
    const onSelect: Mock<(value: string) => void> = vi.fn<(value: string) => void>();

    renderControl(MILLIMETRE_VALUE, onSelect);
    fireEvent.click(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL }));

    expect(onSelect).toHaveBeenCalledWith(PIXEL_VALUE);
  });

  it('moves the selection with the arrow keys and wraps around', () => {
    const onSelect: Mock<(value: string) => void> = vi.fn<(value: string) => void>();

    renderControl(PIXEL_VALUE, onSelect);
    fireEvent.keyDown(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL }), { key: ARROW_RIGHT_KEY });
    fireEvent.keyDown(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL }), { key: ARROW_LEFT_KEY });

    expect(onSelect).toHaveBeenNthCalledWith(1, MILLIMETRE_VALUE);
    expect(onSelect).toHaveBeenNthCalledWith(2, INCH_VALUE);
  });

  it('selects nothing when disabled', () => {
    const onSelect: Mock<(value: string) => void> = vi.fn<(value: string) => void>();

    renderControl(MILLIMETRE_VALUE, onSelect, true);
    fireEvent.click(screen.getByRole(RADIO_ROLE, { name: INCH_LABEL }));
    fireEvent.keyDown(screen.getByRole(RADIO_ROLE, { name: MILLIMETRE_LABEL }), { key: ARROW_RIGHT_KEY });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
