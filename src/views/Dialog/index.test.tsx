import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '.';

const DIALOG_TITLE = 'Confirm action';
const OPENER_LABEL = 'Open dialog';
const FIRST_LABEL = 'First';
const LAST_LABEL = 'Last';
const FOOTER_LABEL = 'Footer action';

interface DialogHarnessProps {
  onClose: () => void;
}

const DialogHarness = ({ onClose }: DialogHarnessProps): ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>{OPENER_LABEL}</button>
      <Dialog
        isOpen={isOpen}
        title={DIALOG_TITLE}
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
        footerComponent={<button type="button">{FOOTER_LABEL}</button>}
      >
        <button type="button">{FIRST_LABEL}</button>
        <button type="button">{LAST_LABEL}</button>
      </Dialog>
    </>
  );
};

const openDialog = (onClose: () => void): HTMLElement => {
  render(<DialogHarness onClose={onClose} />);
  const opener: HTMLElement = screen.getByRole('button', { name: OPENER_LABEL });
  opener.focus();
  fireEvent.click(opener);

  return opener;
};

describe(Dialog.name, () => {
  it('renders nothing while closed', () => {
    render(<Dialog isOpen={false} title={DIALOG_TITLE} onClose={vi.fn()}>body</Dialog>);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a modal dialog labelled by its title and focuses the first control', () => {
    openDialog(vi.fn());

    const dialog: HTMLElement = screen.getByRole('dialog', { name: DIALOG_TITLE });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: FIRST_LABEL })).toHaveFocus();
  });

  it('cycles Tab and Shift+Tab inside the dialog', () => {
    openDialog(vi.fn());
    const dialog: HTMLElement = screen.getByRole('dialog');
    const footerButton: HTMLElement = screen.getByRole('button', { name: FOOTER_LABEL });

    footerButton.focus();
    fireEvent.keyDown(footerButton, { key: 'Tab' });

    expect(screen.getByRole('button', { name: FIRST_LABEL })).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(footerButton).toHaveFocus();
  });

  it('calls onClose on Escape without letting the key reach the window and returns focus to the opener', () => {
    const onClose = vi.fn();
    const onWindowKeyDown = vi.fn();
    window.addEventListener('keydown', onWindowKeyDown);
    const opener: HTMLElement = openDialog(onClose);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    window.removeEventListener('keydown', onWindowKeyDown);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onWindowKeyDown).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
