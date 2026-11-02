import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button, Slider, Switch } from 'antd';
import type { Mock } from 'vitest';
import { ComingSoon } from '.';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';

const DESCRIPTION_TEXT = 'Frame the job outline on the bed.';
const TAG_TEXT = 'Soon';
// antd opens a tooltip after a short hover delay.
const TOOLTIP_OPEN_DELAY_MS = 200;
const BUTTON_LABEL = 'Frame';
const WRAPPED_TEST_ID = 'wrapped';
const ENTER_KEY = 'Enter';
const ARROW_RIGHT_KEY = 'ArrowRight';
const SLIDER_ROLE = 'slider';
const SLIDER_LABEL = 'Power';
const SLIDER_MAX_VALUE = 100;

describe(ComingSoon.name, () => {
  it('blocks clicks and keyboard on a wrapped antd button', () => {
    const onClick: Mock<() => void> = vi.fn<() => void>();

    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={onClick}>{BUTTON_LABEL}</Button>
      </ComingSoon>,
    );
    const wrappedButton: HTMLElement = screen.getByRole('button', { name: BUTTON_LABEL, hidden: true });

    wrappedButton.focus();
    fireEvent.click(wrappedButton);
    fireEvent.keyDown(wrappedButton, { key: ENTER_KEY });
    fireEvent.keyUp(wrappedButton, { key: ENTER_KEY });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks clicks and keyboard on a wrapped antd switch', () => {
    const onChange: Mock<(isChecked: boolean) => void> = vi.fn<(isChecked: boolean) => void>();

    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <Switch checked={false} onChange={onChange} />
      </ComingSoon>,
    );
    const wrappedSwitch: HTMLElement = screen.getByRole('switch', { hidden: true });

    fireEvent.click(wrappedSwitch);
    fireEvent.keyDown(wrappedSwitch, { key: ENTER_KEY });
    fireEvent.keyUp(wrappedSwitch, { key: ENTER_KEY });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks mouse and keyboard on a wrapped antd slider', () => {
    const onChange: Mock<(value: number) => void> = vi.fn<(value: number) => void>();

    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <Slider max={SLIDER_MAX_VALUE} defaultValue={0} ariaLabelledByForHandle={SLIDER_LABEL} onChange={onChange} />
      </ComingSoon>,
    );
    const wrappedHandle: HTMLElement = screen.getByRole(SLIDER_ROLE, { hidden: true });

    wrappedHandle.focus();
    fireEvent.mouseDown(wrappedHandle);
    fireEvent.click(wrappedHandle);
    fireEvent.keyDown(wrappedHandle, { key: ARROW_RIGHT_KEY });
    fireEvent.keyUp(wrappedHandle, { key: ARROW_RIGHT_KEY });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks the wrapper inert and aria-disabled', () => {
    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <span data-testid={WRAPPED_TEST_ID}>{BUTTON_LABEL}</span>
      </ComingSoon>,
    );
    const wrapper: HTMLElement | null = screen.getByTestId(WRAPPED_TEST_ID).parentElement;

    expect(wrapper).toHaveAttribute('aria-disabled', 'true');
    expect(wrapper).toHaveAttribute('inert');
  });

  it('shows a small Soon tag beside the feature, not an inline description', () => {
    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <span data-testid={WRAPPED_TEST_ID}>{BUTTON_LABEL}</span>
      </ComingSoon>,
    );

    const tag: HTMLElement = screen.getByText(TAG_TEXT);

    expect(tag).toBeVisible();
    expect(tag.closest('[inert]')).toBeNull();
    expect(screen.getByTestId(WRAPPED_TEST_ID).parentElement?.nextElementSibling).toBe(tag);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the description in a tooltip while the feature is hovered', async () => {
    vi.useFakeTimers();
    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <span data-testid={WRAPPED_TEST_ID}>{BUTTON_LABEL}</span>
      </ComingSoon>,
    );

    fireEvent.mouseEnter(screen.getByTestId(WRAPPED_TEST_ID).parentElement?.parentElement ?? document.body);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TOOLTIP_OPEN_DELAY_MS);
    });
    vi.useRealTimers();

    expect(screen.getByRole('tooltip')).toHaveTextContent(DESCRIPTION_TEXT);
  });

  it('shows the description in a tooltip when the tag takes the keyboard focus', async () => {
    vi.useFakeTimers();
    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <span>{BUTTON_LABEL}</span>
      </ComingSoon>,
    );

    const tag: HTMLElement = screen.getByText(TAG_TEXT);

    act(() => {
      tag.focus();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TOOLTIP_OPEN_DELAY_MS);
    });
    vi.useRealTimers();

    expect(tag).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent(DESCRIPTION_TEXT);
  });
});
