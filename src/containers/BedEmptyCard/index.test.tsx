import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedEmptyCard } from '.';
import { newStore } from '../../utils/states/new.store';

describe(BedEmptyCard.name, () => {
  it('offers Import SVG as its one accent action, the drop hint and the sample', () => {
    render(<Provider store={newStore()}><BedEmptyCard /></Provider>);

    expect(screen.getByText('Drop an SVG here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import SVG' })).toHaveClass('ant-btn-primary');
    expect(screen.getByRole('button', { name: 'Add test sample' })).not.toHaveClass('ant-btn-primary');
  });
});
