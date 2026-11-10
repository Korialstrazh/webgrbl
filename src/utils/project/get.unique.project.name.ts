/**
 * Gets a project name no other project uses yet: the name itself when it is free, otherwise the name with the first
 * free number after it, such as "sample (2)", so two automatic names never read the same in Open project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { i18n } from '../localization/localization';

// The first copy is the second project with the name, so its number starts at 2.
const FIRST_COPY_NUMBER = 2;

export const getUniqueProjectName = (projectName: string, takenNames: readonly string[]): string => {
  if (!takenNames.includes(projectName)) {
    return projectName;
  }

  let copyNumber: number = FIRST_COPY_NUMBER;
  let copyName: string = i18n.t(DEFAULT.OPEN_PROJECT_NAME_COPY_SUFFIX, { name: projectName, number: copyNumber });

  while (takenNames.includes(copyName)) {
    copyNumber++;
    copyName = i18n.t(DEFAULT.OPEN_PROJECT_NAME_COPY_SUFFIX, { name: projectName, number: copyNumber });
  }

  return copyName;
};
