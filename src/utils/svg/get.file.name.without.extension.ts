/**
 * Returns a file name without its last extension; a name that only starts with a dot is kept whole.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FILE_EXTENSION_SEPARATOR } from './svg.constants';

const NO_SEPARATOR_INDEX = 0;

export const getFileNameWithoutExtension = (fileName: string): string => {
  const separatorIndex: number = fileName.lastIndexOf(FILE_EXTENSION_SEPARATOR);

  return separatorIndex > NO_SEPARATOR_INDEX ? fileName.slice(0, separatorIndex) : fileName;
};
