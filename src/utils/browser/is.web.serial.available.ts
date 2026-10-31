/**
 * Tells whether this browser offers the Web Serial API; looked up on each call so tests and unsupported browsers work.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export const isWebSerialAvailable = (): boolean => 'serial' in navigator;
