/**
 * The size a splitter panel opens with: a width in pixels, a percentage text, or undefined to take the space left.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Splitter } from 'antd';
import type { ComponentProps } from 'react';

export type PanelDefaultSize = ComponentProps<typeof Splitter.Panel>['defaultSize'];
