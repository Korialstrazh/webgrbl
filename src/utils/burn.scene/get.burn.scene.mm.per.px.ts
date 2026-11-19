/**
 * How many mm of the scene one pixel of the view shows, at the current zoom of the orthographic camera.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { OrthographicCamera } from 'three';

export const getBurnSceneMmPerPx = ({ top, bottom, zoom }: OrthographicCamera, heightPx: number): number =>
  (top - bottom) / zoom / heightPx;
