/**
 * The app's one IndexedDB database, opened through Dexie. Only the repositories next to it read or write it: the
 * project repository (projects, their SVG text and the last opened project) and the panel sizes repository (the
 * workbench panel sizes in the app state table). Nothing else constructs a Dexie instance.
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
import type { Material } from '../materials/interfaces/Material';
import type { MaterialPreset } from '../materials/interfaces/MaterialPreset';
import type { AppStateEntry } from './interfaces/AppStateEntry';
import type { StoredProject } from './interfaces/StoredProject';
import type { StoredSvgAsset } from './interfaces/StoredSvgAsset';
import type { SvgAssetKey } from './interfaces/SvgAssetKey';
import {
  WEBGRBL_DATABASE_NAME,
  WEBGRBL_DATABASE_SCHEMA,
  WEBGRBL_DATABASE_SCHEMA_VERSION_1,
  WEBGRBL_DATABASE_SCHEMA_VERSION_2,
  WEBGRBL_DATABASE_TABLE,
  WEBGRBL_DATABASE_VERSION,
  WEBGRBL_DATABASE_VERSION_1,
  WEBGRBL_DATABASE_VERSION_2,
} from './project.database.constants';
import type { AppStateKey } from './project.database.constants';

class WebgrblDatabase extends Dexie {
  /** Every project with its objects' transforms, keyed by project id. */
  public readonly projects: Table<StoredProject, string>;
  /** The SVG text of every object, keyed by project id and object id. */
  public readonly svgAssets: Table<StoredSvgAsset, SvgAssetKey>;
  /** App-wide values such as the last opened project id and the workbench panel sizes. */
  public readonly appState: Table<AppStateEntry, AppStateKey>;
  /** The sheet materials with their laser tests, keyed by material id. */
  public readonly materials: Table<Material, string>;
  /** The saved laser settings per material and machine profile, keyed by preset id. */
  public readonly materialPresets: Table<MaterialPreset, string>;

  public constructor() {
    super(WEBGRBL_DATABASE_NAME);

    this.version(WEBGRBL_DATABASE_VERSION_1).stores(WEBGRBL_DATABASE_SCHEMA_VERSION_1);
    this.version(WEBGRBL_DATABASE_VERSION_2).stores(WEBGRBL_DATABASE_SCHEMA_VERSION_2);
    this.version(WEBGRBL_DATABASE_VERSION).stores(WEBGRBL_DATABASE_SCHEMA);

    this.projects = this.table<StoredProject, string>(WEBGRBL_DATABASE_TABLE.PROJECTS);
    this.svgAssets = this.table<StoredSvgAsset, SvgAssetKey>(WEBGRBL_DATABASE_TABLE.SVG_ASSETS);
    this.appState = this.table<AppStateEntry, AppStateKey>(WEBGRBL_DATABASE_TABLE.APP_STATE);
    this.materials = this.table<Material, string>(WEBGRBL_DATABASE_TABLE.MATERIALS);
    this.materialPresets = this.table<MaterialPreset, string>(WEBGRBL_DATABASE_TABLE.MATERIAL_PRESETS);
  }
}

export const WEBGRBL_DATABASE: WebgrblDatabase = new WebgrblDatabase();
