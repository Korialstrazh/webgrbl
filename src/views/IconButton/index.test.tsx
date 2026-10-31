import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { IconButton } from '.';

const ICON_LABEL = 'Open settings';
const ICON_TEST_ID = 'icon';
const BUTTON_ROLE = 'button';

describe(IconButton.name, () => {
  it('exposes its label as the accessible name', () => {
    render(<IconButton label={ICON_LABEL} iconComponent={<svg data-testid={ICON_TEST_ID} />} />);

    expect(screen.getByRole(BUTTON_ROLE, { name: ICON_LABEL })).toBeInTheDocument();
    expect(screen.getByTestId(ICON_TEST_ID)).toBeInTheDocument();
  });

  it('calls onClick unless disabled', () => {
    const onClick: Mock<() => void> = vi.fn<() => void>();
    const { rerender } = render(<IconButton label={ICON_LABEL} iconComponent={null} onClick={onClick} />);

    fireEvent.click(screen.getByRole(BUTTON_ROLE));
    rerender(<IconButton label={ICON_LABEL} iconComponent={null} onClick={onClick} isDisabled />);
    fireEvent.click(screen.getByRole(BUTTON_ROLE));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
