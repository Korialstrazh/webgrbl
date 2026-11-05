/**
 * The form of one machine profile. It edits a draft and stores it only on Save, after the profile checks pass; a
 * failed check shows its message under the field. "Read from connected laser" fills the draft with the values the
 * laser reports validly and shows what was read, with a warning when the laser reports laser mode off.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BorderOuterOutlined,
  CloudOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  ControlOutlined,
  DragOutlined,
  HomeOutlined,
  SettingOutlined,
  TagOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Form, Input, Select, Switch, Tooltip } from 'antd';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_COLLAPSE_SIZE_SMALL,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
} from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMachineProfileErrors } from '../../../utils/profiles/get.machine.profile.errors';
import { getReportedProfileFields } from '../../../utils/profiles/get.reported.profile.fields';
import { getValidlyReportedProfileValues } from '../../../utils/profiles/get.validly.reported.profile.values';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfileFieldError } from '../../../utils/profiles/interfaces/MachineProfileFieldError';
import type { ReportedMachineProfileValues } from '../../../utils/profiles/interfaces/ReportedMachineProfileValues';
import { MACHINE_ORIGIN_CORNER } from '../../../utils/profiles/machine.profile.constants';
import type { MachineOriginCorner } from '../../../utils/profiles/machine.profile.constants';
import { selectGrblSettings, selectIsConnected } from '../../../utils/states/grbl.connection.state';
import {
  ActiveMachineProfileSelected,
  MachineProfileSaved,
  selectActiveMachineProfile,
} from '../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import { MACHINE_ORIGIN_CORNER_LABEL_KEY } from '../machine.profiles.dialog.constants';
import type { MachineProfileChanges } from './interfaces/MachineProfileChanges';
import type { ProfileFieldStatus } from './interfaces/ProfileFieldStatus';
import type { ProfileFormProps } from './interfaces/ProfileFormProps';
import type { ProfileNumberFieldDefinition } from './interfaces/ProfileNumberFieldDefinition';
import { LaserReadingAlerts } from './LaserReadingAlerts';
import { IconNumberField } from '../../../views/IconNumberField';
import { LaserMachineIcon } from '../../../views/LaserMachineIcon';
import styles from './styles.module.scss';

const FIELD_ID_SEPARATOR = '-';

const MACHINE_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'maxPowerWatts',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_MAX_POWER,
    iconComponent: <ThunderboltOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_WATTS,
  },
  {
    field: 'jogFeedRate',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_JOG_FEED_RATE,
    iconComponent: <DragOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_MM_PER_MIN,
  },
];

const BED_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'workAreaXMm',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_X,
    iconComponent: <ColumnWidthOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_MM,
  },
  {
    field: 'workAreaYMm',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_Y,
    iconComponent: <ColumnHeightOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_MM,
  },
];

const ADVANCED_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'sValueMax',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX,
    hintKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX_HINT,
    iconComponent: <ControlOutlined />,
    captionKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX_CAPTION,
  },
];

const ADVANCED_PANEL_KEY = 'advanced';

/** Whether a failed check is on a field inside the collapsed Advanced panel, which must then open to show it. */
const hasAdvancedFieldError = (errors: MachineProfileFieldError[]): boolean =>
  errors.some(({ field }: MachineProfileFieldError): boolean =>
    ADVANCED_NUMBER_FIELDS.some((definition: ProfileNumberFieldDefinition): boolean => definition.field === field));

const NAME_FIELD: keyof MachineProfile = 'name';
const ORIGIN_CORNER_FIELD: keyof MachineProfile = 'originCorner';

/** An emptied number input holds NaN in the draft, which the profile checks reject; the input then shows nothing. */
const getInputNumberValue = (value: number): number | null => isFiniteNumber(value) ? value : null;

