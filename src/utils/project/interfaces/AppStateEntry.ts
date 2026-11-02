/**
 * One app-wide value in the database, such as the id of the last opened project or the panel sizes as JSON text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { AppStateKey } from '../project.database.constants';

export interface AppStateEntry {
  key: AppStateKey;
  value: string;
}
