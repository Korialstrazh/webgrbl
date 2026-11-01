/**
 * Tells whether a file the user picked or dropped is an SVG: its name ends in .svg in any letter case, or the browser
 * reports the SVG type. Some systems give SVG files no type, so the name alone is enough.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_FILE_EXTENSION, SVG_MIME_TYPE } from './svg.constants';

export const isSvgFile = (file: File): boolean =>
  file.name.toLowerCase().endsWith(SVG_FILE_EXTENSION) || file.type === SVG_MIME_TYPE;
