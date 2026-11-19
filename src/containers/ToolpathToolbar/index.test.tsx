import { fireEvent, render, screen } from '@testing-library/react';
import { ToolpathToolbar } from '.';
import { TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayMode } from '../../utils/toolpath/toolpath.drawing.constants';

const TRAVEL_NAME = 'Show travel moves';
const POWER_LEGEND_NAME = 'Power scale: lighter is less power, darker is full power';

const renderToolbar = (
  isTravelShown: boolean,
  onTravelShownChange: (isShown: boolean) => void,
  displayMode: ToolpathDisplayMode = TOOLPATH_DISPLAY_MODE.POWER_SHADING,
): void => {
  render(
    <ToolpathToolbar
      displayMode={displayMode}
      onDisplayModeChange={vi.fn()}
      isTravelShown={isTravelShown}
      onTravelShownChange={onTravelShownChange}
    />,
  );
};

describe(ToolpathToolbar.name, () => {
  it('shows travel as a pressed toggle button while travel moves are drawn', () => {
    renderToolbar(true, vi.fn());

    expect(screen.getByRole('button', { name: TRAVEL_NAME })).toHaveAttribute('aria-pressed', 'true');
  });

  it('turns travel moves on with a press of the unpressed toggle', () => {
    const onTravelShownChange = vi.fn();

    renderToolbar(false, onTravelShownChange);
    const travelToggle: HTMLElement = screen.getByRole('button', { name: TRAVEL_NAME });

    expect(travelToggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(travelToggle);

    expect(onTravelShownChange).toHaveBeenCalledWith(true);
  });

  it('shows the power legend only while paths are shaded by power', () => {
    renderToolbar(false, vi.fn());

    expect(screen.getByRole('img', { name: POWER_LEGEND_NAME })).toBeInTheDocument();
  });

  it('hides the power legend while paths take their layer colour', () => {
    renderToolbar(false, vi.fn(), TOOLPATH_DISPLAY_MODE.BY_LAYER);

    expect(screen.queryByRole('img', { name: POWER_LEGEND_NAME })).not.toBeInTheDocument();
  });
});
