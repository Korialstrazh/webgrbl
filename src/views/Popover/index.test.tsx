import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Popover } from '.';

const ANCHOR_LABEL = 'Laser options';
const BODY_TEXT = 'Popover body';

describe(Popover.name, () => {
  it('renders nothing while closed', () => {
    render(<Popover isOpen={false} anchorLabel={ANCHOR_LABEL} onClose={vi.fn()}>{BODY_TEXT}</Popover>);

    expect(screen.queryByText(BODY_TEXT)).not.toBeInTheDocument();
  });

  it('shows its content labelled by the anchor label', () => {
    render(<Popover isOpen anchorLabel={ANCHOR_LABEL} onClose={vi.fn()}>{BODY_TEXT}</Popover>);

    expect(screen.getByRole('dialog', { name: ANCHOR_LABEL })).toHaveTextContent(BODY_TEXT);
  });

  it('calls onClose on Escape and keeps the key from reaching the window', () => {
    const onClose = vi.fn();
    const onWindowKeyDown = vi.fn();
    window.addEventListener('keydown', onWindowKeyDown);
    render(<Popover isOpen anchorLabel={ANCHOR_LABEL} onClose={onClose}>{BODY_TEXT}</Popover>);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    window.removeEventListener('keydown', onWindowKeyDown);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onWindowKeyDown).not.toHaveBeenCalled();
  });
});
