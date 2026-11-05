/**
 * The test sample: a square with cells that burn darker step by step. The icon set has none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ExperimentOutlined } from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import type { ReactNode } from 'react';

export const TestSampleIcon = (props: AntdIconProps): ReactNode => <ExperimentOutlined {...props} />;
