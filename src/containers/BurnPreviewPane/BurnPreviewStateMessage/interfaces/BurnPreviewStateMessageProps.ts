/**
 * What the 3D state message needs to know about the scene.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnPreviewStateMessageProps {
  /** True when the scene cannot show, so only the missing-material message still matters. */
  isSceneUnavailable: boolean;
}
