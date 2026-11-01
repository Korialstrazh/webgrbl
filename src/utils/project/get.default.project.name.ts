/**
 * Gets the name a new project gets, in the user's current language.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { i18n } from '../localization/localization';
import { DEFAULT_PROJECT_NAME_KEY } from './project.constants';

export const getDefaultProjectName = (): string => i18n.t(DEFAULT_PROJECT_NAME_KEY);
