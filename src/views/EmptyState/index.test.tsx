import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '.';

const TITLE = 'Nothing here';
const BODY = 'Add something first.';
const ACTION = 'Add';

describe(EmptyState.name, () => {
  it('shows the title and the sentence, with a button only when an action is given', () => {
    const onAction = vi.fn();
    const { rerender } = render(<EmptyState iconComponent={<span />} titleText={TITLE} bodyText={BODY} />);

    expect(screen.getByRole('note')).toHaveTextContent(TITLE);
    expect(screen.getByRole('note')).toHaveTextContent(BODY);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <EmptyState
        iconComponent={<span />}
        titleText={TITLE}
        bodyText={BODY}
        actionLabel={ACTION}
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: ACTION }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
