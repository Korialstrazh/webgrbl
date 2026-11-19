/**
 * Test factory for a toolpath with no moves, layers, warnings or bounds unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Toolpath } from '../interfaces/Toolpath';

export const newToolpath = (overrides: Partial<Toolpath> = {}): Toolpath => ({
  startPoint: { x: 0, y: 0 },
  moves: [],
  layers: [],
  warnings: [],
  bounds: undefined,
  ...overrides,
});
