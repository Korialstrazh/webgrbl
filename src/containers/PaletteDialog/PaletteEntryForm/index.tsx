/**
 * The form of one palette entry. It edits a draft and stores it only on Save, after the entry checks pass, including
 * that no other entry has the colour; a failed check shows its message under the field. The colour of the shading
 * entry is locked, because that entry covers every grey from black to white.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BgColorsOutlined,
  ColumnHeightOutlined,
  DashboardOutlined,
  SyncOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, ColorPicker, Form, Input, InputNumber, Segmented, Switch } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_COLOR_PICKER_FORMAT_HEX,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
} from '../../../utils/antd.constants';
import { LAYER_MODE_LABEL_KEY } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getPaletteEntryErrors } from '../../../utils/palette/get.palette.entry.errors';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import type { PaletteEntryFieldError } from '../../../utils/palette/interfaces/PaletteEntryFieldError';
import { getNormalizedColour } from '../../../utils/palette/normalize.colour';
import { LAYER_MODE, SHADING_ENTRY_ID } from '../../../utils/palette/palette.constants';
import type { LayerMode } from '../../../utils/palette/palette.constants';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PaletteEntrySaved } from '../../../utils/states/palette.state';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { PaletteEntryChanges } from './interfaces/PaletteEntryChanges';
import type { PaletteEntryFormProps } from './interfaces/PaletteEntryFormProps';
import type { PaletteFieldStatus } from './interfaces/PaletteFieldStatus';
import type { PaletteNumberFieldDefinition } from './interfaces/PaletteNumberFieldDefinition';
import { IconFieldLabel } from '../../../views/IconFieldLabel';
import { LayerModeIcon } from '../../../views/LayerModeIcon';
import styles from './styles.module.scss';

const FIELD_ID_SEPARATOR = '-';

const NAME_FIELD: keyof PaletteEntry = 'name';
const COLOUR_FIELD: keyof PaletteEntry = 'colour';
const MODE_FIELD: keyof PaletteEntry = 'mode';

const MODE_OPTION_VALUES: readonly LayerMode[] = [LAYER_MODE.LINE, LAYER_MODE.FILL];

const PALETTE_NUMBER_FIELDS: readonly PaletteNumberFieldDefinition[] = [
  {
    field: 'maxPowerPercent',
    labelKey: DEFAULT.LAYER_SETTINGS_MAX_POWER,
    isFillOnly: false,
    iconComponent: <ThunderboltOutlined />,
  },
  {
    field: 'minPowerPercent',
    labelKey: DEFAULT.LAYER_SETTINGS_MIN_POWER,
    isFillOnly: false,
    iconComponent: <ThunderboltOutlined />,
  },
  {
    field: 'speedMmPerMin',
    labelKey: DEFAULT.LAYER_SETTINGS_SPEED,
    isFillOnly: false,
    iconComponent: <DashboardOutlined />,
  },
  {
    field: 'passes',
    labelKey: DEFAULT.LAYER_SETTINGS_PASSES,
    isFillOnly: false,
    iconComponent: <SyncOutlined />,
  },
  {
    field: 'lineIntervalMm',
    labelKey: DEFAULT.LAYER_SETTINGS_LINE_INTERVAL,
    isFillOnly: true,
    iconComponent: <ColumnHeightOutlined />,
  },
];

/** An emptied number input holds NaN in the draft, which the entry checks reject; the input then shows nothing. */
const getInputNumberValue = (value: number): number | null => isFiniteNumber(value) ? value : null;

