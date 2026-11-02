import { render, screen } from '@testing-library/react';
import { SoonTag } from '.';

const DESCRIPTION_TEXT = 'A 3D preview of the finished job.';
const TAG_TEXT = 'Soon';

describe(SoonTag.name, () => {
  it('shows Soon and keeps the description as hidden text for screen readers', () => {
    render(<SoonTag description={DESCRIPTION_TEXT} />);

    const tag: HTMLElement = screen.getByText(TAG_TEXT);

    expect(tag).toHaveTextContent(DESCRIPTION_TEXT);
    expect(tag).toHaveAttribute('tabindex', '0');
  });
});
