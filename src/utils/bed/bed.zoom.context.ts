/**
 * Shares the bed zoom with the drawings inside the bed view, so their markers can keep their size on screen. 1, the
 * fitted bed, outside a bed view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createContext } from 'react';

export const BedZoomContext = createContext<number>(1);
