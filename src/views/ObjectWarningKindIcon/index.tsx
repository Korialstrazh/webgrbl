/**
 * The pictogram of one kind of warning on an object, put at the start of each line of a warning list so the kind reads
 * at a glance: a letter for text, a picture for an image, copies for a nested-use limit, an outward frame for parts off
 * the page, scissors for a clip or mask and a broken file for an SVG that could not be read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  CopyOutlined,
  ExpandOutlined,
  FileExclamationOutlined,
  FontSizeOutlined,
  PictureOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { SVG_UNSUPPORTED_KIND } from '../../utils/svg/geometry/svg.shape.constants';
import type { SvgUnsupportedKind } from '../../utils/svg/geometry/svg.shape.constants';

interface ObjectWarningKindIconProps {
  kind: SvgUnsupportedKind;
}

export const ObjectWarningKindIcon = ({ kind }: ObjectWarningKindIconProps): ReactNode => {
  switch (kind) {
  case SVG_UNSUPPORTED_KIND.TEXT:
    return <FontSizeOutlined aria-hidden />;
  case SVG_UNSUPPORTED_KIND.IMAGE:
    return <PictureOutlined aria-hidden />;
  case SVG_UNSUPPORTED_KIND.USE_LIMIT:
    return <CopyOutlined aria-hidden />;
  case SVG_UNSUPPORTED_KIND.OFF_PAGE:
    return <ExpandOutlined aria-hidden />;
  case SVG_UNSUPPORTED_KIND.CLIPPED:
    return <ScissorOutlined aria-hidden />;
  default:
    return <FileExclamationOutlined aria-hidden />;
  }
};
