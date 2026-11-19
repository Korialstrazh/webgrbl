/**
 * A small drawing of the type of an SVG shape (a rectangle, a circle, a curve, a line, a polygon, text or an image),
 * so the rows of the element tree read as shapes and never as checkboxes. Unknown elements get a generic curve.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FileImageOutlined, FontSizeOutlined, LinkOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface SvgShapeIconProps {
  /** The SVG element name, such as rect or path. */
  elementName: string;
}

const SHAPE_ICON_VIEW_BOX = '0 0 16 16';
const SHAPE_ICON_SIZE = '1em';
const SHAPE_ICON_STROKE_WIDTH = '1.4';

const SHAPE_DRAWING: Readonly<Record<string, ReactNode>> = {
  rect: <rect x="1.5" y="4" width="13" height="8" />,
  circle: <circle cx="8" cy="8" r="5.5" />,
  ellipse: <ellipse cx="8" cy="8" rx="6.5" ry="4" />,
  line: <line x1="2" y1="14" x2="14" y2="2" />,
  polyline: <polyline points="1.5,12 5.5,5 9.5,10 14.5,3" />,
  polygon: <polygon points="8,1.5 14.5,13.5 1.5,13.5" />,
  path: <path d="M2 13 C 3 3, 8 3, 8 8 S 13 13, 14 3" />,
};

const SHAPE_ICON: Readonly<Record<string, ReactNode>> = {
  text: <FontSizeOutlined />,
  image: <FileImageOutlined />,
  use: <LinkOutlined />,
};

export const SvgShapeIcon = ({ elementName }: SvgShapeIconProps): ReactNode => SHAPE_ICON[elementName] ?? (
  <svg
    className="anticon"
    viewBox={SHAPE_ICON_VIEW_BOX}
    width={SHAPE_ICON_SIZE}
    height={SHAPE_ICON_SIZE}
    fill="none"
    stroke="currentColor"
    strokeWidth={SHAPE_ICON_STROKE_WIDTH}
    strokeLinejoin="round"
    strokeLinecap="round"
    data-shape-icon={elementName}
  >
    {SHAPE_DRAWING[elementName] ?? SHAPE_DRAWING.path}
  </svg>
);
