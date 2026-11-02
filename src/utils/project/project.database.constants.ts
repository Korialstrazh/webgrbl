/**
 * Name, schema version, tables, indexes and app state keys of the webgrbl IndexedDB database.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { StoredProject } from './interfaces/StoredProject';
import type { StoredSvgAsset } from './interfaces/StoredSvgAsset';

export const WEBGRBL_DATABASE_NAME = 'webgrbl';
export const WEBGRBL_DATABASE_VERSION = 1;

export const WEBGRBL_DATABASE_TABLE = {
  PROJECTS: 'projects',
  SVG_ASSETS: 'svgAssets',
  APP_STATE: 'appState',
} as const;

export const PROJECT_UPDATED_AT_INDEX: keyof StoredProject = 'updatedAt';
export const SVG_ASSET_PROJECT_ID_INDEX: keyof StoredSvgAsset = 'projectId';

/**
 * Dexie schema: the first entry of each table is its primary key, the others are indexes. An SVG row is keyed by
 * project and object together, so the same object id in two projects never shares one row.
 */
export const WEBGRBL_DATABASE_SCHEMA: Record<string, string> = {
  [WEBGRBL_DATABASE_TABLE.PROJECTS]: 'id, updatedAt',
  [WEBGRBL_DATABASE_TABLE.SVG_ASSETS]: '[projectId+objectId], projectId',
  [WEBGRBL_DATABASE_TABLE.APP_STATE]: 'key',
};

export const APP_STATE_KEY = {
  LAST_OPENED_PROJECT_ID: 'lastOpenedProjectId',
  /** The workbench panel sizes the user set, as a JSON list of percentages. */
  PANEL_SIZES: 'panelSizes',
} as const;

export type AppStateKey = (typeof APP_STATE_KEY)[keyof typeof APP_STATE_KEY];
