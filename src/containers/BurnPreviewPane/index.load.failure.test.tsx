import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedPanel } from '../BedPanel';
import { newStore } from '../../utils/states/new.store';

const NO_WEBGL_TEXT = 'The 3D view could not start in this browser. The Cut check still works.';
const CHUNK_ERROR_TEXT = 'chunk at /assets/three-abc.js is gone';
const THREE_D_VIEW_LABEL = '3D';
const DESIGN_VIEW_LABEL = 'Design';
const BED_ZOOM_LABEL = 'Bed zoom';

vi.mock('../../utils/burn.scene/burn.scene.runtime', () => {
  throw new Error('chunk at /assets/three-abc.js is gone');
});

describe('BurnPreviewPane with a chunk that fails to load', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows the fixed message without the original error, logs that error, and the app keeps working', async () => {
    render(
      <Provider store={newStore()}>
        <BedPanel hostRef={null} isWide />
      </Provider>,
    );
    fireEvent.click(screen.getByRole('radio', { name: THREE_D_VIEW_LABEL }));

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(CHUNK_ERROR_TEXT))).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL }));

    expect(screen.queryByText(NO_WEBGL_TEXT)).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: BED_ZOOM_LABEL })).toBeInTheDocument();
  });
});
