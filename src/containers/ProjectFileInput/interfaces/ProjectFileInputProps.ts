/**
 * Props of ProjectFileInput.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { RefObject } from 'react';

export interface ProjectFileInputProps {
  /** Ref the owner uses to open the file picker with a click on the input. */
  inputRef: RefObject<HTMLInputElement | null>;
}
