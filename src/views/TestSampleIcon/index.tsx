/**
 * The test sample: a square with cells that burn darker step by step. The icon set has none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ExperimentOutlined } from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import type { ReactNode } from 'react';

export const TestSampleIcon = (props: AntdIconProps): ReactNode => <ExperimentOutlined {...props} />;
