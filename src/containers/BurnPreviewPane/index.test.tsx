import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BurnPreviewPane } from '.';
import { newBurnSceneRenderer } from '../../utils/burn.scene/burn.scene.runtime';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import { newStore } from '../../utils/states/new.store';

const NO_WEBGL_TEXT = 'The 3D view could not start in this browser. The Cut check still works.';
const LOADING_TEXT = 'Loading the 3D view';
const SCENE_CANVAS_SELECTOR = 'canvas';

vi.mock('../../utils/burn.scene/burn.scene.runtime', () => ({
  newBurnSceneRenderer: vi.fn(),
}));

const renderPane = (): ReturnType<typeof render> => render(
  <Provider store={newStore()}>
    <BurnPreviewPane />
  </Provider>,
);

describe(BurnPreviewPane.name, () => {
  beforeEach(() => {
    vi.mocked(newBurnSceneRenderer).mockReset();
  });

  it('shows the loading state until the runtime arrives, then gives the renderer its canvas', async () => {
    const renderer: BurnSceneRenderer = { dispose: vi.fn() };

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    const { container } = renderPane();

    expect(screen.getByRole('status')).toHaveTextContent(LOADING_TEXT);

    await vi.waitFor(() => {
      expect(newBurnSceneRenderer).toHaveBeenCalledWith(container.querySelector(SCENE_CANVAS_SELECTOR));
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(NO_WEBGL_TEXT)).not.toBeInTheDocument();
  });

  it('shows the fixed message and no canvas when the renderer cannot start', async () => {
    vi.mocked(newBurnSceneRenderer).mockReturnValue(undefined);
    const { container } = renderPane();

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(container.querySelector(SCENE_CANVAS_SELECTOR)).not.toBeInTheDocument();
  });

  it('releases the renderer when the pane closes', async () => {
    const renderer: BurnSceneRenderer = { dispose: vi.fn() };

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    const { unmount } = renderPane();

    await vi.waitFor(() => {
      expect(newBurnSceneRenderer).toHaveBeenCalled();
    });
    unmount();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });
});
