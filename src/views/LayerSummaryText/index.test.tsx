import { render, screen } from '@testing-library/react';
import { MIDDLE_DOT, MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { LayerSummaryText } from '.';

const PARTS: readonly string[] = ['Line', '60 %', '2000 mm/min', `1${MULTIPLICATION_SIGN}`];
const SUMMARY_TEXT: string = PARTS.join(` ${MIDDLE_DOT} `);
const SUMMARY_PART_CLASS_NAME = 'summaryPart';

describe(LayerSummaryText.name, () => {
  it('keeps each value with its unit in a part that never wraps, separated by dots', () => {
    render(<LayerSummaryText parts={[...PARTS]} />);

    for (const part of PARTS) {
      expect(screen.getByText(part).className).toContain(SUMMARY_PART_CLASS_NAME);
    }

    expect(screen.getByTitle(SUMMARY_TEXT)).toHaveTextContent(SUMMARY_TEXT);
  });
});
