/**
 * Values from the antd component API that the app passes as props.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type {
  AlertProps,
  BadgeProps,
  ButtonProps,
  CardProps,
  ColorPickerProps,
  DrawerProps,
  DropdownProps,
  FlexProps,
  FormItemProps,
  FormProps,
  InputNumberProps,
  MenuProps,
  PopoverProps,
  ProgressProps,
  SegmentedProps,
  SpinProps,
  SplitterProps,
  StepsProps,
  SwitchProps,
  TableColumnType,
  TableProps,
  TagProps,
  TooltipProps,
} from 'antd';

/** The compact button size, for actions inside a chip or a bar. */
export const ANTD_BUTTON_SIZE_SMALL: ButtonProps['size'] = 'small';

/** The round button shape, for a small floating hint button. */
export const ANTD_BUTTON_SHAPE_CIRCLE: ButtonProps['shape'] = 'circle';

/** The small card, the base of a workbench panel with a tight heading line. */
export const ANTD_CARD_SIZE_SMALL: CardProps['size'] = 'small';

/** The small stepper, for the readiness row of the Job card. */
export const ANTD_STEPS_SIZE_SMALL: StepsProps['size'] = 'small';

/** Step names under their markers. */
export const ANTD_STEPS_TITLE_PLACEMENT_VERTICAL: StepsProps['titlePlacement'] = 'vertical';

/** The antd Steps status of one step. */
export const ANTD_STEPS_STATUS = {
  FINISH: 'finish',
  PROCESS: 'process',
  WAIT: 'wait',
} as const;

/** A Flex row whose items sit on its middle line. */
export const ANTD_FLEX_ALIGN_CENTER: FlexProps['align'] = 'center';

/** A Flex row drawn as an inline span, for use inside a heading line. */
export const ANTD_FLEX_COMPONENT_SPAN: FlexProps['component'] = 'span';

/** The small Flex gap, the same as the space-2 step. */
export const ANTD_FLEX_GAP_SMALL: FlexProps['gap'] = 'small';

/** The compact badge, for a count on an icon button. */
export const ANTD_BADGE_SIZE_SMALL: BadgeProps['size'] = 'small';

/** The warning status badge, for the dot that marks why an action is locked. */
export const ANTD_BADGE_STATUS_WARNING: BadgeProps['status'] = 'warning';

/** The large button size, for machine controls that need the full touch target. */
export const ANTD_BUTTON_SIZE_LARGE: ButtonProps['size'] = 'large';

/** A bordered button on a surface, for secondary actions next to a main one. */
export const ANTD_BUTTON_TYPE_DEFAULT: ButtonProps['type'] = 'default';

/** A button drawn as text only, for secondary actions. */
export const ANTD_BUTTON_TYPE_TEXT: ButtonProps['type'] = 'text';

/** A filled button in the accent colour, for the main action. */
export const ANTD_BUTTON_TYPE_PRIMARY: ButtonProps['type'] = 'primary';

/** A button drawn as a link, for a line of text that leads somewhere. */
export const ANTD_BUTTON_TYPE_LINK: ButtonProps['type'] = 'link';

/** Matches the root of any open antd popover, wherever it is portalled. */
export const ANTD_POPOVER_SELECTOR = '.ant-popover';

/** The popover opens and closes when its anchor is clicked, and closes on a click outside. */
export const ANTD_POPOVER_TRIGGER_CLICK: PopoverProps['trigger'] = 'click';

/** The popover opens on a pointer hover only, for text that keyboard and screen reader users reach another way. */
export const ANTD_POPOVER_TRIGGER_HOVER: PopoverProps['trigger'] = 'hover';

/** The popover opens on a hover or on a tap or click, so it never depends on a hover alone. */
export const ANTD_POPOVER_TRIGGER_HOVER_AND_CLICK: PopoverProps['trigger'] = ['hover', 'click'];

/** The popover opens below its anchor, aligned to the anchor's right edge. */
export const ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT: PopoverProps['placement'] = 'bottomRight';

/** The popover opens to the left of its anchor, aligned to the anchor's top edge. */
export const ANTD_POPOVER_PLACEMENT_LEFT_TOP: PopoverProps['placement'] = 'leftTop';

/** The popover opens to the left of its anchor, aligned to the anchor's bottom edge. */
export const ANTD_POPOVER_PLACEMENT_LEFT_BOTTOM: PopoverProps['placement'] = 'leftBottom';

/** The popover opens below its anchor, aligned to the anchor's left edge. */
export const ANTD_POPOVER_PLACEMENT_BOTTOM_LEFT: PopoverProps['placement'] = 'bottomLeft';

