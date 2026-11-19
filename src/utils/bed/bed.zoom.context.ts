/**
 * Shares the bed zoom with the drawings inside the bed view, so their markers can keep their size on screen. 1, the
 * fitted bed, outside a bed view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createContext } from 'react';

export const BedZoomContext = createContext<number>(1);
