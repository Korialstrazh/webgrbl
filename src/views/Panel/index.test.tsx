import { render, screen } from '@testing-library/react';
import { Panel } from '.';

const PANEL_TITLE = 'Laser';
const BODY_TEXT = 'Body content';
const ACTION_LABEL = 'Panel action';
const NOTE_TEXT = 'Set in another view.';
const NOTE_CAPTION = 'Design only';

describe(Panel.name, () => {
  it('renders a heading with the title, the body and the header action', () => {
    render(
      <Panel title={PANEL_TITLE} headerActionComponent={<button type="button">{ACTION_LABEL}</button>}>
        <p>{BODY_TEXT}</p>
      </Panel>,
    );

    expect(screen.getByRole('heading', { level: 2, name: PANEL_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: PANEL_TITLE })).toHaveTextContent(BODY_TEXT);
    expect(screen.getByRole('button', { name: ACTION_LABEL })).toBeInTheDocument();
  });

  it('takes the tighter padding only when compact', () => {
    render(<Panel title={PANEL_TITLE} isCompact><p>{BODY_TEXT}</p></Panel>);

    expect(screen.getByRole('region', { name: PANEL_TITLE }).className).toContain('compactPanel');
  });

  it('stays at its heading line without content', () => {
    render(<Panel title={PANEL_TITLE} headerActionComponent={<button type="button">{ACTION_LABEL}</button>} />);

    const panelRegion: HTMLElement = screen.getByRole('region', { name: PANEL_TITLE });

    expect(panelRegion.children).toHaveLength(1);
    expect(screen.getByRole('button', { name: ACTION_LABEL })).toBeInTheDocument();
  });

  it('with a note hides its body, keeps its action and gives the note as a focusable icon', () => {
    render(
      <Panel
        title={PANEL_TITLE}
        noteText={NOTE_TEXT}
        headerActionComponent={<button type="button">{ACTION_LABEL}</button>}
      >
        <p>{BODY_TEXT}</p>
      </Panel>,
    );

    expect(screen.queryByText(BODY_TEXT)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ACTION_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('note', { name: NOTE_TEXT })).toHaveAttribute('tabindex', '0');
  });

  it('writes the short caption of a muted section beside its note icon, and only while muted', () => {
    const { rerender } = render(<Panel title={PANEL_TITLE} noteText={NOTE_TEXT} noteCaptionText={NOTE_CAPTION} />);

    expect(screen.getByText(NOTE_CAPTION)).toBeInTheDocument();

    rerender(<Panel title={PANEL_TITLE} noteCaptionText={NOTE_CAPTION} />);

    expect(screen.queryByText(NOTE_CAPTION)).not.toBeInTheDocument();
  });
});
