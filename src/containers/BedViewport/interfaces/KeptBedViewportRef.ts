/**
 * Where the bed panel keeps the zoom and pan of the 2D bed view while the viewport is unmounted, as in the 3D view;
 * empty until the viewport first shows, and emptied for a new bed size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { RefObject } from 'react';
import type { BedViewport } from '../../../utils/bed/interfaces/BedViewport';

export type KeptBedViewportRef = RefObject<BedViewport | undefined>;
