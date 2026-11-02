import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedObjects } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { ARROW_RIGHT_KEY, BACKSPACE_KEY, DELETE_KEY } from '../../utils/browser/browser.events.constants';
import { newProjectObject } from '../../utils/project/new.project.object';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDocumentLoaded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  selectProjectObjects,
} from '../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../utils/states/project.selection.state';
import { BED_TOOL } from '../BedPanel/bed.toolbar.constants';

const INPUT_LABEL = 'Object name';

// Stands in for a child that opens an antd Popover, Dropdown or Modal with a text field: the field is portalled out
// of the SVG in the DOM, but stays inside the objects layer in the React tree, so its keys bubble to the layer.
vi.mock('./BedObjectGraphic', () => ({
  BedObjectGraphic: (): ReactNode => createPortal(<input aria-label={INPUT_LABEL} />, document.body),
}));

const BED: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const projectObject: ProjectObject = newProjectObject({ name: 'Star' });

type ActionClass = abstract new (...parameters: never[]) => unknown;

const getDispatchCount = (dispatchSpy: MockInstance<AppDispatch>, actionClass: ActionClass): number =>
  dispatchSpy.mock.calls.filter((callArguments: unknown[]): boolean => callArguments[0] instanceof actionClass).length;

describe(BedObjects.name, () => {
  it('leaves Delete, Backspace and the arrows to a text field rendered inside the objects layer', () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [projectObject], layers: [] } }));
    store.dispatch(new ProjectSelectionChanged({ objectIds: [projectObject.id] }));
    render(
      <Provider store={store}>
        <svg>
          <BedObjects dimensions={BED} activeTool={BED_TOOL.SELECT} />
        </svg>
      </Provider>,
    );

    const inputElement: HTMLElement = screen.getByRole('textbox', { name: INPUT_LABEL });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    inputElement.focus();

    for (const key of [DELETE_KEY, BACKSPACE_KEY, ARROW_RIGHT_KEY]) {
      expect(fireEvent.keyDown(inputElement, { key })).toBe(true);
    }

    expect(getDispatchCount(dispatchSpy, ProjectObjectsDeleted)).toBe(0);
    expect(getDispatchCount(dispatchSpy, ProjectObjectsTransformed)).toBe(0);
    expect(selectProjectObjects(store.getState())).toEqual([projectObject]);
  });
});
