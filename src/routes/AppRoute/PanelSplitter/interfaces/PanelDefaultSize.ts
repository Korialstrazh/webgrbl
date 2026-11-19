/**
 * The size a splitter panel opens with: a width in pixels, a percentage text, or undefined to take the space left.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Splitter } from 'antd';
import type { ComponentProps } from 'react';

export type PanelDefaultSize = ComponentProps<typeof Splitter.Panel>['defaultSize'];
