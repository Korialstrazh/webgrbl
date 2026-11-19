/**
 * Receives the share of a toolpath generation that is done, from 0 to 1.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export type ToolpathProgressListener = (progress: number) => void;
