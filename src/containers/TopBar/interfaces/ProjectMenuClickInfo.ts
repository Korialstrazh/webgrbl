/**
 * The click info antd passes for a Project menu entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MenuProps } from 'antd';

export type ProjectMenuClickInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];
