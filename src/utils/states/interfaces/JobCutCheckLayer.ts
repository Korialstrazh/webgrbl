/**
 * One line layer of the last finished job that the cut check offers to run again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface JobCutCheckLayer {
  /** Key of the layer. */
  layerKey: string;
  /** Name the layer list shows for the layer. */
  name: string;
  /** True for a layer set from the Cut palette entry, which most likely did not cut through. */
  isTickedByDefault: boolean;
  /** The material preset the layer was set from; undefined when it was not, or was changed by hand. */
  presetId?: string;
}
