/**
 * Everything the Toolpath view draws of one toolpath that does not depend on the time: the burn path groups and the
 * travel path, in bed millimetres with Y up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathStrokePath } from './ToolpathStrokePath';

export interface ToolpathDrawing {
  /** The burn path groups in the order their first move burns. */
  strokePaths: ToolpathStrokePath[];
  /** Path text of every move that burns nothing: travel, and overscan at power 0. */
  travelPathText: string;
}
