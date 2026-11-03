/**
 * The sheet a 3D camera is framed to, whatever the shape of the view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneCameraFraming } from './BurnSceneCameraFraming';

export type BurnSceneModelFraming = Omit<BurnSceneCameraFraming, 'aspectRatio'>;
