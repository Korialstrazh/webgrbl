import { render, screen } from '@testing-library/react';
import { Panel } from '.';

const PANEL_TITLE = 'Machine';
const BODY_TEXT = 'Body content';
const ACTION_LABEL = 'Panel action';

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
});
