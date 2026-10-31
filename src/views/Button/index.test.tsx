import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { Button } from '.';
import { BUTTON_SIZE, BUTTON_VARIANT } from './button.constants';
import type { ButtonVariant } from './button.constants';

const BUTTON_LABEL = 'Run';
const BUTTON_ROLE = 'button';
const ALL_VARIANTS: ButtonVariant[] = Object.values(BUTTON_VARIANT);

describe(Button.name, () => {
  it('gives every variant its own class', () => {
    const variantClassNames: Set<string> = new Set();

    for (const variant of ALL_VARIANTS) {
      const { unmount } = render(<Button variant={variant}>{BUTTON_LABEL}</Button>);

      variantClassNames.add(screen.getByRole(BUTTON_ROLE).className);
      unmount();
    }

    expect(variantClassNames.size).toBe(ALL_VARIANTS.length);
  });

  it('gives the large size a class of its own', () => {
    const { unmount } = render(<Button variant={BUTTON_VARIANT.PRIMARY}>{BUTTON_LABEL}</Button>);
    const regularClassName: string = screen.getByRole(BUTTON_ROLE).className;

    unmount();
    render(<Button variant={BUTTON_VARIANT.PRIMARY} size={BUTTON_SIZE.LARGE}>{BUTTON_LABEL}</Button>);

    expect(screen.getByRole(BUTTON_ROLE).className).not.toBe(regularClassName);
  });

  it('calls onClick when clicked', () => {
    const onClick: Mock<() => void> = vi.fn<() => void>();

    render(<Button variant={BUTTON_VARIANT.PRIMARY} onClick={onClick}>{BUTTON_LABEL}</Button>);
    fireEvent.click(screen.getByRole(BUTTON_ROLE));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick: Mock<() => void> = vi.fn<() => void>();

    render(<Button variant={BUTTON_VARIANT.DANGER} isDisabled onClick={onClick}>{BUTTON_LABEL}</Button>);
    fireEvent.click(screen.getByRole(BUTTON_ROLE));

    expect(screen.getByRole(BUTTON_ROLE)).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
