/**
 * Where the bed panel keeps the zoom and pan of the 2D bed view while the viewport is unmounted, as in the 3D view;
 * empty until the viewport first shows, and emptied for a new bed size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { RefObject } from 'react';
import type { BedViewport } from '../../../utils/bed/interfaces/BedViewport';

export type KeptBedViewportRef = RefObject<BedViewport | undefined>;
