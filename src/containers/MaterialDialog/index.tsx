/**
 * Adds a material: its name and thickness start at the default material. Save stores it and makes it the material of
 * the project, after the checks pass; a failed check shows its message under the field. It starts over on every open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Form, Input, InputNumber } from 'antd';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_FORM_ITEM_STATUS_ERROR, ANTD_FORM_LAYOUT_VERTICAL } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getMaterialFieldErrors } from '../../utils/materials/get.material.field.errors';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MaterialFieldErrors } from '../../utils/materials/interfaces/MaterialFieldErrors';
import {
  DEFAULT_MATERIAL_NAME,
  DEFAULT_MATERIAL_THICKNESS_MM,
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_NAME_LENGTH_MIN,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from '../../utils/materials/material.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { MaterialSaved } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { isFiniteNumber } from '../../utils/type.guards/is.finite.number';
import { BedRegionModal } from '../BedRegionModal';
import type { MaterialDialogProps } from './interfaces/MaterialDialogProps';
import { MATERIAL_DIALOG_OVERLAY_ID } from './material.dialog.constants';

type MaterialDialogContentProps = Pick<MaterialDialogProps, 'onClose'>;

const NO_FIELD_ERRORS: MaterialFieldErrors = { nameErrorKey: undefined, thicknessErrorKey: undefined };
const FIELD_ID_SEPARATOR = '-';
const NAME_FIELD_ID_SUFFIX = 'name';
const THICKNESS_FIELD_ID_SUFFIX = 'thickness';

const hasMaterialFieldError = ({ nameErrorKey, thicknessErrorKey }: MaterialFieldErrors): boolean =>
  Boolean(nameErrorKey || thicknessErrorKey);

const MaterialDialogContent = ({ onClose }: MaterialDialogContentProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const [materialName, setMaterialName] = useState<string>(DEFAULT_MATERIAL_NAME);
  const [thicknessMm, setThicknessMm] = useState<number>(DEFAULT_MATERIAL_THICKNESS_MM);
  const [fieldErrors, setFieldErrors] = useState<MaterialFieldErrors>(NO_FIELD_ERRORS);
  const nameFieldId: string = [formId, NAME_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);
  const thicknessFieldId: string = [formId, THICKNESS_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);

  const saveMaterial = (): void => {
    const nextFieldErrors: MaterialFieldErrors = getMaterialFieldErrors(materialName, thicknessMm);

    setFieldErrors(nextFieldErrors);

    if (hasMaterialFieldError(nextFieldErrors)) {
      return;
    }

    const material: Material = newMaterial({ name: materialName.trim(), thicknessMm });

    dispatch(new MaterialSaved({ material }));
    dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    onClose();
  };

  return (
    <BedRegionModal
      isOpen
      overlayIdPrefix={MATERIAL_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.MATERIAL_DIALOG_TITLE)}
      okText={t(DEFAULT.MATERIAL_DIALOG_SAVE)}
      cancelText={t(DEFAULT.MATERIAL_DIALOG_CANCEL)}
      onOk={saveMaterial}
      onClose={onClose}
    >
      <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
        <Form.Item
          label={t(DEFAULT.MATERIAL_DIALOG_NAME)}
          htmlFor={nameFieldId}
          validateStatus={fieldErrors.nameErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
          help={fieldErrors.nameErrorKey && t(fieldErrors.nameErrorKey, {
            min: MATERIAL_NAME_LENGTH_MIN,
            max: MATERIAL_NAME_LENGTH_MAX,
          })}
        >
          <Input
            id={nameFieldId}
            value={materialName}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => setMaterialName(changeEvent.target.value)}
          />
        </Form.Item>
        <Form.Item
          label={t(DEFAULT.MATERIAL_DIALOG_THICKNESS)}
          htmlFor={thicknessFieldId}
          validateStatus={fieldErrors.thicknessErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
          help={fieldErrors.thicknessErrorKey && t(fieldErrors.thicknessErrorKey, {
            min: MATERIAL_THICKNESS_MM_MIN,
            max: MATERIAL_THICKNESS_MM_MAX,
          })}
        >
          {/* An emptied input holds NaN, which the checks reject; the input then shows nothing. */}
          <InputNumber
            id={thicknessFieldId}
            value={isFiniteNumber(thicknessMm) ? thicknessMm : null}
            onChange={(value: number | null) => setThicknessMm(value ?? Number.NaN)}
          />
        </Form.Item>
      </Form>
    </BedRegionModal>
  );
};

export const MaterialDialog = ({ isOpen, onClose }: MaterialDialogProps): ReactNode =>
  (isOpen ? <MaterialDialogContent onClose={onClose} /> : null);
