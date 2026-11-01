/**
 * Gives the key handler of the objects layer, which only gets keys while the layer has focus. An arrow nudges the
 * selection 1 mm (10 mm with Shift) as one transform per press, and Delete or Backspace removes the selection. Keys
 * are left alone while focus is in a text field, while an overlay is open, during IME composition and with Ctrl, Cmd
 * or Alt held, so they never fight other shortcuts. Escape is not handled: it stays the Stop hotkey. The decision
 * reads the store at the moment of the press.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { isTextEntryTarget } from '../../utils/browser/is.text.entry.target';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { ProjectObjectsDeleted, ProjectObjectsTransformed } from '../../utils/states/project.document.state';
import { selectSelectedObjects } from '../../utils/states/project.selection.state';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';
import { DELETE_SELECTION_KEYS } from './bed.objects.constants';
import { getNudgeOffset } from './get.nudge.offset';
import { getNudgedObjectTransforms } from './get.nudged.object.transforms';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { BedObjectsKeyDownHandler } from './interfaces/BedObjectsKeyDownHandler';

const hasCommandModifier = (keyboardEvent: KeyboardEvent): boolean =>
  keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey;

const isPlainKeyPress = (keyboardEvent: KeyboardEvent): boolean =>
  !keyboardEvent.nativeEvent.isComposing && !hasCommandModifier(keyboardEvent);

const canBedObjectsKeyAct = (keyboardEvent: KeyboardEvent, state: AppRootState): boolean =>
  isPlainKeyPress(keyboardEvent) && !isTextEntryTarget(keyboardEvent.target) && !selectIsAnyOverlayOpen(state);

export const useBedObjectsKeys = (): BedObjectsKeyDownHandler => {
  const store: AppStore = useAppStore();

  return useCallback((keyboardEvent: KeyboardEvent<SVGGElement>): void => {
    const state: AppRootState = store.getState();
    const selectedObjects: ProjectObject[] = selectSelectedObjects(state);

    if (!selectedObjects.length || !canBedObjectsKeyAct(keyboardEvent, state)) {
      return;
    }

    if (DELETE_SELECTION_KEYS.includes(keyboardEvent.key)) {
      keyboardEvent.preventDefault();
      store.dispatch(new ProjectObjectsDeleted({
        objectIds: selectedObjects.map((projectObject: ProjectObject): string => projectObject.id),
      }));

      return;
    }

    const nudgeOffset: BedMachinePoint | undefined = getNudgeOffset(keyboardEvent.key, keyboardEvent.shiftKey);

    if (nudgeOffset) {
      // Stops the page from scrolling as well.
      keyboardEvent.preventDefault();
      store.dispatch(new ProjectObjectsTransformed({
        transforms: getNudgedObjectTransforms(selectedObjects, nudgeOffset),
      }));
    }
  }, [store]);
};
