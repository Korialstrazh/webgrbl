/**
 * The app's one IndexedDB database, opened through Dexie. Only the project repository reads or writes it; nothing
 * else constructs a Dexie instance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import type { AppStateEntry } from './interfaces/AppStateEntry';
import type { StoredProject } from './interfaces/StoredProject';
import type { StoredSvgAsset } from './interfaces/StoredSvgAsset';
import {
  WEBGRBL_DATABASE_NAME,
  WEBGRBL_DATABASE_SCHEMA,
  WEBGRBL_DATABASE_TABLE,
  WEBGRBL_DATABASE_VERSION,
} from './project.database.constants';
import type { AppStateKey } from './project.database.constants';

class WebgrblDatabase extends Dexie {
  /** Every project with its objects' transforms, keyed by project id. */
  public readonly projects: Table<StoredProject, string>;
  /** The SVG text of every object, keyed by object id. */
  public readonly svgAssets: Table<StoredSvgAsset, string>;
  /** App-wide values such as the last opened project id. */
  public readonly appState: Table<AppStateEntry, AppStateKey>;

  public constructor() {
    super(WEBGRBL_DATABASE_NAME);

    this.version(WEBGRBL_DATABASE_VERSION).stores(WEBGRBL_DATABASE_SCHEMA);

    this.projects = this.table<StoredProject, string>(WEBGRBL_DATABASE_TABLE.PROJECTS);
    this.svgAssets = this.table<StoredSvgAsset, string>(WEBGRBL_DATABASE_TABLE.SVG_ASSETS);
    this.appState = this.table<AppStateEntry, AppStateKey>(WEBGRBL_DATABASE_TABLE.APP_STATE);
  }
}

export const WEBGRBL_DATABASE: WebgrblDatabase = new WebgrblDatabase();
