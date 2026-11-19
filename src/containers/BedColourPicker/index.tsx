/**
 * The bed colour button of the bed's view controls: a swatch of the current bed colour that opens an antd ColorPicker
 * with presets (the default charcoal, a grey, a light grey, white, a dark grey and a wood tone), a note on
 * the light rim dark beds give artwork, and Reset to default. Every change goes to the bed at once and is stored
 * app-wide.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BgColorsOutlined } from '@ant-design/icons';
import { Button, ColorPicker, Tooltip } from 'antd';
import type { ColorPickerProps } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_COLOR_PICKER_FORMAT_HEX } from '../../utils/antd.constants';
import { BED_COLOUR_PRESETS, DEFAULT_BED_COLOUR } from '../../utils/bed/bed.colour.constants';
import { getValidBedColour } from '../../utils/bed/get.valid.bed.colour';
import type { BedColourPreset } from '../../utils/bed/interfaces/BedColourPreset';
import { usePopoverAutoClose } from '../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../utils/localization/default.locales';
import { BedColourChanged, selectBedColour } from '../../utils/states/bed.appearance.state';
import type { AppDispatch } from '../../utils/states/new.store';
import styles from './styles.module.scss';

type BedColourPickerPanelRender = NonNullable<ColorPickerProps['panelRender']>;

export const BedColourPicker = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const bedColour: string = useSelector(selectBedColour);
  const labelText: string = t(DEFAULT.BED_COLOUR_LABEL);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  const changeBedColour = (nextBedColour: string): void => {
    dispatch(new BedColourChanged({ bedColour: nextBedColour }));
  };

  const handlePickerChange = (pickedColour: Color): void => {
    const validBedColour: string | undefined = getValidBedColour(pickedColour.toHexString());

    if (validBedColour) {
      changeBedColour(validBedColour);
    }
  };

  const renderPanel: BedColourPickerPanelRender = (panelComponent: ReactNode) => (
    <div className={styles.panel}>
      {panelComponent}
      {/* Our own named buttons: antd's preset swatches have no names and cannot be reached by keyboard. */}
      <div className={styles.presets} role="group" aria-label={t(DEFAULT.BED_COLOUR_PRESETS)}>
        {BED_COLOUR_PRESETS.map(({ colour, labelKey }: BedColourPreset) => (
          <Tooltip key={colour} title={t(labelKey)}>
            <Button
              className={styles.presetButton}
              aria-label={t(labelKey)}
              aria-pressed={colour === bedColour}
              onClick={() => changeBedColour(colour)}
            >
              {/* A plain swatch of the preset colour, which is data, not a style choice. */}
              <span
                className={styles.swatch}
                aria-hidden="true"
                // eslint-disable-next-line no-restricted-syntax -- runtime-only colour
                style={{ backgroundColor: colour }}
              />
            </Button>
          </Tooltip>
        ))}
      </div>
      <p className={styles.darkNote}>{t(DEFAULT.BED_COLOUR_DARK_NOTE)}</p>
      <Button block disabled={bedColour === DEFAULT_BED_COLOUR} onClick={() => changeBedColour(DEFAULT_BED_COLOUR)}>
        {t(DEFAULT.BED_COLOUR_RESET)}
      </Button>
    </div>
  );

  return (
    <ColorPicker
      value={bedColour}
      format={ANTD_COLOR_PICKER_FORMAT_HEX}
      disabledAlpha
      disabledFormat
      panelRender={renderPanel}
      open={isOpen}
      onOpenChange={setIsOpen}
      onChange={handlePickerChange}
    >
      <Tooltip title={labelText}>
        <Button className={styles.bedColourButton} aria-label={labelText}>
          {/* A paint bucket beside a swatch of the current colour: the control paints the bed. */}
          <span className={styles.glyphs} aria-hidden="true">
            <BgColorsOutlined className={styles.bucket} />
            <span
              className={[styles.swatch, styles.currentSwatch].join(' ')}
              // eslint-disable-next-line no-restricted-syntax -- runtime-only colour
              style={{ backgroundColor: bedColour }}
            />
          </span>
        </Button>
      </Tooltip>
    </ColorPicker>
  );
};
