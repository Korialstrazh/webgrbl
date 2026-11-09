import { newProjectObject } from '../project/new.project.object';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { selectJobReadinessWarningCount } from './job.readiness.selector';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectObjectsAdded, ProjectObjectsDeleted } from './project.document.state';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';
import { selectCurrentToolpathWarnings, selectToolpathWarningCount } from './toolpath.warnings.selector';

const WARNING_COUNT = 2;

const newWarnings = (objectId: string): ObjectWarning[] => [
  { objectId, kind: SVG_UNSUPPORTED_KIND.OFF_PAGE },
  { objectId, kind: SVG_UNSUPPORTED_KIND.TEXT },
];

const dispatchReadyToolpath = (store: AppStore, warnings: ObjectWarning[]): void => {
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ warnings }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));
};

describe(selectToolpathWarningCount.name, () => {
  it('counts the warnings of a current toolpath, the same number the Check step shows', () => {
    const store: AppStore = newStore();
    const projectObject: ProjectObject = newProjectObject();

    store.dispatch(new ProjectObjectsAdded({ objects: [projectObject], layers: [] }));
    dispatchReadyToolpath(store, newWarnings(projectObject.id));

    expect(selectToolpathWarningCount(store.getState())).toBe(WARNING_COUNT);
    expect(selectJobReadinessWarningCount(store.getState())).toBe(WARNING_COUNT);
    expect(selectCurrentToolpathWarnings(store.getState())).toHaveLength(WARNING_COUNT);
  });

  it('shows no warning on an empty project, even when an old toolpath still has some', () => {
    const store: AppStore = newStore();
    const projectObject: ProjectObject = newProjectObject();

    store.dispatch(new ProjectObjectsAdded({ objects: [projectObject], layers: [] }));
    store.dispatch(new ProjectObjectsDeleted({ objectIds: [projectObject.id] }));
    dispatchReadyToolpath(store, newWarnings(projectObject.id));

    expect(selectToolpathWarningCount(store.getState())).toBe(0);
    expect(selectJobReadinessWarningCount(store.getState())).toBe(0);
  });

  it('counts nothing while there is no current toolpath', () => {
    expect(selectCurrentToolpathWarnings(newStore().getState())).toBeUndefined();
    expect(selectToolpathWarningCount(newStore().getState())).toBe(0);
  });
});
