/**
 * The test sample of a material: step one exports the sample G-code with the entered cut settings, step two records
 * how far the cut went. Save stores the result for the active machine profile after the depth passes its check;
 * Cancel and closing store nothing. Export is off, with the reason, when there is no active profile or the sample does
 * not fit the work area. It starts over on every open.
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
  ANTD_BUTTON_TYPE_DEFAULT,
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
  ANTD_INPUT_NUMBER_PRECISION_INTEGER,
} from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { fitsSampleJob } from '../../utils/materials/fits.sample.job';
import { getSampleCutSettings } from '../../utils/materials/get.sample.cut.settings';
import { getTestDepthErrorKey } from '../../utils/materials/get.test.depth.error.key';
import type { MaterialTestResult } from '../../utils/materials/interfaces/MaterialTestResult';
import type { SampleCutSettings } from '../../utils/materials/interfaces/SampleCutSettings';
import { MATERIAL_TEST_OUTCOME } from '../../utils/materials/material.constants';
import type { MaterialTestOutcome } from '../../utils/materials/material.constants';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { MaterialTestResultSaved } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectLayers } from '../../utils/states/project.document.state';
import { selectToolpathMachineArea } from '../../utils/states/toolpath.machine.area.selector';
import { SampleGcodeExportRequested } from '../../utils/states/toolpath.state';
import { isFiniteNumber } from '../../utils/type.guards/is.finite.number';
import { BedRegionModal } from '../BedRegionModal';
import type { TestSampleDialogProps } from './interfaces/TestSampleDialogProps';
import {
  TEST_SAMPLE_DIALOG_OVERLAY_ID,
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

const hasValidCutSettings = ({ powerPercent, speedMmPerMin, passes }: SampleCutSettings): boolean =>
  isFiniteNumber(powerPercent)
  && powerPercent >= TEST_SAMPLE_POWER_PERCENT_MIN
  && powerPercent <= TEST_SAMPLE_POWER_PERCENT_MAX
  && isFiniteNumber(speedMmPerMin)
  && speedMmPerMin >= TEST_SAMPLE_SPEED_MM_PER_MIN_MIN
  && isFiniteNumber(passes)
  && passes >= TEST_SAMPLE_PASSES_MIN;

const TestSampleDialogContent = ({ material, onClose }: TestSampleDialogContentProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const profile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const fitsWorkArea: boolean = fitsSampleJob(useSelector(selectToolpathMachineArea));
  const [cutSettings, setCutSettings] = useState<SampleCutSettings>(
    getSampleCutSettings(useSelector(selectProjectLayers)),
  );
  // After an export the settings are locked, so the saved ones are the ones burnt.
  const [isExported, setIsExported] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<MaterialTestOutcome>(MATERIAL_TEST_OUTCOME.CUT_THROUGH);
  // An emptied depth holds undefined; a typed one holds a number, NaN when the input cannot be read.
  const [depthMm, setDepthMm] = useState<number | undefined>(undefined);
  const [depthErrorKey, setDepthErrorKey] = useState<string | undefined>(undefined);
  const isNotThrough: boolean = outcome === MATERIAL_TEST_OUTCOME.NOT_THROUGH;
  const exportBlockedReasonKey: string | undefined = (() => {
    if (!profile) {
      return DEFAULT.TEST_SAMPLE_DIALOG_EXPORT_NO_PROFILE;
    }

    return fitsWorkArea ? undefined : DEFAULT.TEST_SAMPLE_DIALOG_EXPORT_TOO_SMALL;
  })();
  const getFieldId = (suffix: string): string => [formId, suffix].join(FIELD_ID_SEPARATOR);

  const changeCutSetting = (settingName: keyof SampleCutSettings, value: number | null): void =>
    setCutSettings({ ...cutSettings, [settingName]: value ?? Number.NaN });

  const exportSample = (): void => {
    dispatch(new SampleGcodeExportRequested({ cutSettings, jobName: material.name }));
    setIsExported(true);
  };

  const saveResult = (): void => {
    // A depth of 0 is an entered value that the check rejects, not an absent one.
    // eslint-disable-next-line no-restricted-syntax
    const hasDepth: boolean = isNotThrough && depthMm !== undefined;
    const nextDepthErrorKey: string | undefined =
      hasDepth ? getTestDepthErrorKey(depthMm ?? Number.NaN, material.thicknessMm) : undefined;

    setDepthErrorKey(nextDepthErrorKey);

    if (nextDepthErrorKey || !profile) {
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
      okButtonProps={{ disabled: !profile || !hasValidCutSettings(cutSettings) }}
      onOk={saveResult}
      onClose={onClose}
    >
      <section className={styles.burnSection}>
        <div className={styles.samplePicture} role="img" aria-label={t(DEFAULT.TEST_SAMPLE_DIALOG_PICTURE)}>
          <div className={styles.sampleGradient} />
        </div>
        <div className={styles.burnDetails}>
          <strong>{t(DEFAULT.TEST_SAMPLE_DIALOG_BURN_HEADING)}</strong>
          <span>{t(DEFAULT.TEST_SAMPLE_DIALOG_BURN_HINT)}</span>
          <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_POWER)} htmlFor={getFieldId(POWER_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(POWER_FIELD_ID_SUFFIX)}
                disabled={isExported}
                value={isFiniteNumber(cutSettings.powerPercent) ? cutSettings.powerPercent : null}
                onChange={(value: number | null) => changeCutSetting('powerPercent', value)}
              />
            </Form.Item>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_SPEED)} htmlFor={getFieldId(SPEED_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(SPEED_FIELD_ID_SUFFIX)}
                disabled={isExported}
                value={isFiniteNumber(cutSettings.speedMmPerMin) ? cutSettings.speedMmPerMin : null}
                onChange={(value: number | null) => changeCutSetting('speedMmPerMin', value)}
              />
            </Form.Item>
            <Form.Item label={t(DEFAULT.TEST_SAMPLE_DIALOG_PASSES)} htmlFor={getFieldId(PASSES_FIELD_ID_SUFFIX)}>
              <InputNumber
                id={getFieldId(PASSES_FIELD_ID_SUFFIX)}
                disabled={isExported}
                precision={ANTD_INPUT_NUMBER_PRECISION_INTEGER}
                value={isFiniteNumber(cutSettings.passes) ? cutSettings.passes : null}
                onChange={(value: number | null) => changeCutSetting('passes', value)}
              />
            </Form.Item>
          </Form>
          {!isExported && <span className={styles.mutedHint}>{t(DEFAULT.TEST_SAMPLE_DIALOG_SETTINGS_HINT)}</span>}
          <Button
            disabled={Boolean(exportBlockedReasonKey) || !hasValidCutSettings(cutSettings)}
            onClick={exportSample}
          >
            {t(DEFAULT.TEST_SAMPLE_DIALOG_EXPORT)}
          </Button>
          {exportBlockedReasonKey && <span role="note">{t(exportBlockedReasonKey)}</span>}
        </div>
      </section>
      <section className={styles.resultSection}>
        <strong>{t(DEFAULT.TEST_SAMPLE_DIALOG_RESULT_HEADING)}</strong>
        <div className={styles.outcomeRow}>
          <Button
            type={isNotThrough ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
            aria-pressed={!isNotThrough}
            onClick={() => setOutcome(MATERIAL_TEST_OUTCOME.CUT_THROUGH)}
          >
            {t(DEFAULT.TEST_SAMPLE_DIALOG_CUT_THROUGH)}
          </Button>
          <Button
            type={isNotThrough ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
            aria-pressed={isNotThrough}
            onClick={() => setOutcome(MATERIAL_TEST_OUTCOME.NOT_THROUGH)}
          >
            {t(DEFAULT.TEST_SAMPLE_DIALOG_NOT_THROUGH)}
          </Button>
        </div>
        {isNotThrough && (
          <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
            <Form.Item
              label={t(DEFAULT.TEST_SAMPLE_DIALOG_DEPTH)}
              htmlFor={getFieldId(DEPTH_FIELD_ID_SUFFIX)}
              validateStatus={depthErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
              help={depthErrorKey && t(depthErrorKey, { max: material.thicknessMm })}
            >
              <InputNumber
                id={getFieldId(DEPTH_FIELD_ID_SUFFIX)}
                value={depthMm ?? null}
                onChange={(value: number | null) => setDepthMm(value ?? undefined)}
              />
            </Form.Item>
            <span>{t(DEFAULT.TEST_SAMPLE_DIALOG_DEPTH_HINT)}</span>
          </Form>
        )}
      </section>
    </BedRegionModal>
  );
};

export const TestSampleDialog = ({ isOpen, material, onClose }: TestSampleDialogProps): ReactNode =>
  (isOpen ? <TestSampleDialogContent material={material} onClose={onClose} /> : null);
