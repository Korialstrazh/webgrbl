/**
 * Wraps a test render in the app's antd theme with motion turned off: jsdom never fires animation end events, so
 * antd overlays would otherwise wait a full second before they finish opening or closing.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ReactNode } from 'react';
import { ANTD_THEME } from '../theme/antd.theme';

interface AntdTestProviderProps {
  children: ReactNode;
}

const ANTD_TEST_THEME: ThemeConfig = { ...ANTD_THEME, token: { ...ANTD_THEME.token, motion: false } };

export const AntdTestProvider = ({ children }: AntdTestProviderProps): ReactNode => (
  <ConfigProvider theme={ANTD_TEST_THEME}>{children}</ConfigProvider>
);
