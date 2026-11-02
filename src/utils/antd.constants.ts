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
import type {
  AlertProps,
  ButtonProps,
  ColorPickerProps,
  DrawerProps,
  DropdownProps,
  FormItemProps,
  FormProps,
  InputNumberProps,
  MenuProps,
  PopoverProps,
  SegmentedProps,
  SplitterProps,
  SwitchProps,
  TagProps,
  TooltipProps,
} from 'antd';

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

/** Form labels sit above their fields. */
export const ANTD_FORM_LAYOUT_VERTICAL: FormProps['layout'] = 'vertical';

/** A form field drawn in the error colour, with its help text as the error message. */
export const ANTD_FORM_ITEM_STATUS_ERROR: FormItemProps['validateStatus'] = 'error';

/** An alert in the neutral information colour. */
export const ANTD_ALERT_TYPE_INFO: AlertProps['type'] = 'info';

/** An alert in the warning colour, for something the user should fix. */
export const ANTD_ALERT_TYPE_WARNING: AlertProps['type'] = 'warning';

/** A menu that lists its items one below the other inside its container. */
export const ANTD_MENU_MODE_INLINE: MenuProps['mode'] = 'inline';

/** A number input that shows and accepts whole numbers only. */
export const ANTD_INPUT_NUMBER_PRECISION_INTEGER: InputNumberProps['precision'] = 0;

/** The compact switch size, for a switch next to small text. */
export const ANTD_SWITCH_SIZE_SMALL: SwitchProps['size'] = 'small';

/** The dropdown opens and closes when its anchor is clicked. */
export const ANTD_DROPDOWN_TRIGGER_CLICK: DropdownProps['trigger'] = ['click'];

/** The `type` of a menu entry that draws a dividing line between two groups of items. */
export const ANTD_MENU_ITEM_TYPE_DIVIDER = 'divider' as const;

/** The colour picker value format: a six-digit hex colour. */
export const ANTD_COLOR_PICKER_FORMAT_HEX: ColorPickerProps['format'] = 'hex';

/** The drawer slides in from the left edge of its container. */
export const ANTD_DRAWER_PLACEMENT_LEFT: DrawerProps['placement'] = 'left';

/** The splitter stacks its panels top to bottom, with horizontal bars between them. */
export const ANTD_SPLITTER_ORIENTATION_VERTICAL: SplitterProps['orientation'] = 'vertical';

/** The compact segmented control size, for secondary choices next to larger controls. */
export const ANTD_SEGMENTED_SIZE_SMALL: SegmentedProps['size'] = 'small';

/** A tag drawn as a soft filled chip without a border. */
export const ANTD_TAG_VARIANT_FILLED: TagProps['variant'] = 'filled';

/** The tooltip opens while its anchor is hovered or holds the keyboard focus. */
export const ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS: TooltipProps['trigger'] = ['hover', 'focus'];
