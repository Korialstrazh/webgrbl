import { fireEvent, render, screen } from '@testing-library/react';
import { TooltipNoteIcon } from '.';

const NOTE_TEXT = 'Projects are stored in this browser.';
const ICON_TEST_ID = 'note-icon';

describe(TooltipNoteIcon.name, () => {
  it('names the note by its text and takes the keyboard focus', () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} />);

    expect(screen.getByRole('note', { name: NOTE_TEXT })).toHaveAttribute('tabindex', '0');
    expect(screen.queryByText(NOTE_TEXT)).not.toBeInTheDocument();
  });

  it('opens the note text on a tap or click, without a hover', async () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} />);

    fireEvent.click(screen.getByRole('note', { name: NOTE_TEXT }));

    expect(await screen.findByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it('opens the note text with Enter from the keyboard', async () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} />);

    fireEvent.keyDown(screen.getByRole('note', { name: NOTE_TEXT }), { key: 'Enter' });

    expect(await screen.findByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it('shows the given icon instead of the info circle', () => {
    render(<TooltipNoteIcon noteText={NOTE_TEXT} iconComponent={<span data-testid={ICON_TEST_ID} />} />);

    expect(screen.getByTestId(ICON_TEST_ID)).toBeInTheDocument();
  });
});
