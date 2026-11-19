/**
 * A text file the browser saves to the user's downloads.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface DownloadedTextFile {
  /** Content of the file. */
  text: string;
  /** Name the file is saved under. */
  fileName: string;
  /** Media type of the content, such as application/json. */
  mimeType: string;
}
