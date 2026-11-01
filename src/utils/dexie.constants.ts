/**
 * Values from the Dexie API that the app passes to its IndexedDB database.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TransactionMode } from 'dexie';

/** A transaction that only reads, so it sees one consistent state of its tables. */
export const DEXIE_TRANSACTION_MODE_READ: TransactionMode = 'r';

/** A transaction that reads and writes; all its writes land together or not at all. */
export const DEXIE_TRANSACTION_MODE_READ_WRITE: TransactionMode = 'rw';

/** Deletes a database but lets the next query open it again, empty. */
export const DEXIE_DELETE_KEEPING_AUTO_OPEN: { disableAutoOpen: boolean } = { disableAutoOpen: false };
