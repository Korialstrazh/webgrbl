/**
 * Gets the name a new project gets, in the user's current language.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { i18n } from '../localization/localization';
import { DEFAULT_PROJECT_NAME_KEY } from './project.constants';

export const getDefaultProjectName = (): string => i18n.t(DEFAULT_PROJECT_NAME_KEY);
