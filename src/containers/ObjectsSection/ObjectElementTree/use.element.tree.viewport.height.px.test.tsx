import { render } from '@testing-library/react';
import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import {
  ELEMENT_TREE_DEFAULT_VIEWPORT_HEIGHT_PX,
  ELEMENT_TREE_MIN_VIEWPORT_HEIGHT_PX,
} from './element.tree.constants';
import { useElementTreeViewportHeightPx } from './use.element.tree.viewport.height.px';

const HEIGHT_TEST_ID = 'viewport-height';
const TALL_PANEL_HEIGHT_PX = 1000;
const SHORT_PANEL_HEIGHT_PX = 200;

const ViewportHeightProbe = (): ReactNode => {
  const treeRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const viewportHeightPx: number = useElementTreeViewportHeightPx(treeRef);

  return <div ref={treeRef} data-testid={HEIGHT_TEST_ID}>{viewportHeightPx}</div>;
};

const renderInPanel = (panelHeightPx: number): string => {
  const panelElement: HTMLDivElement = document.createElement('div');

  panelElement.style.overflowY = 'auto';
  Object.defineProperty(panelElement, 'clientHeight', { value: panelHeightPx });
  document.body.appendChild(panelElement);

  const { getByTestId } = render(<ViewportHeightProbe />, { container: panelElement });

  return getByTestId(HEIGHT_TEST_ID).textContent ?? '';
};

class FakeResizeObserver {
  public observe(): void {}

  public disconnect(): void {}
}

describe(useElementTreeViewportHeightPx.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('keeps the default height where no ResizeObserver exists', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    expect(renderInPanel(TALL_PANEL_HEIGHT_PX)).toBe(String(ELEMENT_TREE_DEFAULT_VIEWPORT_HEIGHT_PX));
  });

  it('takes 60% of the scrolling panel', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    expect(renderInPanel(TALL_PANEL_HEIGHT_PX)).toBe('600');
  });

  it('never goes below the minimum in a short panel', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    expect(renderInPanel(SHORT_PANEL_HEIGHT_PX)).toBe(String(ELEMENT_TREE_MIN_VIEWPORT_HEIGHT_PX));
  });
});
