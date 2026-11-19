/**
 * What one compact Cut check warning row shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CutCheckWarning } from '../../../utils/burn.model/interfaces/CutCheckWarning';

export interface CutCheckWarningRowProps {
  /** The first warning of the group; it names the layer and the depths. */
  warning: CutCheckWarning;
  /** The display name of the warning's layer. */
  layerName: string;
  /** How many parts the group speaks of. */
  partCount: number;
}
