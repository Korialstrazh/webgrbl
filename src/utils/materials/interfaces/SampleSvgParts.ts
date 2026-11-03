/**
 * What one test sample draws, chosen from the layers of the project it joins.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SampleSvgParts {
  /** The colour of the cut square, and so the key of its layer. */
  cutColour: string;
  /** Whether the sample draws the gradient, which only a working shading layer can burn. */
  hasGradient: boolean;
}
