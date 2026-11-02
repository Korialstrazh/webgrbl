import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { BedView } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { BedViewBox } from '../../utils/bed/interfaces/BedViewBox';
import { BED_HEAD_TEST_ID, BED_WORK_ORIGIN_TEST_ID } from './bed.view.constants';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const HEAD_POSITION = { x: 100, y: 50, z: 0 };
const PLACEHOLDER_TEXT = 'Nothing here yet';
const ZOOMED_VIEW_BOX: BedViewBox = { xMm: 50, yMm: 75, widthMm: 100, heightMm: 75 };
const ZOOM_FOUR_TIMES = 4;
const OUTSIDE_POSITION = { x: -50, y: 20, z: 0 };
const OUTSIDE_SCREEN_TRANSFORM = 'translate(0 280) scale(1)';
const CHILD_TEST_ID = 'bed-child';
const CHILD_NAME = 'Logo';
const TRANSFORM_ATTRIBUTE = 'transform';
const OUTSIDE_ATTRIBUTE = 'data-outside-bed';
const TRUE_TEXT = 'true';
const FALSE_TEXT = 'false';

const renderBed = (overrides: Partial<ComponentProps<typeof BedView>>): HTMLElement => {
  const { container } = render(
    <BedView
      dimensions={DIMENSIONS}
      headPosition={undefined}
      workOriginPosition={undefined}
      placeholderLabel={undefined}
      {...overrides}
    />,
  );

  return container;
};

describe(BedView.name, () => {
  it('exposes the bed as a labelled group, so the objects drawn on it keep their own names', () => {
    renderBed({ children: <g role="img" aria-label={CHILD_NAME} /> });

    expect(screen.getByRole('group', { name: /400 by 300 mm/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: CHILD_NAME })).toBeInTheDocument();
  });

  it('sizes the view box in millimetres', () => {
    renderBed({});

    expect(screen.getByRole('group')).toHaveAttribute('viewBox', '0 0 400 300');
  });

  it('shows the part of the bed in view when zoomed, with the markers kept at their screen size', () => {
    renderBed({ headPosition: HEAD_POSITION, viewBox: ZOOMED_VIEW_BOX, zoom: ZOOM_FOUR_TIMES });

    expect(screen.getByRole('group')).toHaveAttribute('viewBox', '50 75 100 75');
    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(100 250) scale(0.25)');
  });

  it('puts the crosshair at the head position with the Y axis flipped', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(100 250) scale(1)');
  });

  it('names the size and head position in the accessible label', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByRole('group', { name: /400 by 300 mm.*X 100\.00, Y 50\.00/ })).toBeInTheDocument();
  });

  it('shows no crosshair without a head position', () => {
    renderBed({});

    expect(screen.queryByTestId(BED_HEAD_TEST_ID)).not.toBeInTheDocument();
  });

  it('shows the placeholder text', () => {
    renderBed({ placeholderLabel: PLACEHOLDER_TEXT });

    expect(screen.getByText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('keeps a head left of the bed visible at the edge in the outside style', () => {
    renderBed({ headPosition: OUTSIDE_POSITION });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(TRANSFORM_ATTRIBUTE, OUTSIDE_SCREEN_TRANSFORM);
    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(OUTSIDE_ATTRIBUTE, TRUE_TEXT);
    expect(screen.getByRole('group', { name: /outside the bed/ })).toBeInTheDocument();
  });

  it('clamps a head beyond the far corner to the bed edge', () => {
    renderBed({ headPosition: { x: 450, y: 350, z: 0 } });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(TRANSFORM_ATTRIBUTE, 'translate(400 0) scale(1)');
    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(OUTSIDE_ATTRIBUTE, TRUE_TEXT);
  });

  it('uses the normal style for a head inside the bed', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute(OUTSIDE_ATTRIBUTE, FALSE_TEXT);
  });

  it('keeps a work zero outside the bed visible at the edge in the outside style', () => {
    renderBed({ workOriginPosition: OUTSIDE_POSITION });

    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute(TRANSFORM_ATTRIBUTE, OUTSIDE_SCREEN_TRANSFORM);
    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute(OUTSIDE_ATTRIBUTE, TRUE_TEXT);
    expect(screen.getByRole('group', { name: /Work zero at X -50\.00, Y 20\.00.*outside the bed/ }))
      .toBeInTheDocument();
  });

  it('uses the normal style for a work zero inside the bed', () => {
    renderBed({ workOriginPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute(OUTSIDE_ATTRIBUTE, FALSE_TEXT);
  });

  it('draws its children above the grid and below the head and work zero markers', () => {
    const container: HTMLElement = renderBed({
      headPosition: HEAD_POSITION,
      workOriginPosition: HEAD_POSITION,
      children: <rect data-testid={CHILD_TEST_ID} />,
    });
    const childElement: HTMLElement = screen.getByTestId(CHILD_TEST_ID);
    const gridElements: Element[] = [...container.querySelectorAll('svg > path')];
    const lastGridElement: Element | undefined = gridElements[gridElements.length - 1];

    expect(lastGridElement?.compareDocumentPosition(childElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(childElement.compareDocumentPosition(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(childElement.compareDocumentPosition(screen.getByTestId(BED_HEAD_TEST_ID)))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
