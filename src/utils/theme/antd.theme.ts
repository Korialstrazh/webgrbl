/**
 * The antd theme: the dark algorithm with our design tokens, so antd components share the look of our SCSS styles.
 * Every value mirrors src/styles/tokens.scss; a test keeps the two equal.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const COLOR_BG = '#121417';
const COLOR_SURFACE_1 = '#16191c';
const COLOR_SURFACE_2 = '#1d2024';
const COLOR_SURFACE_3 = '#23272c';
const COLOR_SURFACE_HOVER = '#212429';
const COLOR_SURFACE_ACTIVE = '#23272c';
const COLOR_BORDER = '#2a2e34';
const COLOR_TEXT = '#e6e8eb';
const COLOR_TEXT_MUTED = '#a3a9b0';
const COLOR_ACCENT = '#ff8a1f';
const COLOR_ACCENT_HOVER = '#ff9a3d';
const COLOR_ACCENT_ACTIVE = '#e67a14';
// The darker danger shades keep light text on error buttons above 4.5:1 in every state.
const COLOR_DANGER_BUTTON = '#b52a2d';
const COLOR_DANGER_BUTTON_HOVER = '#a82629';
const COLOR_DANGER_BUTTON_ACTIVE = '#9d2326';
// Error text (form messages, error alerts) needs a lighter red than the buttons to stay above 4.5:1 on every surface.
const COLOR_DANGER_TEXT = '#ff6b6b';
const COLOR_DISABLED_BG = '#1a1d21';
const COLOR_DISABLED_TEXT = '#8b9097';
// antd's dark algorithm derives a bright blue-grey disabled border that made disabled buttons look more prominent than
// enabled ones; this one is fainter than the enabled border.
const COLOR_DISABLED_BORDER = '#23272c';
const COLOR_WARNING = '#ffb547';
const COLOR_SUCCESS = '#3fcf8e';
const COLOR_INFO = '#4aa3ff';
const COLOR_FOCUS_RING = '#ff8a1f';
/** --focus-outline-width (0.125rem) in pixels. */
const FOCUS_OUTLINE_WIDTH_PIXELS = 2;
/** The grip on a splitter bar is 2rem long, so the bar is easy to find and to grab. */
const SPLITTER_GRIP_LENGTH_PIXELS = 32;
/** --radius-md (0.5rem) in pixels. */
const BORDER_RADIUS_PIXELS = 8;
/** --control-height (2.25rem) in pixels. */
const CONTROL_HEIGHT_PIXELS = 36;
/** --target-min (2.75rem) in pixels: large buttons are machine controls and need the full touch target. */
const TARGET_MIN_PIXELS = 44;
/** The button label weight of the approved design. */
const BUTTON_FONT_WEIGHT = 600;

// The slider handle is a 1rem target (WCAG 2.5.8 asks for at least 24 px including the space around it); the rail is
// thick enough to read as the timeline.
const SLIDER_HANDLE_SIZE_PIXELS = 16;
const SLIDER_HANDLE_HOVER_SIZE_PIXELS = 18;
const SLIDER_RAIL_SIZE_PIXELS = 6;
const SLIDER_CONTROL_SIZE_PIXELS = 16;
const FONT_FAMILY_UI = '\'Inter\', system-ui, -apple-system, \'Segoe UI\', Roboto, sans-serif';
const FONT_FAMILY_CODE = '\'JetBrains Mono\', ui-monospace, \'SFMono-Regular\', Consolas, monospace';

