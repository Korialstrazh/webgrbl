import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { usePopoverFocusReturn } from './use.popover.focus.return';

const OPENER_LABEL = 'Open settings';
const OTHER_LABEL = 'Other control';

interface FocusReturningPopoverProps {
  isPopoverOpen: boolean;
}

const FocusReturningPopover = ({ isPopoverOpen }: FocusReturningPopoverProps): ReactNode => {
  usePopoverFocusReturn(isPopoverOpen);

  return (
    <>
      <button type="button">{OPENER_LABEL}</button>
      <button type="button">{OTHER_LABEL}</button>
    </>
  );
};

const getButton = (labelText: string): HTMLElement => {
  const button: HTMLElement | undefined = Array.from(document.querySelectorAll('button')).find(
    (element: HTMLButtonElement) => element.textContent === labelText,
  );

  if (!button) {
    throw new Error(`No button ${labelText}.`);
  }

  return button;
};

const waitOneFrame = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve: () => void) => {
      requestAnimationFrame(() => resolve());
    });
  });
};

describe(usePopoverFocusReturn.name, () => {
  it('gives the focus back to the opener when the popover closes with the focus left on the body', async () => {
    const { rerender } = render(<FocusReturningPopover isPopoverOpen={false} />);

    getButton(OPENER_LABEL).focus();
    rerender(<FocusReturningPopover isPopoverOpen />);
    getButton(OPENER_LABEL).blur();
    rerender(<FocusReturningPopover isPopoverOpen={false} />);
    await waitOneFrame();

    expect(getButton(OPENER_LABEL)).toHaveFocus();
  });

  it('leaves the focus on a control the user moved to', async () => {
    const { rerender } = render(<FocusReturningPopover isPopoverOpen={false} />);

    getButton(OPENER_LABEL).focus();
    rerender(<FocusReturningPopover isPopoverOpen />);
    getButton(OTHER_LABEL).focus();
    rerender(<FocusReturningPopover isPopoverOpen={false} />);
    await waitOneFrame();

    expect(getButton(OTHER_LABEL)).toHaveFocus();
  });
});
