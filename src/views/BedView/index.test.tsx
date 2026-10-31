import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { BedView } from '.';
import { BED_PLACEHOLDER_KIND } from '../../utils/bed/bed.constants';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { BED_HEAD_TEST_ID } from './bed.view.constants';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const HEAD_POSITION = { x: 100, y: 50, z: 0 };
const PLACEHOLDER_TEXT = 'Nothing here yet';

const renderBed = (overrides: Partial<ComponentProps<typeof BedView>>): void => {
  render(
    <BedView
      dimensions={DIMENSIONS}
      headPosition={undefined}
      workOriginPosition={undefined}
      placeholderLabel={undefined}
      {...overrides}
    />,
  );
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
});
