/**
 * Props of BurnSceneViewControls: what the two view buttons do.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnSceneViewControlsProps {
  /** Brings back the first view of the whole sheet. */
  onFit: () => void;
  /** Looks straight down at the sheet. */
  onTop: () => void;
}
