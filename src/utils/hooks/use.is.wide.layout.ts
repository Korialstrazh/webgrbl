/**
 * Tells whether the window is wide enough for the side-by-side workbench; follows resizes.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WIDE_LAYOUT_MEDIA_QUERY } from '../layout.constants';
import { useMediaQueryMatches } from './use.media.query.matches';

export const useIsWideLayout = (): boolean => useMediaQueryMatches(WIDE_LAYOUT_MEDIA_QUERY);
