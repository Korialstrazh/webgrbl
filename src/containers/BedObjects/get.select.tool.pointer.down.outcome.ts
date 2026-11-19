/**
 * Decides what a press on an object does with the Select tool. Shift adds or removes the object. Without Shift a press
 * on an unselected object selects only it; a press on a selected object keeps the selection so a drag moves all of it,
 * and a plain click then narrows the selection to that object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SelectToolPointerDownInput } from './interfaces/SelectToolPointerDownInput';
import type { SelectToolPointerDownOutcome } from './interfaces/SelectToolPointerDownOutcome';

const getShiftPressOutcome = (selectedObjectIds: string[], objectId: string): SelectToolPointerDownOutcome => {
  if (selectedObjectIds.includes(objectId)) {
    return {
      selectionNow: selectedObjectIds.filter((selectedObjectId: string): boolean => selectedObjectId !== objectId),
      draggedObjectIds: [],
      selectionAfterClick: undefined,
    };
  }

  const extendedSelection: string[] = [...selectedObjectIds, objectId];

  return { selectionNow: extendedSelection, draggedObjectIds: extendedSelection, selectionAfterClick: undefined };
};

const getPlainPressOutcome = (selectedObjectIds: string[], objectId: string): SelectToolPointerDownOutcome => {
  if (!selectedObjectIds.includes(objectId)) {
    return { selectionNow: [objectId], draggedObjectIds: [objectId], selectionAfterClick: undefined };
  }

  const hasOtherSelectedObjects: boolean = selectedObjectIds.length > 1;

  return {
    selectionNow: undefined,
    draggedObjectIds: selectedObjectIds,
    selectionAfterClick: hasOtherSelectedObjects ? [objectId] : undefined,
  };
};

export const getSelectToolPointerDownOutcome = (input: SelectToolPointerDownInput): SelectToolPointerDownOutcome =>
  input.isShiftPressed
    ? getShiftPressOutcome(input.selectedObjectIds, input.objectId)
    : getPlainPressOutcome(input.selectedObjectIds, input.objectId);
