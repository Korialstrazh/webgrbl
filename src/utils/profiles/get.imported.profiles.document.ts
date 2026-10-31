/**
 * Reads the text of an imported machine profiles file and adds its profiles to the current ones, as
 * getMergedProfilesDocument does. Returns undefined when the text is not JSON or not a valid profiles document.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getMergedProfilesDocument } from './get.merged.profiles.document';
import type { MachineProfilesDocument } from './interfaces/MachineProfilesDocument';

const getParsedProfilesFileText = (fileText: string): unknown => {
  try {
    return JSON.parse(fileText);
  } catch {
    return undefined;
  }
};

export const getImportedProfilesDocument = (
  current: MachineProfilesDocument,
  fileText: string,
): MachineProfilesDocument | undefined => getMergedProfilesDocument(current, getParsedProfilesFileText(fileText));
