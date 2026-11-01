/**
 * Values of the project rename input: the id prefix it registers as an open overlay while shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/**
 * While the rename box is shown it counts as an open overlay, so Escape there only cancels the rename; the global
 * Stop hotkey acts in the capture phase, before the box could consume the key.
 */
export const PROJECT_RENAME_OVERLAY_ID = 'project-rename';
