import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ObjectElementTree } from '.';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../../utils/project/new.project.object';
import { newStore } from '../../../utils/states/new.store';
import type { AppStore } from '../../../utils/states/new.store';
import { ProjectDocumentLoaded, selectProjectObjects } from '../../../utils/states/project.document.state';
import { SVG_TREE_DISABLED_ATTRIBUTE_NAME } from '../../../utils/svg/tree/svg.tree.constants';
import { getLargeSvgText } from '../../../utils/svg/tree/test.support/get.large.svg.text';
import { AntdTestProvider } from '../../../utils/test.support/antd.test.provider';

const OBJECT_ID = 'tree-object';
const FIRST_PATH_NAME = 'path-0-0-0';
const SECOND_PATH_NAME = 'path-0-0-1';
const TREE_ROW_SELECTOR = '.ant-tree-treenode';
const MAX_RENDERED_ROW_COUNT = 40;
const LARGE_SVG_TEXT: string = getLargeSvgText({ layerCount: 10, groupCount: 10, pathCount: 30 });
const SMALL_SVG_TEXT: string = getLargeSvgText({ layerCount: 1, groupCount: 1, pathCount: 2 });

const getStoredSvgText = (store: AppStore): string =>
  selectProjectObjects(store.getState()).find((projectObject: ProjectObject) => projectObject.id === OBJECT_ID)
    ?.svgText ?? '';

const renderTree = (svgText: string): AppStore => {
  const store: AppStore = newStore();
  const projectObject: ProjectObject = newProjectObject({ id: OBJECT_ID, svgText });

  act(() => {
    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [projectObject], layers: [] } }));
  });
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <ObjectElementTree projectObject={projectObject} />
      </AntdTestProvider>
    </Provider>,
  );

  return store;
};

describe(ObjectElementTree.name, () => {
  it('renders only the rows in view of a tree of thousands of shapes', () => {
    renderTree(LARGE_SVG_TEXT);

    const renderedRowCount: number = document.querySelectorAll(TREE_ROW_SELECTOR).length;

    expect(renderedRowCount).toBeGreaterThan(0);
    expect(renderedRowCount).toBeLessThanOrEqual(MAX_RENDERED_ROW_COUNT);
  });

  it('skips an element from its row', async () => {
    const store: AppStore = renderTree(SMALL_SVG_TEXT);

    fireEvent.click(screen.getByLabelText(`Skip ${FIRST_PATH_NAME}: it is not burned`));

    await waitFor(() => expect(getStoredSvgText(store)).toContain(SVG_TREE_DISABLED_ATTRIBUTE_NAME));
  });

  it('deletes an element from its row', async () => {
    const store: AppStore = renderTree(SMALL_SVG_TEXT);

    fireEvent.click(screen.getByLabelText(`Delete ${SECOND_PATH_NAME}`));

    await waitFor(() => expect(getStoredSvgText(store)).not.toContain(SECOND_PATH_NAME));
    expect(getStoredSvgText(store)).toContain(FIRST_PATH_NAME);
  });

  it('builds the palette list of a row only once its colour button is pressed', () => {
    renderTree(SMALL_SVG_TEXT);

    expect(screen.queryAllByLabelText(/^Burn with /)).toHaveLength(0);

    fireEvent.click(screen.getByLabelText(new RegExp(`^Colour of ${FIRST_PATH_NAME}:`)));

    expect(screen.queryAllByLabelText(/^Burn with /).length).toBeGreaterThan(0);
  });

  it('closes the colour list once a colour is picked', async () => {
    renderTree(SMALL_SVG_TEXT);

    fireEvent.click(screen.getByLabelText(new RegExp(`^Colour of ${FIRST_PATH_NAME}:`)));
    fireEvent.click(screen.getAllByLabelText(/^Burn with /).at(0) as HTMLElement);

    await waitFor(() => expect(document.querySelector('.ant-popover:not(.ant-popover-hidden)')).toBeNull());
  });

  it('keeps the row actions reachable from the keyboard', () => {
    renderTree(SMALL_SVG_TEXT);

    const skipButton: HTMLElement = screen.getByLabelText(`Skip ${FIRST_PATH_NAME}: it is not burned`);

    skipButton.focus();

    expect(document.activeElement).toBe(skipButton);
    expect(skipButton.tagName).toBe('BUTTON');
  });
});
