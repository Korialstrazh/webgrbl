/**
 * The edit panel of the material library: which material and operation, power, speed, passes and notes. Save waits for
 * the numbers to pass their checks. A stored preset can be deleted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Form, Input, InputNumber, Popconfirm, Select } from 'antd';
import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
  ANTD_INPUT_NUMBER_PRECISION_INTEGER,
} from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMaterialPresetFieldErrors } from '../../../utils/materials/get.material.preset.field.errors';
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
import {
  MaterialPresetDeleted,
  MaterialPresetSaved,
  selectMaterialPresets,
} from '../../../utils/states/material.preset.state';
import { selectMaterials } from '../../../utils/states/material.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { MaterialPresetFormProps } from '../interfaces/MaterialPresetFormProps';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../material.library.dialog.constants';
import styles from './styles.module.scss';

type MaterialPresetChange = Partial<MaterialPreset>;

const NOTES_ROWS = 3;

const hasPresetFieldError = ({ powerErrorKey, speedErrorKey, passesErrorKey }: MaterialPresetFieldErrors): boolean =>
  Boolean(powerErrorKey || speedErrorKey || passesErrorKey);

/** An emptied number input holds NaN, which the checks reject; the input then shows nothing. */
const getNumberInputValue = (value: number): number | null => (isFiniteNumber(value) ? value : null);

export const MaterialPresetForm = ({ preset, maxPowerWatts, onDone }: MaterialPresetFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const materials: Material[] = useSelector(selectMaterials);
  const isStored: boolean = useSelector(selectMaterialPresets)
    .some(({ id }: MaterialPreset): boolean => id === preset.id);
  const [editedPreset, setEditedPreset] = useState<MaterialPreset>(preset);
  const fieldErrors: MaterialPresetFieldErrors = getMaterialPresetFieldErrors(editedPreset, maxPowerWatts);
  const { powerErrorKey, speedErrorKey, passesErrorKey }: MaterialPresetFieldErrors = fieldErrors;

  const changePreset = (change: MaterialPresetChange): void => {
    setEditedPreset({ ...editedPreset, ...change });
  };

  const savePreset = (): void => {
    dispatch(new MaterialPresetSaved({ preset: { ...editedPreset, notes: editedPreset.notes.trim() } }));
    onDone();
  };

  const deletePreset = (): void => {
    dispatch(new MaterialPresetDeleted({ presetId: preset.id }));
    onDone();
  };

  return (
    <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
      <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL)}>
        <Select<string>
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL)}
          value={editedPreset.materialId}
          options={materials.map(({ id, name, thicknessMm }: Material) => ({
            value: id,
            label: t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_OPTION, { name, thickness: thicknessMm }),
          }))}
          onChange={(materialId: string) => changePreset({ materialId })}
        />
      </Form.Item>
      <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_OPERATION)}>
        <Select<MaterialPresetOperation>
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_OPERATION)}
          value={editedPreset.operation}
          options={Object.values(MATERIAL_PRESET_OPERATION).map((operation: MaterialPresetOperation) => ({
            value: operation,
            label: t(MATERIAL_PRESET_OPERATION_LABEL_KEY[operation]),
          }))}
          onChange={(operation: MaterialPresetOperation) => changePreset({ operation })}
        />
      </Form.Item>
      <Form.Item
        label={t(DEFAULT.MATERIAL_LIBRARY_POWER)}
        validateStatus={powerErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
        help={powerErrorKey && t(powerErrorKey, { max: maxPowerWatts })}
      >
        <InputNumber
          className={styles.numberInput}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_POWER)}
          value={getNumberInputValue(editedPreset.powerWatts)}
          onChange={(value: number | null) => changePreset({ powerWatts: value ?? Number.NaN })}
        />
      </Form.Item>
      <Form.Item
        label={t(DEFAULT.MATERIAL_LIBRARY_SPEED)}
        validateStatus={speedErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
        help={speedErrorKey && t(speedErrorKey, { min: SPEED_MM_PER_MIN_MIN, max: SPEED_MM_PER_MIN_MAX })}
      >
        <InputNumber
          className={styles.numberInput}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_SPEED)}
          value={getNumberInputValue(editedPreset.speedMmPerMin)}
          onChange={(value: number | null) => changePreset({ speedMmPerMin: value ?? Number.NaN })}
        />
      </Form.Item>
      <Form.Item
        label={t(DEFAULT.MATERIAL_LIBRARY_PASSES)}
        validateStatus={passesErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
        help={passesErrorKey && t(passesErrorKey, { min: PASSES_MIN, max: PASSES_MAX })}
      >
        <InputNumber
          className={styles.numberInput}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_PASSES)}
          precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
          value={getNumberInputValue(editedPreset.passes)}
          onChange={(value: number | null) => changePreset({ passes: value ?? Number.NaN })}
        />
      </Form.Item>
      <Form.Item label={t(DEFAULT.MATERIAL_LIBRARY_NOTES)}>
        <Input.TextArea
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_NOTES)}
          rows={NOTES_ROWS}
          maxLength={MATERIAL_PRESET_NOTES_LENGTH_MAX}
          value={editedPreset.notes}
          onChange={(changeEvent: ChangeEvent<HTMLTextAreaElement>) =>
            changePreset({ notes: changeEvent.target.value })}
        />
      </Form.Item>
      <div className={styles.actions}>
        <Button type={ANTD_BUTTON_TYPE_PRIMARY} disabled={hasPresetFieldError(fieldErrors)} onClick={savePreset}>
          {t(DEFAULT.MATERIAL_LIBRARY_SAVE)}
        </Button>
        {isStored && (
          <Popconfirm
            title={t(DEFAULT.MATERIAL_LIBRARY_DELETE_CONFIRM)}
            okText={t(DEFAULT.MATERIAL_LIBRARY_DELETE_OK)}
            cancelText={t(DEFAULT.MATERIAL_LIBRARY_DELETE_CANCEL)}
            okButtonProps={{ danger: true }}
            onConfirm={deletePreset}
          >
            <Button danger>{t(DEFAULT.MATERIAL_LIBRARY_DELETE)}</Button>
          </Popconfirm>
        )}
      </div>
    </Form>
  );
};
