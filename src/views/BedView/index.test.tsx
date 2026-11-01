import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { BedView } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { BED_HEAD_TEST_ID, BED_WORK_ORIGIN_TEST_ID } from './bed.view.constants';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const HEAD_POSITION = { x: 100, y: 50, z: 0 };
const PLACEHOLDER_TEXT = 'Nothing here yet';
const WIDTH_LABEL_TEXT = '400';
const HEIGHT_LABEL_TEXT = '300';
const OUTSIDE_WORK_ORIGIN = { x: -50, y: 20, z: 0 };
const OUTSIDE_SCREEN_TRANSFORM = 'translate(0 280)';
const CHILD_TEST_ID = 'bed-child';

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

const getRulerLabelCount = (container: HTMLElement, labelText: string): number => {
  let count: number = 0;

  for (const textElement of container.querySelectorAll('text')) {
    if (textElement.textContent === labelText) {
      count++;
    }
  }

  return count;
};

describe(BedView.name, () => {
  it('sizes the view box in millimetres', () => {
    renderBed({});

    expect(screen.getByRole('img')).toHaveAttribute('viewBox', '0 0 400 300');
  });

  it('puts the crosshair at the head position with the Y axis flipped', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('transform', 'translate(100 250)');
  });

  it('names the size and head position in the accessible label', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByRole('img', { name: /400 by 300 mm.*X 100\.00, Y 50\.00/ })).toBeInTheDocument();
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
    renderBed({ headPosition: { x: -50, y: 20, z: 0 } });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('transform', 'translate(0 280)');
    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('data-outside-bed', 'true');
    expect(screen.getByRole('img', { name: /outside the bed/ })).toBeInTheDocument();
  });

  it('clamps a head beyond the far corner to the bed edge', () => {
    renderBed({ headPosition: { x: 450, y: 350, z: 0 } });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('transform', 'translate(400 0)');
    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('data-outside-bed', 'true');
  });

  it('uses the normal style for a head inside the bed', () => {
    renderBed({ headPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('data-outside-bed', 'false');
  });

  it('skips the ruler labels at the far edges that would sit outside the view box', () => {
    const container: HTMLElement = renderBed({});

    expect(getRulerLabelCount(container, WIDTH_LABEL_TEXT)).toBe(0);
    // 300 still labels the top ruler; only the top-most left label at the bed height is skipped.
    expect(getRulerLabelCount(container, HEIGHT_LABEL_TEXT)).toBe(1);
  });

  it('keeps a work zero outside the bed visible at the edge in the outside style', () => {
    renderBed({ workOriginPosition: OUTSIDE_WORK_ORIGIN });

    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute('transform', OUTSIDE_SCREEN_TRANSFORM);
    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute('data-outside-bed', 'true');
    expect(screen.getByRole('img', { name: /Work zero at X -50\.00, Y 20\.00.*outside the bed/ })).toBeInTheDocument();
  });

  it('uses the normal style for a work zero inside the bed', () => {
    renderBed({ workOriginPosition: HEAD_POSITION });

    expect(screen.getByTestId(BED_WORK_ORIGIN_TEST_ID)).toHaveAttribute('data-outside-bed', 'false');
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
