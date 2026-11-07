import { fireEvent, render, screen } from '@testing-library/react';
import { Segmented } from 'antd';
import type { SegmentedProps } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';

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
const OPTIONS: SegmentedProps<string>['options'] = [
  { value: MILLIMETRE_VALUE, label: MILLIMETRE_LABEL },
  { value: INCH_VALUE, label: INCH_LABEL },
  { value: PIXEL_VALUE, label: PIXEL_LABEL },
];

const ControlledSegmented = (): ReactNode => {
  const [selectedValue, setSelectedValue] = useState<string>(PIXEL_VALUE);

  return <Segmented aria-label={GROUP_LABEL} options={OPTIONS} value={selectedValue} onChange={setSelectedValue} />;
};

// Upgrade guard with no subject in src: antd Segmented replaced the self-built SegmentedControl, and these tests fail
// when an antd upgrade changes the radio-group keyboard behaviour the app relies on.
describe('antd upgrade guard: Segmented keyboard behaviour', () => {
  it('is a radio group named by aria-label, with one tab stop for its options', () => {
    render(<ControlledSegmented />);

    const radios: HTMLInputElement[] = screen.getAllByRole<HTMLInputElement>(RADIO_ROLE);
    const groupNames: Set<string> = new Set(radios.map((radio: HTMLInputElement) => radio.name));

    expect(screen.getByRole('radiogroup', { name: GROUP_LABEL })).toBeInTheDocument();
    expect(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL })).toBeChecked();
    expect(groupNames.size).toBe(1);
  });

  it('moves the selection with the arrow keys and wraps around', () => {
    render(<ControlledSegmented />);

    fireEvent.keyDown(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL }), { key: ARROW_RIGHT_KEY });

    expect(screen.getByRole(RADIO_ROLE, { name: MILLIMETRE_LABEL })).toBeChecked();

    fireEvent.keyDown(screen.getByRole(RADIO_ROLE, { name: MILLIMETRE_LABEL }), { key: ARROW_LEFT_KEY });

    expect(screen.getByRole(RADIO_ROLE, { name: PIXEL_LABEL })).toBeChecked();
  });

  it('selects an option on click', () => {
    render(<ControlledSegmented />);

    fireEvent.click(screen.getByRole(RADIO_ROLE, { name: INCH_LABEL }));

    expect(screen.getByRole(RADIO_ROLE, { name: INCH_LABEL })).toBeChecked();
  });

  it('takes a tabIndex on its group box, so only the checked option stays a tab stop', () => {
    render(<Segmented aria-label={GROUP_LABEL} options={OPTIONS} value={PIXEL_VALUE} tabIndex={-1} />);

    expect(screen.getByRole('radiogroup', { name: GROUP_LABEL })).toHaveAttribute('tabindex', '-1');
  });
});
