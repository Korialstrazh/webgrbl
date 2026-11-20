import { render, screen } from '@testing-library/react';
import { JobSizeText } from '.';

describe(JobSizeText.name, () => {
  it('renders an empty container without a size', () => {
    const { container } = render(<JobSizeText size={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the size text', () => {
    render(<JobSizeText size={{ widthMm: 100, heightMm: 50 }} />);

    expect(screen.getByText('100 × 50 mm (10 × 5 cm)')).toBeInTheDocument();
  });
});