export const PaletteEntryForm = ({ entry, otherEntries }: PaletteEntryFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const [draft, setDraft] = useState<PaletteEntry>(entry);
  const [fieldErrors, setFieldErrors] = useState<PaletteEntryFieldError[]>([]);
  const isShading: boolean = draft.id === SHADING_ENTRY_ID;
  const isFill: boolean = draft.mode === LAYER_MODE.FILL;

  const changeDraft = (changes: PaletteEntryChanges): void => {
    setDraft({ ...draft, ...changes });
  };

  const getFieldId = (field: keyof PaletteEntry): string => [formId, field].join(FIELD_ID_SEPARATOR);

  const getFieldStatus = (field: keyof PaletteEntry): PaletteFieldStatus => {
    const fieldError: PaletteEntryFieldError | undefined =
      fieldErrors.find((error: PaletteEntryFieldError): boolean => error.field === field);

    return fieldError
      ? { validateStatus: ANTD_FORM_ITEM_STATUS_ERROR, help: t(fieldError.messageKey, fieldError.messageParameters) }
      : {};
  };

  const changeColour = (pickedColour: Color): void => {
    changeDraft({ colour: getNormalizedColour(pickedColour.toHexString()) ?? draft.colour });
  };

  const saveDraft = (): void => {
    const draftErrors: PaletteEntryFieldError[] = getPaletteEntryErrors(draft, otherEntries);

    setFieldErrors(draftErrors);

    if (draftErrors.length) {
      return;
    }

    dispatch(new PaletteEntrySaved({ entry: draft }));
  };

  return (
    <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
      <div className={styles.paletteEntryForm}>
        <Form.Item
          label={<IconFieldLabel iconComponent={<TagOutlined />} labelText={t(DEFAULT.PALETTE_FIELD_NAME)} />}
          htmlFor={getFieldId(NAME_FIELD)}
          {...getFieldStatus(NAME_FIELD)}
        >
          <Input
            id={getFieldId(NAME_FIELD)}
            value={draft.name}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => changeDraft({ name: changeEvent.target.value })}
          />
        </Form.Item>
        <Form.Item
          label={<IconFieldLabel iconComponent={<BgColorsOutlined />} labelText={t(DEFAULT.PALETTE_FIELD_COLOUR)} />}
          extra={isShading ? t(DEFAULT.PALETTE_SHADING_COLOUR_NOTE) : undefined}
          {...getFieldStatus(COLOUR_FIELD)}
        >
          <ColorPicker
            value={draft.colour}
            format={ANTD_COLOR_PICKER_FORMAT_HEX}
            disabled={isShading}
            disabledAlpha
            showText
            onChange={changeColour}
          />
        </Form.Item>
        <Form.Item label={t(DEFAULT.LAYER_SETTINGS_MODE)} htmlFor={getFieldId(MODE_FIELD)}>
          <Segmented<LayerMode>
            id={getFieldId(MODE_FIELD)}
            value={draft.mode}
            options={MODE_OPTION_VALUES.map((mode: LayerMode) => ({
              value: mode,
              icon: <LayerModeIcon mode={mode} />,
              label: t(LAYER_MODE_LABEL_KEY[mode]),
            }))}
            onChange={(mode: LayerMode) => changeDraft({ mode })}
          />
        </Form.Item>
        <div className={styles.numberFields}>
          {PALETTE_NUMBER_FIELDS.filter(
            ({ isFillOnly }: PaletteNumberFieldDefinition): boolean => isFill || !isFillOnly,
          ).map(({ field, labelKey, iconComponent }: PaletteNumberFieldDefinition) => (
            <Form.Item
              key={field}
              label={<IconFieldLabel iconComponent={iconComponent} labelText={t(labelKey)} />}
              htmlFor={getFieldId(field)}
              {...getFieldStatus(field)}
            >
              <InputNumber
                id={getFieldId(field)}
                className={styles.numberInput}
                value={getInputNumberValue(draft[field])}
                onChange={(value: number | null) => changeDraft({ [field]: value ?? Number.NaN })}
              />
            </Form.Item>
          ))}
        </div>
        <label className={styles.switchField}>
          <Switch checked={draft.airAssist} onChange={(airAssist: boolean) => changeDraft({ airAssist })} />
          {t(DEFAULT.LAYER_SETTINGS_AIR_ASSIST)}
        </label>
        <div className={styles.actions}>
          <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={saveDraft}>{t(DEFAULT.PALETTE_SAVE)}</Button>
        </div>
      </div>
    </Form>
  );
};
