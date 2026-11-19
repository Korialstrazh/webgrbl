import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedEmptyCard } from '.';
import { newStore } from '../../utils/states/new.store';
import {
  installMatchMediaMock,
  resetMatchMediaMock,
  setMatchMediaMatches,
} from '../../utils/test.support/match.media.mock';

describe(BedEmptyCard.name, () => {
  it('offers Import SVG as its one accent action, the drop hint and the sample', () => {
    render(<Provider store={newStore()}><BedEmptyCard /></Provider>);

    expect(screen.getByText('Drop an SVG here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import SVG' })).toHaveClass('ant-btn-primary');
    expect(screen.getByRole('button', { name: 'Add test sample' })).not.toHaveClass('ant-btn-primary');
  });

  it('leaves Import SVG to the Job card next step in a wide layout and keeps the drop hint and the sample', () => {
    installMatchMediaMock();
    setMatchMediaMatches(true);
    render(<Provider store={newStore()}><BedEmptyCard /></Provider>);

    expect(screen.getByText('Drop an SVG here')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import SVG' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add test sample' })).toBeInTheDocument();
    resetMatchMediaMock();
  });
});
