/**
 * What one test sample draws, chosen from the layers of the project it joins.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SampleSvgParts {
  /** The colour of the cut square, and so the key of its layer. */
  cutColour: string;
  /** Whether the sample draws the gradient, which only a working shading layer can burn. */
  hasGradient: boolean;
}
