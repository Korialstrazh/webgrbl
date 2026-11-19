/**
 * Timers that keep their pace in a hidden browser tab, where window timers are slowed down to once a minute or less.
 * The ids of setInterval and setTimeout are cleared with clear().
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BackgroundTimer {
  setInterval(callback: () => void, ms: number): number;
  setTimeout(callback: () => void, ms: number): number;
  clear(id: number): void;
}
