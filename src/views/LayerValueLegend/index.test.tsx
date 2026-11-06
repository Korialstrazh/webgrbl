import { render, screen } from '@testing-library/react';
import { LayerValueLegend } from '.';

describe(LayerValueLegend.name, () => {
  it('names the power, speed and passes icons without a hover', () => {
    render(<LayerValueLegend />);

    expect(screen.getByText('Power')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Passes')).toBeInTheDocument();
  });
});
