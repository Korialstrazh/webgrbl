/**
 * The pictogram of a layer mode: a vector path with corner nodes for Line, scan lines for Fill.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GatewayOutlined, MenuOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { LAYER_MODE } from '../../utils/palette/palette.constants';
import type { LayerMode } from '../../utils/palette/palette.constants';

interface LayerModeIconProps {
  mode: LayerMode;
}

export const LayerModeIcon = ({ mode }: LayerModeIconProps): ReactNode =>
  mode === LAYER_MODE.FILL ? <MenuOutlined aria-hidden /> : <GatewayOutlined aria-hidden />;
