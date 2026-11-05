import { PlayCircleFilled } from '@ant-design/icons';
import { render, screen } from '@testing-library/react';
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

    expect(screen.getByRole('button', { name: LABEL_TEXT })).toBeDisabled();
    expect(screen.getByTestId(CAPTIONED_ACTION_LOCK_TEST_ID)).toBeInTheDocument();
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
