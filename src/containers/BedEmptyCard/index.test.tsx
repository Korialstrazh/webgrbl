import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedEmptyCard } from '.';
import { newStore } from '../../utils/states/new.store';

describe(BedEmptyCard.name, () => {
  it('offers the drop hint and the sample, no third Import SVG, and leaves the accent to the readiness row', () => {
    render(<Provider store={newStore()}><BedEmptyCard /></Provider>);

    expect(screen.getByText('Drop an SVG here')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import SVG' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add test sample' })).not.toHaveClass('ant-btn-primary');
  });
});