export const ProfileForm = ({ profile }: ProfileFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const isConnected: boolean = useSelector(selectIsConnected);
  const grblSettings: Record<number, string> = useSelector(selectGrblSettings);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [draft, setDraft] = useState<MachineProfile>(profile);
  const [fieldErrors, setFieldErrors] = useState<MachineProfileFieldError[]>([]);
  const [reportedLaserValues, setReportedLaserValues] = useState<ReportedMachineProfileValues | undefined>(undefined);
  const [openAdvancedKeys, setOpenAdvancedKeys] = useState<string[]>([]);

  const changeDraft = (changes: MachineProfileChanges): void => {
    setDraft({ ...draft, ...changes });
  };

  const getFieldId = (field: keyof MachineProfile): string => [formId, field].join(FIELD_ID_SEPARATOR);

  const getFieldStatus = (field: keyof MachineProfile): ProfileFieldStatus => {
    const fieldError: MachineProfileFieldError | undefined =
      fieldErrors.find((error: MachineProfileFieldError): boolean => error.field === field);

    return fieldError
      ? { validateStatus: ANTD_FORM_ITEM_STATUS_ERROR, help: t(fieldError.messageKey, fieldError.messageParameters) }
      : {};
  };

  const saveDraft = (): void => {
    const draftErrors: MachineProfileFieldError[] = getMachineProfileErrors(draft);

    setFieldErrors(draftErrors);

    if (hasAdvancedFieldError(draftErrors)) {
      setOpenAdvancedKeys([ADVANCED_PANEL_KEY]);
    }

    if (draftErrors.length) {
      return;
    }

    dispatch(new MachineProfileSaved({ profile: draft }));

    // Only the first choice is made for the user: a save never replaces the laser they already picked.
    if (!activeProfile) {
      dispatch(new ActiveMachineProfileSelected({ profileId: draft.id }));
    }
  };

  const readDraftFromLaser = (): void => {
    // Only validly reported values reach the draft; every field the laser did not report keeps the draft's value.
    const reportedValues: ReportedMachineProfileValues = getValidlyReportedProfileValues(grblSettings);

    changeDraft(getReportedProfileFields(reportedValues));
    setReportedLaserValues(reportedValues);
  };

  const renderNumberFields = (definitions: readonly ProfileNumberFieldDefinition[]): ReactNode =>
    definitions.map((definition: ProfileNumberFieldDefinition) => {
      const { field, labelKey, hintKey, iconComponent, unitKey, captionKey } = definition;

      return (
        <Form.Item key={field} {...getFieldStatus(field)}>
          <IconNumberField
            inputId={getFieldId(field)}
            labelText={t(labelKey)}
            hintText={hintKey && t(hintKey)}
            iconComponent={iconComponent}
            captionText={captionKey && t(captionKey)}
            unitText={unitKey && t(unitKey)}
            value={getInputNumberValue(draft[field])}
            onChange={(value: number | null) => changeDraft({ [field]: value ?? Number.NaN })}
          />
        </Form.Item>
      );
    });

  return (
    <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
      <div className={styles.profileForm}>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_MACHINE)}>
          <h3 className={styles.groupTitle}>
            <LaserMachineIcon aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_MACHINE)}
          </h3>
          <Form.Item {...getFieldStatus(NAME_FIELD)}>
            <Input
              id={getFieldId(NAME_FIELD)}
              prefix={<TagOutlined aria-hidden />}
              aria-label={t(DEFAULT.MACHINE_PROFILES_FIELD_NAME)}
              placeholder={t(DEFAULT.MACHINE_PROFILES_FIELD_NAME)}
              value={draft.name}
              onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
                changeDraft({ name: changeEvent.target.value });
              }}
            />
          </Form.Item>
          <div className={styles.numberFields}>{renderNumberFields(MACHINE_NUMBER_FIELDS)}</div>
        </section>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_BED)}>
          <h3 className={styles.groupTitle}>
            <BorderOuterOutlined aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_BED)}
          </h3>
          <div className={styles.numberFields}>
            {renderNumberFields(BED_NUMBER_FIELDS)}
            <Form.Item>
              <Tooltip title={t(DEFAULT.MACHINE_PROFILES_FIELD_ORIGIN_CORNER)}>
                <Select
                  id={getFieldId(ORIGIN_CORNER_FIELD)}
                  prefix={<BorderOuterOutlined aria-hidden />}
                  aria-label={t(DEFAULT.MACHINE_PROFILES_FIELD_ORIGIN_CORNER)}
                  value={draft.originCorner}
                  options={Object.values(MACHINE_ORIGIN_CORNER).map((originCorner: MachineOriginCorner) => ({
                    value: originCorner,
                    label: t(MACHINE_ORIGIN_CORNER_LABEL_KEY[originCorner]),
                  }))}
                  onChange={(originCorner: MachineOriginCorner) => changeDraft({ originCorner })}
                />
              </Tooltip>
            </Form.Item>
          </div>
        </section>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_OPTIONS)}>
          <h3 className={styles.groupTitle}>
            <SettingOutlined aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_OPTIONS)}
          </h3>
          <div className={styles.switchFields}>
            <label className={styles.switchField}>
              <Switch
                checked={draft.hasAirAssist}
                onChange={(hasAirAssist: boolean) => changeDraft({ hasAirAssist })}
              />
              <CloudOutlined aria-hidden />
              {t(DEFAULT.MACHINE_PROFILES_FIELD_AIR_ASSIST)}
            </label>
            <label className={styles.switchField}>
              <Switch
                checked={draft.hasHomingSwitches}
                onChange={(hasHomingSwitches: boolean) => changeDraft({ hasHomingSwitches })}
              />
              <HomeOutlined aria-hidden />
              {t(DEFAULT.MACHINE_PROFILES_FIELD_HOMING)}
            </label>
          </div>
        </section>
        {/* Rendered while collapsed, so an error on a field inside can open it with the field already in place. */}
        <Collapse
          ghost
          size={ANTD_COLLAPSE_SIZE_SMALL}
          activeKey={openAdvancedKeys}
          onChange={(panelKeys: string[]) => setOpenAdvancedKeys(panelKeys)}
          items={[{
            key: ADVANCED_PANEL_KEY,
            label: t(DEFAULT.MACHINE_PROFILES_GROUP_ADVANCED),
            forceRender: true,
            children: <div className={styles.numberFields}>{renderNumberFields(ADVANCED_NUMBER_FIELDS)}</div>,
          }]}
        />
        {reportedLaserValues && <LaserReadingAlerts reportedValues={reportedLaserValues} />}
        <div className={styles.actions}>
          <Tooltip title={isConnected ? undefined : t(DEFAULT.MACHINE_PROFILES_READ_NEEDS_CONNECTION)}>
            {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
            <span className={styles.readButtonWrapper}>
              <Button disabled={!isConnected} onClick={readDraftFromLaser}>
                {t(DEFAULT.MACHINE_PROFILES_READ_FROM_LASER)}
              </Button>
            </span>
          </Tooltip>
          <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={saveDraft}>{t(DEFAULT.MACHINE_PROFILES_SAVE)}</Button>
        </div>
      </div>
    </Form>
  );
};
