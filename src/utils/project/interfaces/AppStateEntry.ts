/**
 * One app-wide value in the database, such as the id of the last opened project or the panel sizes as JSON text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { AppStateKey } from '../project.database.constants';

export interface AppStateEntry {
  key: AppStateKey;
  value: string;
}
