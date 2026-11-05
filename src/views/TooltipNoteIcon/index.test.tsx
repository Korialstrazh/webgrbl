import { render, screen } from '@testing-library/react';
import { TooltipNoteIcon } from '.';

const NOTE_TEXT = 'Projects are stored in this browser.';
const ICON_TEST_ID = 'note-icon';

describe(TooltipNoteIcon.name, () => {
  it('names the note by its text and takes the keyboard focus', () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} />);

    expect(screen.getByRole('note', { name: NOTE_TEXT })).toHaveAttribute('tabindex', '0');
    expect(screen.queryByText(NOTE_TEXT)).not.toBeInTheDocument();
  });

  it('shows the given icon instead of the info circle', () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} iconComponent={<span data-testid={ICON_TEST_ID} />} />);

    expect(screen.getByTestId(ICON_TEST_ID)).toBeInTheDocument();
  });
});
