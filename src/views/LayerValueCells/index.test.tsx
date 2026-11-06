import { fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react';
import type { SelectorMatcherOptions } from '@testing-library/react';
import { LayerValueCells } from '.';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { LAYER_MODE } from '../../utils/palette/palette.constants';

// The power cell keeps its narrow no-break space, which the default matcher would fold into a plain space.
const KEEP_SPACES: SelectorMatcherOptions = { normalizer: getDefaultNormalizer({ collapseWhitespace: false }) };
const SUMMARY_TEXT = `Line \u00b7 100 % \u00b7 300 mm/min \u00b7 3${MULTIPLICATION_SIGN}`;

describe(LayerValueCells.name, () => {
  it('shows the three values and keeps the full units in the read-out text, with a tooltip on each value', async () => {
    render(
      <LayerValueCells settings={{ mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 300, passes: 3 }} />,
    );

    expect(screen.getByText('100\u202f%', KEEP_SPACES)).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText(`3${MULTIPLICATION_SIGN}`)).toBeInTheDocument();
    expect(screen.getByText(SUMMARY_TEXT)).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText('300'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Speed (mm/min)');
  });

  it('names the power unit in its tooltip, next to the short suffix in the cell', async () => {
    render(
      <LayerValueCells settings={{ mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 300, passes: 3 }} />,
    );

    fireEvent.mouseEnter(screen.getByText('100\u202f%', KEEP_SPACES));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Power (%)');
  });
});
