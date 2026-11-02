/**
 * Test factory for a toolpath with no moves, layers, warnings or bounds unless overridden.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
