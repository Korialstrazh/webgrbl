/**
 * The click info antd passes for a Project menu entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MenuProps } from 'antd';

export type ProjectMenuClickInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];
