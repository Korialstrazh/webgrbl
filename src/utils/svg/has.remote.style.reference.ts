/**
 * Tells whether CSS or attribute text pulls in remote content: an @import rule, a url() that is not data: or a
 * same-document reference, a CSS escape, or an image function.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_CSS_ESCAPE_OR_IMAGE_FUNCTION_PATTERN, SVG_IMPORT_RULE_PATTERN, SVG_REMOTE_URL_PATTERN } from './svg.constants';

export const hasRemoteStyleReference = (styleText: string): boolean =>
  SVG_IMPORT_RULE_PATTERN.test(styleText) ||
  SVG_REMOTE_URL_PATTERN.test(styleText) ||
  SVG_CSS_ESCAPE_OR_IMAGE_FUNCTION_PATTERN.test(styleText);
