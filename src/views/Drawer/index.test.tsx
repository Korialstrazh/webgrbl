import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from '.';

const DRAWER_TITLE = 'Job settings';
const BED_SIDE_CLASS_NAME = 'bedSide';
const OPENER_LABEL = 'Open drawer';
const FIRST_LABEL = 'First';
const LAST_LABEL = 'Last';

interface DrawerHarnessProps {
  onClose: () => void;
}

const DrawerHarness = ({ onClose }: DrawerHarnessProps): ReactNode => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>{OPENER_LABEL}</button>
      <Drawer
        isOpen={isOpen}
        title={DRAWER_TITLE}
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
      >
        <button type="button">{FIRST_LABEL}</button>
        <button type="button">{LAST_LABEL}</button>
      </Drawer>
    </>
  );
};

const openDrawer = (onClose: () => void): HTMLElement => {
  render(<DrawerHarness onClose={onClose} />);
  const opener: HTMLElement = screen.getByRole('button', { name: OPENER_LABEL });
  opener.focus();
  fireEvent.click(opener);

  return opener;
};

describe(Drawer.name, () => {
  it('renders nothing while closed', () => {
    render(<Drawer isOpen={false} title={DRAWER_TITLE} onClose={vi.fn()}>body</Drawer>);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a modal dialog on the bed side, labelled by its title, with focus on the first control', () => {
    openDrawer(vi.fn());

    const drawer: HTMLElement = screen.getByRole('dialog', { name: DRAWER_TITLE });

    expect(drawer).toHaveAttribute('aria-modal', 'true');
    expect(drawer.className).toContain(BED_SIDE_CLASS_NAME);
    expect(screen.getByRole('button', { name: FIRST_LABEL })).toHaveFocus();
  });

  it('cycles Tab and Shift+Tab inside the drawer', () => {
    openDrawer(vi.fn());
    const drawer: HTMLElement = screen.getByRole('dialog');
    const lastButton: HTMLElement = screen.getByRole('button', { name: LAST_LABEL });

    lastButton.focus();
    fireEvent.keyDown(lastButton, { key: 'Tab' });

    expect(screen.getByRole('button', { name: FIRST_LABEL })).toHaveFocus();

    fireEvent.keyDown(drawer, { key: 'Tab', shiftKey: true });

    expect(lastButton).toHaveFocus();
  });

  it('calls onClose on Escape without letting the key reach the window and returns focus to the opener', () => {
    const onClose = vi.fn();
    const onWindowKeyDown = vi.fn();
    window.addEventListener('keydown', onWindowKeyDown);
    const opener: HTMLElement = openDrawer(onClose);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    window.removeEventListener('keydown', onWindowKeyDown);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onWindowKeyDown).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

describe(`${Drawer.name} Escape handling`, () => {
  it('closes on Escape pressed outside the drawer', () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">Outside</button>
        <Drawer isOpen title={DRAWER_TITLE} onClose={onClose}>body</Drawer>
      </>,
    );
    const outside: HTMLElement = screen.getByRole('button', { name: 'Outside' });

    outside.focus();
    fireEvent.keyDown(outside, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores repeated and composing Escape presses', () => {
    const onClose = vi.fn();
    render(<Drawer isOpen title={DRAWER_TITLE} onClose={onClose}>body</Drawer>);
    const drawer: HTMLElement = screen.getByRole('dialog');

    fireEvent.keyDown(drawer, { key: 'Escape', repeat: true });
    fireEvent.keyDown(drawer, { key: 'Escape', isComposing: true });
    fireEvent.keyDown(document.body, { key: 'Escape', repeat: true });
    fireEvent.keyDown(document.body, { key: 'Escape', isComposing: true });

    expect(onClose).not.toHaveBeenCalled();
  });
});
