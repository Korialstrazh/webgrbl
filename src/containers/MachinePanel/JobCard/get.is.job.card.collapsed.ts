/**
 * Whether the Job card shows only its one-line summary with Start. The viewer's own choice always wins; without one
 * the card folds while a laser is connected on a short screen, so the Move pad stays in view above the Stop bar.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getIsJobCardCollapsed = (
  collapsedChoice: boolean | undefined,
  isConnected: boolean,
  isShortViewport: boolean,
): boolean => collapsedChoice ?? (isConnected && isShortViewport);
