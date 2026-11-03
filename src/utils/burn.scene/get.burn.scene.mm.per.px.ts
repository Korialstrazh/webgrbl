/**
 * How many mm of the scene one pixel of the view shows, at the current zoom of the orthographic camera.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { OrthographicCamera } from 'three';

export const getBurnSceneMmPerPx = ({ top, bottom, zoom }: OrthographicCamera, heightPx: number): number =>
  (top - bottom) / zoom / heightPx;
