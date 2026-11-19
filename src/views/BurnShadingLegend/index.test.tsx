import { render, screen } from '@testing-library/react';
import { BurnShadingLegend } from '.';

const LABEL_TEXT = 'Shading: the lighter, the less burnt';
const CLEAN_TEXT = 'Clean';
const BURNT_TEXT = 'Burnt';

describe(BurnShadingLegend.name, () => {
  it('is one image named by its sentence, with a short word at each end of the bar', () => {
    render(<BurnShadingLegend labelText={LABEL_TEXT} cleanText={CLEAN_TEXT} burntText={BURNT_TEXT} />);

    const legend: HTMLElement = screen.getByRole('img', { name: LABEL_TEXT });

    expect(legend).toHaveTextContent(`${CLEAN_TEXT}${BURNT_TEXT}`);
  });
});
