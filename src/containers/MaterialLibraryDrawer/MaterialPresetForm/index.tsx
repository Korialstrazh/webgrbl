/**
 * The edit view of the material library: a Back button to the list and a heading, then which material and operation,
 * power, speed, passes and notes, and the actions in a footer that stays in view while the fields scroll. The
 * material select ends in an entry that adds a material. One line under the numbers says the power as percent of
 * the laser, or names the first wrong number once the user has touched it, so an error moves nothing; Save waits for
 * every number to pass. A new preset starts in its Power field. A stored preset can be deleted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, Popconfirm, Select } from 'antd';
import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
  ANTD_INPUT_NUMBER_PRECISION_INTEGER,
} from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMaterialPresetFieldErrors } from '../../../utils/materials/get.material.preset.field.errors';
import { getPresetPowerPercent } from '../../../utils/materials/get.preset.power.percent';
import type { Material } from '../../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import type { MaterialPresetFieldErrors } from '../../../utils/materials/interfaces/MaterialPresetFieldErrors';
import {
  MATERIAL_PRESET_NOTES_LENGTH_MAX,
  MATERIAL_PRESET_OPERATION,
} from '../../../utils/materials/material.preset.constants';
import type { MaterialPresetOperation } from '../../../utils/materials/material.preset.constants';
import {
  PASSES_MAX,
  PASSES_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from '../../../utils/palette/palette.constants';
import { selectMaterials } from '../../../utils/states/material.state';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { MaterialPresetFormProps } from '../interfaces/MaterialPresetFormProps';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../material.library.drawer.constants';
import styles from './styles.module.scss';
import { DecimalNumberInput } from '../../../views/DecimalNumberInput';

type MaterialPresetNumberField = keyof Pick<MaterialPreset, 'powerWatts' | 'speedMmPerMin' | 'passes'>;

const NOTES_ROWS = 2;
const POWER_FIELD: MaterialPresetNumberField = 'powerWatts';
const SPEED_FIELD: MaterialPresetNumberField = 'speedMmPerMin';
const PASSES_FIELD: MaterialPresetNumberField = 'passes';
// Material ids are random UUIDs, so they never match this.
const NEW_MATERIAL_OPTION_VALUE = 'new-material';

const hasPresetFieldError = ({ powerErrorKey, speedErrorKey, passesErrorKey }: MaterialPresetFieldErrors): boolean =>
  Boolean(powerErrorKey || speedErrorKey || passesErrorKey);

/** An emptied number input holds NaN, which the checks reject; the input then shows nothing. */
const getNumberInputValue = (value: number): number | null => (isFiniteNumber(value) ? value : null);

