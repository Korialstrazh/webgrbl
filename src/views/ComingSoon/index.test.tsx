import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button } from 'antd';
import type { Mock } from 'vitest';
import { ComingSoon } from '.';

const DESCRIPTION_TEXT = 'Frame the job outline on the bed.';
const TAG_TEXT = 'Soon';
// The tooltip waits 0.4 s after the pointer enters, so a pass over the control does not open it.
const TOOLTIP_OPEN_DELAY_MS = 500;
const BUTTON_LABEL = 'Frame';

const renderDisabledButton = (onClick: () => void = vi.fn<() => void>()): void => {
  render(
    <ComingSoon description={DESCRIPTION_TEXT}>
      <Button disabled onClick={onClick}>{BUTTON_LABEL}</Button>
    </ComingSoon>,
  );
};

const advanceTooltipDelay = async (): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TOOLTIP_OPEN_DELAY_MS);
  });
};

describe(ComingSoon.name, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the wrapped control a real disabled control that ignores clicks', () => {
    const onClick: Mock<() => void> = vi.fn<() => void>();

    renderDisabledButton(onClick);
    const wrappedButton: HTMLElement = screen.getByRole('button', { name: BUTTON_LABEL });

    fireEvent.click(wrappedButton);

    expect(wrappedButton).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows one Soon tag right after the control, not an inline description', () => {
    renderDisabledButton();

    const tag: HTMLElement = screen.getByText(TAG_TEXT);

    expect(tag).toBeVisible();
    expect(screen.getByRole('button', { name: BUTTON_LABEL }).parentElement?.nextElementSibling).toBe(tag);
    expect(screen.getAllByText(TAG_TEXT)).toHaveLength(1);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the description in a tooltip while the pointer is over the wrapper of the disabled control', async () => {
    vi.useFakeTimers();
    renderDisabledButton();

    fireEvent.mouseEnter(screen.getByText(TAG_TEXT).parentElement ?? document.body);
    await advanceTooltipDelay();

    expect(screen.getByRole('tooltip')).toHaveTextContent(DESCRIPTION_TEXT);
  });

  it('shows the description in a tooltip when the tag takes the keyboard focus', async () => {
    vi.useFakeTimers();
    renderDisabledButton();
    const tag: HTMLElement = screen.getByText(TAG_TEXT);

    act(() => {
      tag.focus();
    });
    await advanceTooltipDelay();

    expect(tag).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent(DESCRIPTION_TEXT);
  });

  it('reads the description out with the tag for screen readers', () => {
    renderDisabledButton();

    expect(screen.getByText(TAG_TEXT)).toHaveTextContent(DESCRIPTION_TEXT);
  });
});
