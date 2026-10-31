import { fireEvent, render, screen } from '@testing-library/react';
import { Button, Switch } from 'antd';
import type { Mock } from 'vitest';
import { ComingSoon } from '.';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';

const DESCRIPTION_TEXT = 'Frame the job outline on the bed.';
const BADGE_TEXT = 'Coming soon';
const BUTTON_LABEL = 'Frame';
const WRAPPED_TEST_ID = 'wrapped';
const ENTER_KEY = 'Enter';

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

  it('shows the badge and the description', () => {
    render(
      <ComingSoon description={DESCRIPTION_TEXT}>
        <span>{BUTTON_LABEL}</span>
      </ComingSoon>,
    );

    expect(screen.getByText(BADGE_TEXT)).toBeVisible();
    expect(screen.getByText(DESCRIPTION_TEXT)).toBeVisible();
  });
});
