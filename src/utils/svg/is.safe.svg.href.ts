/**
 * Tells whether an href value stays inside the file: a same-document reference or an embedded raster image.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_SAFE_DATA_IMAGE_PATTERN, SVG_SAME_DOCUMENT_REFERENCE_PREFIX } from './svg.constants';

export const isSafeSvgHref = (hrefValue: string): boolean => {
  const normalizedValue: string = hrefValue.trim().toLowerCase();

  return (
    normalizedValue.startsWith(SVG_SAME_DOCUMENT_REFERENCE_PREFIX) || SVG_SAFE_DATA_IMAGE_PATTERN.test(normalizedValue)
  );
};
