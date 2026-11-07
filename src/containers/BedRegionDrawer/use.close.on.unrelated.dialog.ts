/**
 * Closes an open bed drawer when a dialog opens from outside it (the top bar, a hotkey), so a drawer is never left
 * behind under an unrelated dialog and a single Escape never reveals it again. A dialog opened from inside a bed
 * drawer, such as Add material or the palette, keeps the drawer open beneath it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { AppStore } from '../../utils/states/new.store';
import { selectDialogOpenCount } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';

export const useCloseOnUnrelatedDialog = (
  isShown: boolean,
  drawerClassName: string | undefined,
  onClose: () => void,
): void => {
  const store: AppStore = useAppStore();
  const dialogOpenCount: number = useSelector(selectDialogOpenCount);
  const shownAtCountRef = useRef<number | undefined>(undefined);
  const isLastInteractionInDrawerRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isShown) {
      return undefined;
    }

    const rememberInteraction = ({ target }: Event): void => {
      isLastInteractionInDrawerRef.current =
        !!drawerClassName && target instanceof Element && !!target.closest(`.${drawerClassName}`);
    };

    document.addEventListener('pointerdown', rememberInteraction, true);
    document.addEventListener('keydown', rememberInteraction, true);

    return (): void => {
      document.removeEventListener('pointerdown', rememberInteraction, true);
      document.removeEventListener('keydown', rememberInteraction, true);
    };
  }, [isShown, drawerClassName]);

  useEffect(() => {
    if (!isShown) {
      shownAtCountRef.current = undefined;

      return;
    }

    // Read from the store, not the render: the drawer's own opening has already raised the count.
    const currentCount: number = selectDialogOpenCount(store.getState());

    // eslint-disable-next-line no-restricted-syntax -- a count of 0 is a real baseline, distinct from none yet.
    if (shownAtCountRef.current === undefined) {
      shownAtCountRef.current = currentCount;

      return;
    }

    if (currentCount > shownAtCountRef.current) {
      shownAtCountRef.current = currentCount;

      if (!isLastInteractionInDrawerRef.current) {
        onClose();
      }
    }
  }, [isShown, dialogOpenCount, store, onClose]);
};
