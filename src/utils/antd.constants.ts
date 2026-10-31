/**
 * Values from the antd component API that the app passes as props.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ButtonProps, PopoverProps } from 'antd';

/** The compact button size, for actions inside a chip or a bar. */
export const ANTD_BUTTON_SIZE_SMALL: ButtonProps['size'] = 'small';

/** The large button size, for machine controls that need the full touch target. */
export const ANTD_BUTTON_SIZE_LARGE: ButtonProps['size'] = 'large';

/** A bordered button on a surface, for secondary actions next to a main one. */
export const ANTD_BUTTON_TYPE_DEFAULT: ButtonProps['type'] = 'default';

/** A button drawn as text only, for secondary actions. */
export const ANTD_BUTTON_TYPE_TEXT: ButtonProps['type'] = 'text';

/** A filled button in the accent colour, for the main action. */
export const ANTD_BUTTON_TYPE_PRIMARY: ButtonProps['type'] = 'primary';

/** The popover opens and closes when its anchor is clicked, and closes on a click outside. */
export const ANTD_POPOVER_TRIGGER_CLICK: PopoverProps['trigger'] = 'click';

/** The popover opens below its anchor, aligned to the anchor's right edge. */
export const ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT: PopoverProps['placement'] = 'bottomRight';
