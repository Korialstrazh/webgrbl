/**
 * Decides what a press on an object does with the Select tool. Shift adds or removes the object. Without Shift a press
 * on an unselected object selects only it; a press on a selected object keeps the selection so a drag moves all of it,
 * and a plain click then narrows the selection to that object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
