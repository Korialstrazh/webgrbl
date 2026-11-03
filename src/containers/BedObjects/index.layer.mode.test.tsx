import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedObjects } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { getNewLayer } from '../../utils/layers/get.new.layer';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE, LAYER_MODE } from '../../utils/palette/palette.constants';
import type { LayerMode } from '../../utils/palette/palette.constants';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { ProjectDocumentLoaded } from '../../utils/states/project.document.state';
import { selectSelectedObjectIds } from '../../utils/states/project.selection.state';
import { SVG_DRAWN_ELEMENT, SVG_PROPERTY } from '../../utils/svg/geometry/svg.geometry.constants';
import { IDENTITY_SVG_MATRIX, mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import { BED_OBJECT_HIT_AREA_TEST_ID } from './bed.objects.constants';

const BED: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const RED = '#ff0000';
const OBJECT_NAME = 'Square';
const LAYER_MODE_ATTRIBUTE = 'data-layer-mode';
const LAYER_ENABLED_ATTRIBUTE = 'data-layer-enabled';
const IMAGE_ELEMENT_SELECTOR = 'image';
const PATH_DATA_ATTRIBUTE = 'd';
const SQUARE_PATH_DATA = 'M0 0L10 0L10 10L0 10Z';
const POINTER_ID = 1;
const ARTWORK_SIZE_MM = 10;
// Inside the square: SVG y is the bed height minus the machine y.
const GRAB_X = 15;
const GRAB_Y = 285;

const squareObject: ProjectObject = newProjectObject({
  name: OBJECT_NAME,
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="${RED}"/></svg>`,
  intrinsicWidthMm: ARTWORK_SIZE_MM,
  intrinsicHeightMm: ARTWORK_SIZE_MM,
  xMm: 10,
  yMm: 10,
});

const getRedLayer = (mode: LayerMode, enabled: boolean): ProjectLayer => {
  const redLayer: ProjectLayer = getNewLayer(RED, DEFAULT_PALETTE, 0);

  return { ...redLayer, enabled, settings: { ...redLayer.settings, mode } };
};

const renderWithLayer = (layer: ProjectLayer): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectDocumentLoaded({ document: { objects: [squareObject], layers: [layer] } }));
  render(
    <Provider store={store}>
      <svg>
        <BedObjects dimensions={BED} />
      </svg>
    </Provider>,
  );

  return store;
};

const getLayerGroup = (): Element | null => screen.getByRole('img', { name: OBJECT_NAME })
  .querySelector(`[${LAYER_MODE_ATTRIBUTE}]`);

beforeEach(() => {
  mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
  // jsdom has no pointer capture.
  Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
  Object.defineProperty(Element.prototype, 'releasePointerCapture', { configurable: true, value: vi.fn() });
});

describe(`${BedObjects.name} layer modes`, () => {
  it('draws an object on a Line layer as outlines in the layer colour instead of the filled image', () => {
    renderWithLayer(getRedLayer(LAYER_MODE.LINE, true));

    const layerGroup: Element | null = getLayerGroup();

    expect(document.querySelector(IMAGE_ELEMENT_SELECTOR)).toBeNull();
    expect(layerGroup).toHaveAttribute(LAYER_MODE_ATTRIBUTE, LAYER_MODE.LINE);
    expect(layerGroup).toHaveAttribute(SVG_PROPERTY.STROKE, RED);
    expect(layerGroup?.querySelector(SVG_DRAWN_ELEMENT.PATH)).toHaveAttribute(PATH_DATA_ATTRIBUTE, SQUARE_PATH_DATA);
  });

  it('draws an object on a fill layer that is on as its filled artwork image', () => {
    renderWithLayer(getRedLayer(LAYER_MODE.FILL, true));

    expect(document.querySelector(IMAGE_ELEMENT_SELECTOR)).not.toBeNull();
    expect(getLayerGroup()).toBeNull();
  });

  it('marks the paths of a layer that is off, so they are drawn dimmed', () => {
    renderWithLayer(getRedLayer(LAYER_MODE.FILL, false));

    expect(getLayerGroup()).toHaveAttribute(LAYER_ENABLED_ATTRIBUTE, 'false');
  });

  it('still selects an outlined object with a press inside its outline', () => {
    const store: AppStore = renderWithLayer(getRedLayer(LAYER_MODE.LINE, true));

    const hitArea: HTMLElement = screen.getByTestId(BED_OBJECT_HIT_AREA_TEST_ID);

    fireEvent.pointerDown(hitArea, { pointerId: POINTER_ID, clientX: GRAB_X, clientY: GRAB_Y });
    fireEvent.pointerUp(hitArea, { pointerId: POINTER_ID, clientX: GRAB_X, clientY: GRAB_Y });

    expect(selectSelectedObjectIds(store.getState())).toEqual([squareObject.id]);
  });
});
