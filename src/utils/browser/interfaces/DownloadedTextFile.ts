/**
 * A text file the browser saves to the user's downloads.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface DownloadedTextFile {
  /** Content of the file. */
  text: string;
  /** Name the file is saved under. */
  fileName: string;
  /** Media type of the content, such as application/json. */
  mimeType: string;
}
