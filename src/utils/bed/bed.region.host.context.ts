/**
 * The element of the bed region that dialogs and drawers render into, so they never cover the machine panel or STOP.
 * It is null until the bed region has mounted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createContext } from 'react';

export const BedRegionHostContext = createContext<HTMLElement | null>(null);
