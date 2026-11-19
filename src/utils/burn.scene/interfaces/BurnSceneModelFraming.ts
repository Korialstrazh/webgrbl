/**
 * The sheet a 3D camera is framed to, whatever the shape of the view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnSceneCameraFraming } from './BurnSceneCameraFraming';

export type BurnSceneModelFraming = Omit<BurnSceneCameraFraming, 'aspectRatio'>;
