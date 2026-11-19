/**
 * Gets the name a project is shown with everywhere (top bar, browser tab, Open project): its own name, or, while it
 * still has the default name of a new project, the name of its first object and the local day and time that object was
 * imported (the project's creation day for older objects), so projects do not all read the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { INTL_HOUR_MINUTE_FORMAT, INTL_MEDIUM_DATE_FORMAT } from '../intl.constants';
import { DEFAULT } from '../localization/default.locales';
import { i18n } from '../localization/localization';
import { getDefaultProjectName } from './get.default.project.name';
import type { ProjectDisplayNameSource } from './interfaces/ProjectDisplayNameSource';

export const getProjectDisplayName = (source: ProjectDisplayNameSource, language: string): string => {
  const { name: projectName, createdAt, firstObjectName, firstObjectImportedAt } = source;
  // A cleared project keeps its creation time, so the import time of the first object names the day instead.
  const namedAt: string | undefined = firstObjectImportedAt ?? createdAt;

  if (!firstObjectName || !namedAt || projectName !== getDefaultProjectName()) {
    return projectName || getDefaultProjectName();
  }

  const namedAtDate: Date = new Date(namedAt);

  return i18n.t(DEFAULT.OPEN_PROJECT_FALLBACK_NAME, {
    name: firstObjectName,
    date: new Intl.DateTimeFormat(language, INTL_MEDIUM_DATE_FORMAT).format(namedAtDate),
    time: new Intl.DateTimeFormat(language, INTL_HOUR_MINUTE_FORMAT).format(namedAtDate),
  });
};
