import { describe, expect, it } from 'vitest';
import { Action } from './action';
import { PROJECT_AUTOSAVE_ACTION_TYPES } from './project.autosave.action.types';
import * as projectDocumentStateModule from './project.document.state';
import { ProjectDocumentLoaded, SvgFilesImportRequested } from './project.document.state';

/** An exported action class: a constructor whose instances are actions, read through its static type. */
interface ProjectActionClass {
  name: string;
  type: string;
}

/**
 * Document actions that are not saved on their own: loading only shows what is stored, and an import request saves
 * through the ProjectObjectsAdded it leads to. Any other action class added to the document state must autosave.
 */
const NOT_AUTOSAVED_ACTION_TYPES: readonly string[] = [ProjectDocumentLoaded.type, SvgFilesImportRequested.type];

const isProjectActionClass = (value: unknown): value is ProjectActionClass =>
  typeof value === 'function' && value.prototype instanceof Action;

const getDocumentActionClasses = (): ProjectActionClass[] => {
  const exportedValues: unknown[] = Object.values(projectDocumentStateModule);

  return exportedValues.filter(isProjectActionClass);
};

describe('PROJECT_AUTOSAVE_ACTION_TYPES', () => {
  it('finds the document action classes to check', () => {
    expect(getDocumentActionClasses().length).toBeGreaterThan(NOT_AUTOSAVED_ACTION_TYPES.length);
  });

  it.each(getDocumentActionClasses().map((actionClass: ProjectActionClass): [string, string] =>
    [actionClass.name, actionClass.type]))('autosaves after %s unless it is listed as not saved', (
    _className: string,
    actionType: string,
  ) => {
    expect(PROJECT_AUTOSAVE_ACTION_TYPES.includes(actionType)).toBe(!NOT_AUTOSAVED_ACTION_TYPES.includes(actionType));
  });
});
