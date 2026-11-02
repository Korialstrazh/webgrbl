/**
 * Receives the share of a toolpath generation that is done, from 0 to 1.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export type ToolpathProgressListener = (progress: number) => void;
