/**
 * The result of a burnt test sample: how far the cut went, an optional depth, and the power, speed and passes it was
 * burnt with. The sample itself is added and burnt from Design like any object, so these values come prefilled from
 * its Line layer and stay editable. No result is chosen at the start, and Save waits for one and for valid values, so
 * it cannot record a burn nobody looked at. Save stores the result for the active machine profile after the depth
 * passes its check; Cancel and closing store nothing. It starts over on every open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Form, InputNumber } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
  ANTD_INPUT_NUMBER_PRECISION_INTEGER,
} from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getSampleCutSettings } from '../../utils/materials/get.sample.cut.settings';
import { getTestDepthErrorKey } from '../../utils/materials/get.test.depth.error.key';
import type { MaterialTestResult } from '../../utils/materials/interfaces/MaterialTestResult';
import type { SampleCutSettings } from '../../utils/materials/interfaces/SampleCutSettings';
import { MATERIAL_TEST_OUTCOME } from '../../utils/materials/material.constants';
import type { MaterialTestOutcome } from '../../utils/materials/material.constants';
import { PASSES_MAX, SPEED_MM_PER_MIN_MAX } from '../../utils/palette/palette.constants';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { MaterialTestResultSaved } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectLayers, selectProjectObjects } from '../../utils/states/project.document.state';
import { isFiniteNumber } from '../../utils/type.guards/is.finite.number';
import { BedRegionModal } from '../BedRegionModal';
import type { TestSampleDialogProps } from './interfaces/TestSampleDialogProps';
import {
  TEST_SAMPLE_DIALOG_OVERLAY_ID,
  TEST_SAMPLE_DIALOG_WIDTH_PX,
  TEST_SAMPLE_PASSES_MIN,
  TEST_SAMPLE_POWER_PERCENT_MAX,
  TEST_SAMPLE_POWER_PERCENT_MIN,
  TEST_SAMPLE_SPEED_MM_PER_MIN_MIN,
} from './test.sample.dialog.constants';
import styles from './styles.module.scss';

type TestSampleDialogContentProps = Pick<TestSampleDialogProps, 'material' | 'onClose'>;

const FIELD_ID_SEPARATOR = '-';
const POWER_FIELD_ID_SUFFIX = 'power';
const SPEED_FIELD_ID_SUFFIX = 'speed';
const PASSES_FIELD_ID_SUFFIX = 'passes';
const DEPTH_FIELD_ID_SUFFIX = 'depth';

const isNumberInRange = (value: number, min: number, max: number): boolean =>
  isFiniteNumber(value) && value >= min && value <= max;

const SETTINGS_LIMIT_TEXT_VALUES: Record<string, number> = {
  powerMin: TEST_SAMPLE_POWER_PERCENT_MIN,
  powerMax: TEST_SAMPLE_POWER_PERCENT_MAX,
  speedMin: TEST_SAMPLE_SPEED_MM_PER_MIN_MIN,
  speedMax: SPEED_MM_PER_MIN_MAX,
  passesMin: TEST_SAMPLE_PASSES_MIN,
  passesMax: PASSES_MAX,
};

const hasValidCutSettings = ({ powerPercent, speedMmPerMin, passes }: SampleCutSettings): boolean =>
  isNumberInRange(powerPercent, TEST_SAMPLE_POWER_PERCENT_MIN, TEST_SAMPLE_POWER_PERCENT_MAX)
  && isNumberInRange(speedMmPerMin, TEST_SAMPLE_SPEED_MM_PER_MIN_MIN, SPEED_MM_PER_MIN_MAX)
  && isNumberInRange(passes, TEST_SAMPLE_PASSES_MIN, PASSES_MAX);

const TestSampleDialogContent = ({ material, onClose }: TestSampleDialogContentProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const profile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [cutSettings, setCutSettings] = useState<SampleCutSettings>(
    getSampleCutSettings(useSelector(selectProjectLayers), useSelector(selectProjectObjects)),
  );
  const [outcome, setOutcome] = useState<MaterialTestOutcome | undefined>(undefined);
  // An emptied depth holds undefined; a typed one holds a number, NaN when the input cannot be read.
  const [depthMm, setDepthMm] = useState<number | undefined>(undefined);
  const [depthErrorKey, setDepthErrorKey] = useState<string | undefined>(undefined);
  const isNotThrough: boolean = outcome === MATERIAL_TEST_OUTCOME.NOT_THROUGH;
  const isCutThrough: boolean = outcome === MATERIAL_TEST_OUTCOME.CUT_THROUGH;
  const hasValidSettings: boolean = hasValidCutSettings(cutSettings);
  const canSaveResult: boolean = Boolean(profile && outcome) && hasValidSettings;
  const getFieldId = (suffix: string): string => [formId, suffix].join(FIELD_ID_SEPARATOR);

  const getSaveHintText = (): string | undefined => {
    if (!profile) {
      return t(DEFAULT.TEST_SAMPLE_DIALOG_NO_PROFILE);
    }

    if (!hasValidSettings) {
      return t(DEFAULT.TEST_SAMPLE_DIALOG_INVALID_SETTINGS, SETTINGS_LIMIT_TEXT_VALUES);
    }

    return outcome ? undefined : t(DEFAULT.TEST_SAMPLE_DIALOG_SAVE_HINT);
  };

  const changeCutSetting = (settingName: keyof SampleCutSettings, value: number | null): void =>
    setCutSettings({ ...cutSettings, [settingName]: value ?? Number.NaN });

  const saveResult = (): void => {
    // A depth of 0 is an entered value that the check rejects, not an absent one.
    // eslint-disable-next-line no-restricted-syntax
    const hasDepth: boolean = isNotThrough && depthMm !== undefined;
    const nextDepthErrorKey: string | undefined =
      hasDepth ? getTestDepthErrorKey(depthMm ?? Number.NaN, material.thicknessMm) : undefined;

    setDepthErrorKey(nextDepthErrorKey);

    if (nextDepthErrorKey || !profile || !outcome) {
      return;
    }

    const testResult: MaterialTestResult = {
      machineProfileId: profile.id,
      ...cutSettings,
      thicknessMm: material.thicknessMm,
      outcome,
      depthMm: isNotThrough ? depthMm : undefined,
      testedAtIso: new Date().toISOString(),
    };

    dispatch(new MaterialTestResultSaved({ materialId: material.id, testResult }));
    onClose();
  };

  return (
    <BedRegionModal
      isOpen
      overlayIdPrefix={TEST_SAMPLE_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.TEST_SAMPLE_DIALOG_TITLE, { name: material.name })}
      okText={t(DEFAULT.TEST_SAMPLE_DIALOG_SAVE)}
      cancelText={t(DEFAULT.TEST_SAMPLE_DIALOG_CANCEL)}
      okButtonProps={{ disabled: !canSaveResult, type: ANTD_BUTTON_TYPE_PRIMARY }}
      onOk={saveResult}
      onClose={onClose}
      centered
      width={TEST_SAMPLE_DIALOG_WIDTH_PX}
    >
      <section className={styles.dialogSection}>
        <strong>{t(DEFAULT.TEST_SAMPLE_DIALOG_RESULT_HEADING)}</strong>
        <div className={styles.outcomeRow}>
          <Button
            className={isCutThrough ? styles.outcomeChosen : undefined}
            aria-pressed={isCutThrough}
            onClick={() => setOutcome(MATERIAL_TEST_OUTCOME.CUT_THROUGH)}
          >
            {t(DEFAULT.TEST_SAMPLE_DIALOG_CUT_THROUGH)}
          </Button>
          <Button
            className={isNotThrough ? styles.outcomeChosen : undefined}
            aria-pressed={isNotThrough}
            onClick={() => setOutcome(MATERIAL_TEST_OUTCOME.NOT_THROUGH)}
          >
            {t(DEFAULT.TEST_SAMPLE_DIALOG_NOT_THROUGH)}
          </Button>
        </div>
        {/* Always there, so choosing Not through moves nothing, least of all the buttons below. */}
        <div className={styles.depthRow}>
          <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
            <Form.Item
              label={t(DEFAULT.TEST_SAMPLE_DIALOG_DEPTH)}
              htmlFor={getFieldId(DEPTH_FIELD_ID_SUFFIX)}
              validateStatus={depthErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
              help={depthErrorKey && t(depthErrorKey, { max: material.thicknessMm })}
            >
              <InputNumber
                id={getFieldId(DEPTH_FIELD_ID_SUFFIX)}
                disabled={!isNotThrough}
                value={depthMm ?? null}
                onChange={(value: number | null) => setDepthMm(value ?? undefined)}
              />
            </Form.Item>
            <span className={styles.mutedHint}>{t(DEFAULT.TEST_SAMPLE_DIALOG_DEPTH_HINT)}</span>
          </Form>
        </div>
      </section>
      <section className={[styles.dialogSection, styles.settingsSection].join(' ')}>
        <strong>{t(DEFAULT.TEST_SAMPLE_DIALOG_SETTINGS_HEADING)}</strong>
        <div className={styles.settingsRow}>
          <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_POWER)} htmlFor={getFieldId(POWER_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(POWER_FIELD_ID_SUFFIX)}
                value={isFiniteNumber(cutSettings.powerPercent) ? cutSettings.powerPercent : null}
                onChange={(value: number | null) => changeCutSetting('powerPercent', value)}
              />
            </Form.Item>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_SPEED)} htmlFor={getFieldId(SPEED_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(SPEED_FIELD_ID_SUFFIX)}
                value={isFiniteNumber(cutSettings.speedMmPerMin) ? cutSettings.speedMmPerMin : null}
                onChange={(value: number | null) => changeCutSetting('speedMmPerMin', value)}
              />
            </Form.Item>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_PASSES)} htmlFor={getFieldId(PASSES_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(PASSES_FIELD_ID_SUFFIX)}
                precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
                value={isFiniteNumber(cutSettings.passes) ? cutSettings.passes : null}
                onChange={(value: number | null) => changeCutSetting('passes', value)}
              />
            </Form.Item>
          </Form>
        </div>
        <span className={styles.mutedHint}>{t(DEFAULT.TEST_SAMPLE_DIALOG_SETTINGS_HINT)}</span>
        {/* The room for why Save is off stays reserved, so the text coming and going does not move the buttons. */}
        <span className={styles.saveHint} role="note">{getSaveHintText()}</span>
      </section>
    </BedRegionModal>
  );
};

export const TestSampleDialog = ({ isOpen, material, onClose }: TestSampleDialogProps): ReactNode =>
  (isOpen ? <TestSampleDialogContent material={material} onClose={onClose} /> : null);
