/**
 * What the 3D state message needs to know about the scene.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnPreviewStateMessageProps {
  /** True when the scene cannot show, so only the missing-material message still matters. */
  isSceneUnavailable: boolean;
}
