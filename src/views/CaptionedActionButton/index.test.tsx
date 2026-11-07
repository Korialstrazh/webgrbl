import { PlayCircleFilled } from '@ant-design/icons';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CaptionedActionButton } from '.';
import { CAPTIONED_ACTION_LOCK_TEST_ID } from './captioned.action.constants';

const LABEL_TEXT = 'Start job';
const CAPTION_TEXT = 'Start';
const BLOCKED_REASON_TEXT = 'Connect the laser first.';

describe(CaptionedActionButton.name, () => {
  it('shows a lock on the icon of an action that is off for a reason', () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        blockedReasonText={BLOCKED_REASON_TEXT}
      />,
    );

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId(CAPTIONED_ACTION_LOCK_TEST_ID)).toBeInTheDocument();
  });

  it('keeps a blocked action focusable with its reason for screen readers', () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        blockedReasonText={BLOCKED_REASON_TEXT}
      />,
    );
    const button: HTMLElement = screen.getByRole('button', { name: LABEL_TEXT });

    button.focus();

    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
    expect(button).toHaveAccessibleDescription(BLOCKED_REASON_TEXT);
  });

  it('shows the reason a blocked action is off when it takes the keyboard focus', async () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        blockedReasonText={BLOCKED_REASON_TEXT}
      />,
    );

    act(() => {
      fireEvent.focus(screen.getByRole('button', { name: LABEL_TEXT }));
    });

    expect(await screen.findByRole('tooltip')).toHaveTextContent(BLOCKED_REASON_TEXT);
  });

  it.each(['click', 'Enter', ' '])('ignores %j while blocked, also in a wrapper', (activationKey: string) => {
    const handleClick = vi.fn();
    const handleWrapperClick = vi.fn();

    render(
      <div onClick={handleWrapperClick}>
        <CaptionedActionButton
          labelText={LABEL_TEXT}
          captionText={CAPTION_TEXT}
          iconComponent={<PlayCircleFilled />}
          blockedReasonText={BLOCKED_REASON_TEXT}
          onClick={handleClick}
        />
      </div>,
    );
    const button: HTMLElement = screen.getByRole('button', { name: LABEL_TEXT });

    if (activationKey !== 'click') {
      fireEvent.keyDown(button, { key: activationKey });
      fireEvent.keyUp(button, { key: activationKey });
    }

    // A browser turns Enter and Space on a button into a click.
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(handleWrapperClick).not.toHaveBeenCalled();
  });

  it('runs the action when it is not blocked', () => {
    const handleClick = vi.fn();

    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        onClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: LABEL_TEXT }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows a lock on an action that is turned off', () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        isDisabled
      />,
    );

    expect(screen.getByTestId(CAPTIONED_ACTION_LOCK_TEST_ID)).toBeInTheDocument();
  });

  it('shows no lock on an action that can be used', () => {
    render(
      <CaptionedActionButton labelText={LABEL_TEXT} captionText={CAPTION_TEXT} iconComponent={<PlayCircleFilled />} />,
    );

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toBeEnabled();
    expect(screen.queryByTestId(CAPTIONED_ACTION_LOCK_TEST_ID)).not.toBeInTheDocument();
  });
});
