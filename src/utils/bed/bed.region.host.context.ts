/**
 * The element of the bed region that dialogs and drawers render into, so they never cover the machine panel or STOP.
 * It is null until the bed region has mounted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createContext } from 'react';

export const BedRegionHostContext = createContext<HTMLElement | null>(null);
