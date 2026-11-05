import { render, screen } from '@testing-library/react';
import { LayerValueCells } from '.';
import { MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { LAYER_MODE } from '../../utils/palette/palette.constants';

const SUMMARY_TEXT = `Line \u00b7 100 % \u00b7 300 mm/min \u00b7 3${MULTIPLICATION_SIGN}`;

describe(LayerValueCells.name, () => {
  it('shows the three values and keeps the units in the title and the read-out text', () => {
    render(
      <LayerValueCells settings={{ mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 300, passes: 3 }} />,
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText(`3${MULTIPLICATION_SIGN}`)).toBeInTheDocument();
    expect(screen.getByTitle(SUMMARY_TEXT)).toBeInTheDocument();
    expect(screen.getByText(SUMMARY_TEXT)).toBeInTheDocument();
  });
});
