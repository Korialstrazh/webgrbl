/**
 * Gets the data URL that draws an object's SVG text as an image. The URLs are cached per SVG text, so a render does not
 * encode megabytes of artwork again; the cache holds at most one entry per object a project may have.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { MAX_PROJECT_OBJECTS } from './project.constants';

const SVG_DATA_URL_PREFIX = 'data:image/svg+xml;charset=utf-8,';

const dataUrlsBySvgText: Map<string, string> = new Map();

const forgetOldestSvgDataUrl = (): void => {
  // A Map keeps insertion order, so the first key is the oldest entry.
  for (const oldestSvgText of dataUrlsBySvgText.keys()) {
    dataUrlsBySvgText.delete(oldestSvgText);

    return;
  }
};

export const getSvgDataUrl = (svgText: string): string => {
  const cachedDataUrl: string | undefined = dataUrlsBySvgText.get(svgText);

  if (cachedDataUrl) {
    return cachedDataUrl;
  }

  const dataUrl: string = `${SVG_DATA_URL_PREFIX}${encodeURIComponent(svgText)}`;

  if (dataUrlsBySvgText.size >= MAX_PROJECT_OBJECTS) {
    forgetOldestSvgDataUrl();
  }

  dataUrlsBySvgText.set(svgText, dataUrl);

  return dataUrl;
};
