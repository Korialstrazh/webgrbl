import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { SvgImportButton } from '.';
import { newStore } from '../../utils/states/new.store';

const IMPORT_LABEL = 'Import SVG';
const COMPACT_LABEL_CLASS_NAME = 'compact-label';

describe(SvgImportButton.name, () => {
  it('keeps its accessible name when a narrow layout may hide the label behind the icon', () => {
    render(
      <Provider store={newStore()}>
        <SvgImportButton iconComponent={<span>icon</span>} labelClassName={COMPACT_LABEL_CLASS_NAME} />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: IMPORT_LABEL })).toBeInTheDocument();
    expect(screen.getByText(IMPORT_LABEL)).toHaveClass(COMPACT_LABEL_CLASS_NAME);
  });
});