export const ANTD_THEME: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: COLOR_ACCENT,
    colorPrimaryHover: COLOR_ACCENT_HOVER,
    colorPrimaryActive: COLOR_ACCENT_ACTIVE,
    colorBgBase: COLOR_BG,
    colorBgContainer: COLOR_SURFACE_1,
    colorBgElevated: COLOR_SURFACE_2,
    // Tooltips share the dark surface of the popovers instead of antd's slate.
    colorBgSpotlight: COLOR_SURFACE_3,
    colorBorder: COLOR_BORDER,
    colorText: COLOR_TEXT,
    colorTextSecondary: COLOR_TEXT_MUTED,
    colorError: COLOR_DANGER_BUTTON,
    colorErrorHover: COLOR_DANGER_BUTTON_HOVER,
    colorErrorActive: COLOR_DANGER_BUTTON_ACTIVE,
    colorErrorText: COLOR_DANGER_TEXT,
    colorTextDisabled: COLOR_DISABLED_TEXT,
    colorBgContainerDisabled: COLOR_DISABLED_BG,
    colorBorderDisabled: COLOR_DISABLED_BORDER,
    colorWarning: COLOR_WARNING,
    colorSuccess: COLOR_SUCCESS,
    colorInfo: COLOR_INFO,
    borderRadius: BORDER_RADIUS_PIXELS,
    fontFamily: FONT_FAMILY_UI,
    fontFamilyCode: FONT_FAMILY_CODE,
    controlHeight: CONTROL_HEIGHT_PIXELS,
    // antd draws its focus outline in colorPrimaryBorder, which the dark algorithm derives as a dark brown (1.6:1).
    colorPrimaryBorder: COLOR_FOCUS_RING,
    lineWidthFocus: FOCUS_OUTLINE_WIDTH_PIXELS,
  },
  components: {
    // antd paints the header and siders navy by default; the regions use our surfaces instead.
    Layout: {
      bodyBg: COLOR_BG,
      headerBg: COLOR_SURFACE_1,
      siderBg: COLOR_SURFACE_1,
      footerBg: COLOR_SURFACE_1,
    },
    // The dark algorithm derives darker shades from the seed colours, so the components that show the accent and the
    // danger colour get the exact token values back. antd puts white text on every solid button; the accent needs
    // dark text to stay readable.
    Button: {
      colorPrimary: COLOR_ACCENT,
      colorPrimaryHover: COLOR_ACCENT_HOVER,
      colorPrimaryActive: COLOR_ACCENT_ACTIVE,
      colorError: COLOR_DANGER_BUTTON,
      colorErrorHover: COLOR_DANGER_BUTTON_HOVER,
      colorErrorActive: COLOR_DANGER_BUTTON_ACTIVE,
      primaryColor: COLOR_BG,
      dangerColor: COLOR_TEXT,
      defaultBg: COLOR_SURFACE_2,
      defaultHoverBg: COLOR_SURFACE_HOVER,
      defaultActiveBg: COLOR_SURFACE_ACTIVE,
      controlHeightLG: TARGET_MIN_PIXELS,
      fontWeight: BUTTON_FONT_WEIGHT,
      borderColorDisabled: COLOR_DISABLED_BORDER,
    },
    // The selected row is a neutral surface with the main text (12.2:1) and an accent edge, instead of accent text on
    // a brown fill (3.4:1).
    Menu: {
      itemSelectedBg: COLOR_SURFACE_3,
      itemSelectedColor: COLOR_TEXT,
    },
    Switch: {
      colorPrimary: COLOR_ACCENT,
      colorPrimaryHover: COLOR_ACCENT_HOVER,
    },
    Slider: {
      trackBg: COLOR_ACCENT,
      trackHoverBg: COLOR_ACCENT_HOVER,
      handleColor: COLOR_ACCENT,
      handleActiveColor: COLOR_ACCENT_HOVER,
      railBg: COLOR_SURFACE_3,
      handleSize: SLIDER_HANDLE_SIZE_PIXELS,
      handleSizeHover: SLIDER_HANDLE_HOVER_SIZE_PIXELS,
      railSize: SLIDER_RAIL_SIZE_PIXELS,
      controlSize: SLIDER_CONTROL_SIZE_PIXELS,
    },
    Select: {
      hoverBorderColor: COLOR_ACCENT_HOVER,
      activeBorderColor: COLOR_ACCENT,
      optionSelectedBg: COLOR_SURFACE_3,
    },
    // At rest a bar is a border-coloured line with a muted grip; hovered and dragged it turns to the accent.
    Splitter: {
      controlItemBgHover: COLOR_BORDER,
      controlItemBgActive: COLOR_ACCENT,
      controlItemBgActiveHover: COLOR_ACCENT_ACTIVE,
      colorFill: COLOR_TEXT_MUTED,
      splitBarDraggableSize: SPLITTER_GRIP_LENGTH_PIXELS,
    },
    Segmented: {
      trackBg: COLOR_SURFACE_1,
      itemColor: COLOR_TEXT_MUTED,
      itemHoverBg: COLOR_SURFACE_HOVER,
      itemSelectedBg: COLOR_SURFACE_3,
      itemSelectedColor: COLOR_TEXT,
    },
  },
};
