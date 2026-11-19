/**
 * Tells whether the window is wide enough for the side-by-side workbench; follows resizes.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { WIDE_LAYOUT_MEDIA_QUERY } from '../layout.constants';
import { useMediaQueryMatches } from './use.media.query.matches';

export const useIsWideLayout = (): boolean => useMediaQueryMatches(WIDE_LAYOUT_MEDIA_QUERY);
