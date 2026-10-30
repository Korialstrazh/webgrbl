/**
 * The part of the stored connection preferences that identifies the chosen port.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ConnectionPreferences } from '../../storage/interfaces/ConnectionPreferences';

export type StoredPortChoice = ConnectionPreferences['portChoice'];
