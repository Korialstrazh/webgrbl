/**
 * A box that renames a project in place. Enter or leaving the box commits a trimmed name that is neither empty nor
 * unchanged; Escape cancels. Escape is consumed here, so it neither closes a dialog around the box nor stops the
 * machine.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Input } from 'antd';
import { useRef } from 'react';
import type { FocusEvent, KeyboardEvent, ReactNode, RefObject } from 'react';
import { ENTER_KEY, ESCAPE_KEY } from '../../utils/browser/browser.events.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { MAX_PROJECT_NAME_LENGTH } from '../../utils/project/project.constants';
import type { ProjectRenameInputProps } from './interfaces/ProjectRenameInputProps';
import { PROJECT_RENAME_OVERLAY_ID } from './project.rename.input.constants';

export const ProjectRenameInput = (props: ProjectRenameInputProps): ReactNode => {
  const { initialName, ariaLabel, onCommit, onCancel } = props;
  // Enter or Escape unmounts the box, and some browsers then report a blur that must not finish the rename twice.
  const isFinishedRef: RefObject<boolean> = useRef<boolean>(false);

  useOverlayRegistration(PROJECT_RENAME_OVERLAY_ID, true);

  const finishRename = (typedName: string): void => {
    if (isFinishedRef.current) {
      return;
    }

    isFinishedRef.current = true;

    const trimmedName: string = typedName.trim();

    if (!trimmedName || trimmedName === initialName) {
      onCancel();

      return;
    }

    onCommit(trimmedName);
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLInputElement>): void => {
    if (keyboardEvent.nativeEvent.isComposing) {
      return;
    }

    if (keyboardEvent.key === ESCAPE_KEY) {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      isFinishedRef.current = true;
      onCancel();

      return;
    }

    if (keyboardEvent.key === ENTER_KEY) {
      keyboardEvent.preventDefault();
      finishRename(keyboardEvent.currentTarget.value);
    }
  };

  const handleBlur = (focusEvent: FocusEvent<HTMLInputElement>): void => {
    finishRename(focusEvent.currentTarget.value);
  };

  return (
    <Input
      autoFocus
      defaultValue={initialName}
      maxLength={MAX_PROJECT_NAME_LENGTH}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};
