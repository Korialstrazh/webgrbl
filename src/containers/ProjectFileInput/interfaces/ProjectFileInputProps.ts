/**
 * Props of ProjectFileInput.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { RefObject } from 'react';

export interface ProjectFileInputProps {
  /** Ref the owner uses to open the file picker with a click on the input. */
  inputRef: RefObject<HTMLInputElement | null>;
}
