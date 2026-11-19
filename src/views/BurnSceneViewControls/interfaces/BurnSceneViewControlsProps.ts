/**
 * Props of BurnSceneViewControls: what the two view buttons do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnSceneViewControlsProps {
  /** Brings back the first view of the whole sheet. */
  onFit: () => void;
  /** Looks straight down at the sheet. */
  onTop: () => void;
}
