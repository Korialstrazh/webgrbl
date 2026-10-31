import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { Toggle } from '.';

const TOGGLE_LABEL = 'Air assist';
const CHECKBOX_ROLE = 'checkbox';

describe(Toggle.name, () => {
  it('reports the new checked state', () => {
    const onChange: Mock<(isChecked: boolean) => void> = vi.fn<(isChecked: boolean) => void>();

    render(<Toggle label={TOGGLE_LABEL} isChecked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole(CHECKBOX_ROLE, { name: TOGGLE_LABEL }));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects the checked and disabled props', () => {
    render(<Toggle label={TOGGLE_LABEL} isChecked isDisabled onChange={vi.fn()} />);

    expect(screen.getByRole(CHECKBOX_ROLE, { name: TOGGLE_LABEL })).toBeChecked();
    expect(screen.getByRole(CHECKBOX_ROLE, { name: TOGGLE_LABEL })).toBeDisabled();
  });
});
