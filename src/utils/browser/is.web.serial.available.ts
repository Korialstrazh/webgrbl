/**
 * Tells whether this browser offers the Web Serial API; looked up on each call so tests and unsupported browsers work.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export const isWebSerialAvailable = (): boolean => 'serial' in navigator;
