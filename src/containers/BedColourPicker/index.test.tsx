import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BedColourPicker } from '.';
import { DEFAULT_BED_COLOUR, WOOD_BED_COLOUR } from '../../utils/bed/bed.colour.constants';
import { BedColourChanged, selectBedColour } from '../../utils/states/bed.appearance.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const BED_COLOUR_LABEL = 'Bed colour';
const RESET_LABEL = 'Reset to default';
const DARK_NOTE_TEXT = 'A very dark bed hides black artwork.';
const TYPED_BED_COLOUR = '#d4d7da';
const HEX_INPUT_SELECTOR = '.ant-color-picker-hex-input input';
const PRESET_SELECTOR = '.ant-color-picker-presets-color';
const PRESET_INDEX_WOOD = 4;

const renderPicker = (store: AppStore = newStore()): AppStore => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedColourPicker />
      </AntdTestProvider>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: BED_COLOUR_LABEL }));

  return store;
};

describe(BedColourPicker.name, () => {
  it('opens a picker with the presets, the dark bed note and Reset to default', () => {
    renderPicker();

    expect(document.querySelectorAll(PRESET_SELECTOR)).toHaveLength(5);
    expect(screen.getByText(DARK_NOTE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeDisabled();
  });

  it('changes the bed colour from a typed hex value', () => {
    const store: AppStore = renderPicker();

    fireEvent.change(document.querySelector(HEX_INPUT_SELECTOR) ?? document.body, {
      target: { value: TYPED_BED_COLOUR.slice(1) },
    });

    expect(selectBedColour(store.getState())).toBe(TYPED_BED_COLOUR);
  });

  it('changes the bed colour from a preset', () => {
    const store: AppStore = renderPicker();

    fireEvent.click(document.querySelectorAll(PRESET_SELECTOR)[PRESET_INDEX_WOOD] ?? document.body);

    expect(selectBedColour(store.getState())).toBe(WOOD_BED_COLOUR);
  });

  it('sets the default colour again from Reset to default', () => {
    const store: AppStore = renderPicker();

    act(() => {
      store.dispatch(new BedColourChanged({ bedColour: WOOD_BED_COLOUR }));
    });
    fireEvent.click(screen.getByRole('button', { name: RESET_LABEL }));

    expect(selectBedColour(store.getState())).toBe(DEFAULT_BED_COLOUR);
  });
});
