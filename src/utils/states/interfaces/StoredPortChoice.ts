/**
 * The part of the stored connection preferences that identifies the chosen port.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ConnectionPreferences } from '../../storage/interfaces/ConnectionPreferences';

export type StoredPortChoice = ConnectionPreferences['portChoice'];