/** The popover opens to the right of its anchor, aligned to the anchor's top edge. */
export const ANTD_POPOVER_PLACEMENT_RIGHT_TOP: PopoverProps['placement'] = 'rightTop';

/** A progress bar that stays neutral at 100%, for work that is not done when the bar is full. */
export const ANTD_PROGRESS_STATUS_NORMAL: ProgressProps['status'] = 'normal';

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
export const ANTD_COLLAPSE_SIZE_SMALL = 'small';

export const ANTD_SWITCH_SIZE_SMALL: SwitchProps['size'] = 'small';

/** The dropdown opens and closes when its anchor is clicked. */
export const ANTD_DROPDOWN_TRIGGER_CLICK: DropdownProps['trigger'] = ['click'];

/** The `type` of a menu entry that draws a dividing line between two groups of items. */
export const ANTD_MENU_ITEM_TYPE_DIVIDER = 'divider' as const;

/** The `type` of a menu entry drawn as a muted group title: plain text that cannot be chosen. */
export const ANTD_MENU_ITEM_TYPE_GROUP = 'group' as const;

/** The colour picker value format: a six-digit hex colour. */
export const ANTD_COLOR_PICKER_FORMAT_HEX: ColorPickerProps['format'] = 'hex';

/** The drawer slides in from the left edge of its container. */
export const ANTD_DRAWER_PLACEMENT_LEFT: DrawerProps['placement'] = 'left';

/** The splitter stacks its panels top to bottom, with horizontal bars between them. */
export const ANTD_SPLITTER_ORIENTATION_VERTICAL: SplitterProps['orientation'] = 'vertical';

/** The compact segmented control size, for secondary choices next to larger controls. */
export const ANTD_SEGMENTED_SIZE_SMALL: SegmentedProps['size'] = 'small';

/** Antd's class name of one option box of a Segmented control. */
export const ANTD_SEGMENTED_ITEM_SELECTOR = '.ant-segmented-item';

/** The small spinner, for a spinner inline with a line of text. */
export const ANTD_SPIN_SIZE_SMALL: SpinProps['size'] = 'small';

/** The compact table size, for a table beside an edit panel. */
export const ANTD_TABLE_SIZE_SMALL: TableProps['size'] = 'small';

/** A table column whose header and cells sit at the right edge, for numbers. */
export const ANTD_TABLE_COLUMN_ALIGN_RIGHT: TableColumnType<unknown>['align'] = 'right';

/** A tag drawn as a soft filled chip without a border. */
export const ANTD_TAG_VARIANT_FILLED: TagProps['variant'] = 'filled';

/** A tag that warns. */
export const ANTD_TAG_COLOR_WARNING: TagProps['color'] = 'warning';

/** A tag in the success colour, for something that turned out well. */
export const ANTD_TAG_COLOR_SUCCESS: TagProps['color'] = 'success';

/** The tooltip opens while its anchor is hovered or holds the keyboard focus. */
export const ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS: TooltipProps['trigger'] = ['hover', 'focus'];

/**
 * The tooltip opens on a hover, and also on a long press (the context menu event touch browsers send), so a screen
 * without hover still reaches the name of an icon-only control.
 */
export const ANTD_TOOLTIP_TRIGGER_HOVER_AND_LONG_PRESS: TooltipProps['trigger'] = ['hover', 'contextMenu'];

export const ANTD_TOOLTIP_PLACEMENT_BOTTOM: TooltipProps['placement'] = 'bottom';
export const ANTD_TOOLTIP_PLACEMENT_LEFT: TooltipProps['placement'] = 'left';
export const ANTD_TOOLTIP_PLACEMENT_TOP_RIGHT: TooltipProps['placement'] = 'topRight';

/** An input number outlined as having an invalid value. */
export const ANTD_INPUT_NUMBER_STATUS_ERROR: InputNumberProps['status'] = 'error';

/** Antd's class names for a modal's content box and title, for moving the focus into a dialog that opened. */
export const ANTD_MODAL_CONTENT_SELECTOR = '.ant-modal-content';
export const ANTD_MODAL_TITLE_SELECTOR = '.ant-modal-title';

/** A popover that opens above its anchor and ends at its right edge. */
export const ANTD_POPOVER_PLACEMENT_TOP_RIGHT: PopoverProps['placement'] = 'topRight';

/** The `align` of `Tree.scrollTo` that scrolls only as far as needed to bring the row into view. */
export const ANTD_TREE_SCROLL_ALIGN_AUTO = 'auto';
