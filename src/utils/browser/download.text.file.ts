/**
 * Saves a text file to the user's downloads through a temporary object URL and download link.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DownloadedTextFile } from './interfaces/DownloadedTextFile';

const DOWNLOAD_LINK_TAG_NAME = 'a';

export const downloadTextFile = ({ text, fileName, mimeType }: DownloadedTextFile): void => {
  const fileBlob: Blob = new Blob([text], { type: mimeType });
  const objectUrl: string = URL.createObjectURL(fileBlob);
  const downloadLink: HTMLAnchorElement = document.createElement(DOWNLOAD_LINK_TAG_NAME);

  downloadLink.href = objectUrl;
  downloadLink.download = fileName;
  downloadLink.click();

  // The click starts the download at once, so the URL is no longer needed.
  URL.revokeObjectURL(objectUrl);
};
