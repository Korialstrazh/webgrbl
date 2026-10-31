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
const COLOR_BORDER = '#2a2e34';
const COLOR_TEXT = '#e6e8eb';
const COLOR_TEXT_MUTED = '#8b9097';
const COLOR_ACCENT = '#ff8a1f';
// The darker danger shade keeps light text on error buttons above 4.5:1.
const COLOR_DANGER_BUTTON = '#b52a2d';
const COLOR_WARNING = '#ffb547';
const COLOR_SUCCESS = '#3fcf8e';
const COLOR_INFO = '#4aa3ff';
/** --radius-md (0.5rem) in pixels. */
const BORDER_RADIUS_PIXELS = 8;
/** --control-height (2.25rem) in pixels. */
const CONTROL_HEIGHT_PIXELS = 36;
const FONT_FAMILY_UI = '\'Inter\', system-ui, -apple-system, \'Segoe UI\', Roboto, sans-serif';

export const ANTD_THEME: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: COLOR_ACCENT,
    colorBgBase: COLOR_BG,
    colorBgContainer: COLOR_SURFACE_1,
    colorBgElevated: COLOR_SURFACE_2,
    colorBorder: COLOR_BORDER,
    colorText: COLOR_TEXT,
    colorTextSecondary: COLOR_TEXT_MUTED,
    colorError: COLOR_DANGER_BUTTON,
    colorWarning: COLOR_WARNING,
    colorSuccess: COLOR_SUCCESS,
    colorInfo: COLOR_INFO,
    borderRadius: BORDER_RADIUS_PIXELS,
    fontFamily: FONT_FAMILY_UI,
    controlHeight: CONTROL_HEIGHT_PIXELS,
  },
  components: {
    // antd paints the header and siders navy by default; the regions use our surfaces instead.
    Layout: {
      bodyBg: COLOR_BG,
      headerBg: COLOR_SURFACE_1,
      siderBg: COLOR_SURFACE_1,
      footerBg: COLOR_SURFACE_1,
    },
  },
};
