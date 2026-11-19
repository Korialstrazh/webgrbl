import { PlayCircleFilled } from '@ant-design/icons';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CaptionedActionButton } from '.';

const LABEL_TEXT = 'Start job';
const CAPTION_TEXT = 'Start';
const BLOCKED_REASON_TEXT = 'Connect the laser first.';
const PLAY_ICON_TEST_ID = 'play-icon';

describe(CaptionedActionButton.name, () => {
  it('turns off an action that is off for a reason and keeps its icon, with no lock glyph of its own', () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled data-testid={PLAY_ICON_TEST_ID} />}
        blockedReasonText={BLOCKED_REASON_TEXT}
      />,
    );

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId(PLAY_ICON_TEST_ID)).toBeInTheDocument();
    expect(document.querySelector('.anticon-lock')).not.toBeInTheDocument();
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

  it('turns off an action that is turned off', () => {
    render(
      <CaptionedActionButton
        labelText={LABEL_TEXT}
        captionText={CAPTION_TEXT}
        iconComponent={<PlayCircleFilled />}
        isDisabled
      />,
    );

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toBeDisabled();
  });

  it('leaves an action that can be used on', () => {
    render(
      <CaptionedActionButton labelText={LABEL_TEXT} captionText={CAPTION_TEXT} iconComponent={<PlayCircleFilled />} />,
    );

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toBeEnabled();
  });
});
