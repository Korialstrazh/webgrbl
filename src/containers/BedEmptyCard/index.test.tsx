import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedEmptyCard } from '.';
import { newStore } from '../../utils/states/new.store';

describe(BedEmptyCard.name, () => {
  it('offers the drop hint, the import and the test sample, with the import as the one filled action', () => {
    render(<Provider store={newStore()}><BedEmptyCard /></Provider>);

    expect(screen.getByText('Drop an SVG here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import SVG' })).toHaveClass('ant-btn-primary');
    expect(screen.getByRole('button', { name: 'Add test sample' })).not.toHaveClass('ant-btn-primary');
  });
});