export const MaterialPresetForm = (props: MaterialPresetFormProps): ReactNode => {
  const {
    preset, isStored, isChanged, maxPowerWatts, headingText, onChange, onSave, onBack, onDelete, onNewMaterial,
  } = props;
  const { t } = useTranslation();
  const materials: Material[] = useSelector(selectMaterials);
  const [touchedFields, setTouchedFields] = useState<MaterialPresetNumberField[]>([]);
  const fieldErrors: MaterialPresetFieldErrors = getMaterialPresetFieldErrors(preset, maxPowerWatts);
  const isSaveAllowed: boolean = isChanged && !hasPresetFieldError(fieldErrors);

  const getShownErrorKey = (field: MaterialPresetNumberField, errorKey: string | undefined): string | undefined =>
    (touchedFields.includes(field) ? errorKey : undefined);

  const touchField = (field: MaterialPresetNumberField): void => {
    if (!touchedFields.includes(field)) {
      setTouchedFields([...touchedFields, field]);
    }
  };

  const changeNumber = (field: MaterialPresetNumberField, value: number | null): void => {
    touchField(field);
    onChange({ [field]: value ?? Number.NaN });
  };

  const changeMaterial = (materialId: string): void => {
    if (materialId === NEW_MATERIAL_OPTION_VALUE) {
      onNewMaterial();
    } else {
      onChange({ materialId });
    }
  };

  const powerErrorKey: string | undefined = getShownErrorKey(POWER_FIELD, fieldErrors.powerErrorKey);
  const speedErrorKey: string | undefined = getShownErrorKey(SPEED_FIELD, fieldErrors.speedErrorKey);
  const passesErrorKey: string | undefined = getShownErrorKey(PASSES_FIELD, fieldErrors.passesErrorKey);

  /** The first wrong number, so the fields keep their place. */
  const getNumberErrorText = (): string | undefined => {
    if (powerErrorKey) {
      return t(powerErrorKey, { max: maxPowerWatts });
    }

    if (speedErrorKey) {
      return t(speedErrorKey, { min: SPEED_MM_PER_MIN_MIN, max: SPEED_MM_PER_MIN_MAX });
    }

    return passesErrorKey && t(passesErrorKey, { min: PASSES_MIN, max: PASSES_MAX });
  };

  /** The percent of the laser, the unit the layers show, while the power is a number within range. */
  const getPowerPercentHint = (): string | undefined => (maxPowerWatts && !fieldErrors.powerErrorKey
    ? t(DEFAULT.MATERIAL_LIBRARY_POWER_PERCENT_HINT, {
      percent: getPresetPowerPercent(preset, maxPowerWatts),
      max: maxPowerWatts,
    })
    : undefined);

  const numberErrorText: string | undefined = getNumberErrorText();

  return (
    <div className={styles.presetForm}>
      <div className={styles.header}>
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          icon={<ArrowLeftOutlined />}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_BACK)}
          onClick={onBack}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_BACK)}
        </Button>
        <h3 className={styles.heading}>{headingText}</h3>
      </div>
      <div className={styles.fields}>
        <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
          <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL)}>
            <Select<string>
              aria-label={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL)}
              value={preset.materialId}
              options={[
                ...materials.map(({ id, name, thicknessMm }: Material) => ({
                  value: id,
                  label: t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_OPTION, { name, thickness: thicknessMm }),
                })),
                { value: NEW_MATERIAL_OPTION_VALUE, label: t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL_OPTION) },
              ]}
              onChange={changeMaterial}
            />
          </Form.Item>
          <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_OPERATION)}>
            <Select<MaterialPresetOperation>
              aria-label={t(DEFAULT.MATERIAL_LIBRARY_OPERATION)}
              value={preset.operation}
              options={Object.values(MATERIAL_PRESET_OPERATION).map((operation: MaterialPresetOperation) => ({
                value: operation,
                label: t(MATERIAL_PRESET_OPERATION_LABEL_KEY[operation]),
              }))}
              onChange={(operation: MaterialPresetOperation) => onChange({ operation })}
            />
          </Form.Item>
          <div className={styles.numberFields}>
            <Form.Item
              label={t(DEFAULT.MATERIAL_LIBRARY_POWER)}
              validateStatus={powerErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
            >
              <DecimalNumberInput
                className={styles.numberInput}
                aria-label={t(DEFAULT.MATERIAL_LIBRARY_POWER)}
                // A new preset has no power yet, and that is what the user came to type.
                autoFocus={!isStored}
                value={getNumberInputValue(preset.powerWatts)}
                onBlur={() => touchField(POWER_FIELD)}
                onChange={(value: number | null) => changeNumber(POWER_FIELD, value)}
              />
            </Form.Item>
            <Form.Item
              label={t(DEFAULT.MATERIAL_LIBRARY_SPEED)}
              validateStatus={speedErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
            >
              <DecimalNumberInput
                className={styles.numberInput}
                aria-label={t(DEFAULT.MATERIAL_LIBRARY_SPEED)}
                value={getNumberInputValue(preset.speedMmPerMin)}
                onBlur={() => touchField(SPEED_FIELD)}
                onChange={(value: number | null) => changeNumber(SPEED_FIELD, value)}
              />
            </Form.Item>
            <Form.Item
              label={t(DEFAULT.MATERIAL_LIBRARY_PASSES)}
              validateStatus={passesErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
            >
              <DecimalNumberInput
                className={styles.numberInput}
                aria-label={t(DEFAULT.MATERIAL_LIBRARY_PASSES)}
                precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
                value={getNumberInputValue(preset.passes)}
                onBlur={() => touchField(PASSES_FIELD)}
                onChange={(value: number | null) => changeNumber(PASSES_FIELD, value)}
              />
            </Form.Item>
          </div>
          <p
            className={numberErrorText ? [styles.numberNote, styles.numberError].join(' ') : styles.numberNote}
            aria-live="polite"
          >
            {numberErrorText ?? getPowerPercentHint()}
          </p>
          <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_NOTES)}>
            <Input.TextArea
              aria-label={t(DEFAULT.MATERIAL_LIBRARY_NOTES)}
              rows={NOTES_ROWS}
              maxLength={MATERIAL_PRESET_NOTES_LENGTH_MAX}
              value={preset.notes}
              onChange={(changeEvent: ChangeEvent<HTMLTextAreaElement>) =>
                onChange({ notes: changeEvent.target.value })}
            />
          </Form.Item>
        </Form>
      </div>
      <div className={styles.actions}>
        {/* The icons carry labels of their own, so each button names itself to keep its name to its text. */}
        <Button
          type={ANTD_BUTTON_TYPE_PRIMARY}
          icon={<SaveOutlined />}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_SAVE)}
          disabled={!isSaveAllowed}
          onClick={onSave}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_SAVE)}
        </Button>
        {isStored && (
          <Popconfirm
            title={t(DEFAULT.MATERIAL_LIBRARY_DELETE_CONFIRM)}
            okText={t(DEFAULT.MATERIAL_LIBRARY_DELETE_OK)}
            cancelText={t(DEFAULT.MATERIAL_LIBRARY_DELETE_CANCEL)}
            okButtonProps={{ danger: true }}
            onConfirm={onDelete}
          >
            <Button
              className={styles.deleteButton}
              type={ANTD_BUTTON_TYPE_TEXT}
              icon={<DeleteOutlined />}
              aria-label={t(DEFAULT.MATERIAL_LIBRARY_DELETE)}
              danger
            >
              {t(DEFAULT.MATERIAL_LIBRARY_DELETE)}
            </Button>
          </Popconfirm>
        )}
      </div>
    </div>
  );
};
