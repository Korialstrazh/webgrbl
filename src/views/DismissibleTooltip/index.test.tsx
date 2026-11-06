import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DismissibleTooltip } from '.';

const TOOLTIP_TEXT = 'Open the library';
const HOVER_WAIT_MS = 1000;

const hoverAndWait = (element: HTMLElement): void => {
  fireEvent.mouseEnter(element);
  act(() => {
    vi.advanceTimersByTime(HOVER_WAIT_MS);
  });
};

describe(DismissibleTooltip.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A tooltip left open sits on top of antd's Escape stack and would take the Escape meant for the drawer.
  it('stays away after a click, also when the hover timer ends after it, until the pointer comes back', () => {
    render(<DismissibleTooltip title={TOOLTIP_TEXT}><Button>Open</Button></DismissibleTooltip>);

    const wrapper: HTMLElement | null = screen.getByRole('button').parentElement;

    if (!wrapper) {
      throw new Error('The tooltip wrapper is missing.');
    }

    fireEvent.mouseEnter(wrapper);
    fireEvent.click(screen.getByRole('button'));
    act(() => {
      vi.advanceTimersByTime(HOVER_WAIT_MS);
    });

    expect(screen.queryByText(TOOLTIP_TEXT)).not.toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    hoverAndWait(wrapper);

    expect(screen.getByText(TOOLTIP_TEXT)).toBeInTheDocument();
  });
});
