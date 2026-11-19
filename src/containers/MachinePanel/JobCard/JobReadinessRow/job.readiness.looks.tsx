/**
 * The looks of the readiness steps, in the order the row shows them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApiOutlined, CloudUploadOutlined, ImportOutlined, WarningOutlined } from '@ant-design/icons';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { JOB_READINESS_STEP } from '../../../../utils/states/job.readiness.selector';
import { LaserMachineIcon } from '../../../../views/LaserMachineIcon';
import { MaterialSheetIcon } from '../../../../views/MaterialSheetIcon';
import type { JobReadinessLook } from './interfaces/JobReadinessLook';

export const JOB_READINESS_LOOKS: readonly JobReadinessLook[] = [
  {
    step: JOB_READINESS_STEP.PROFILE,
    iconComponent: <LaserMachineIcon aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_PROFILE,
    hintKey: DEFAULT.JOB_READINESS_PROFILE_HINT,
    actionKey: DEFAULT.JOB_READINESS_PROFILE_ACTION,
  },
  {
    step: JOB_READINESS_STEP.DESIGN,
    iconComponent: <ImportOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_DESIGN,
    hintKey: DEFAULT.JOB_READINESS_DESIGN_HINT,
    metHintKey: DEFAULT.JOB_READINESS_DESIGN_MET_HINT,
    actionKey: DEFAULT.JOB_READINESS_DESIGN_ACTION,
    actionIconComponent: <CloudUploadOutlined aria-hidden />,
  },
  {
    step: JOB_READINESS_STEP.MATERIAL,
    iconComponent: <MaterialSheetIcon aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_MATERIAL,
    hintKey: DEFAULT.JOB_READINESS_MATERIAL_HINT,
    optionalHintKey: DEFAULT.JOB_READINESS_MATERIAL_OPTIONAL_HINT,
    actionKey: DEFAULT.JOB_READINESS_MATERIAL_ACTION,
  },
  {
    step: JOB_READINESS_STEP.WARNINGS,
    iconComponent: <WarningOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_WARNINGS,
    hintKey: DEFAULT.JOB_READINESS_WARNINGS_HINT,
    metHintKey: DEFAULT.JOB_READINESS_WARNINGS_MET_HINT,
    actionKey: DEFAULT.JOB_READINESS_WARNINGS_ACTION,
  },
  {
    step: JOB_READINESS_STEP.CONNECT,
    iconComponent: <ApiOutlined aria-hidden />,
    captionKey: DEFAULT.JOB_READINESS_CONNECT,
    hintKey: DEFAULT.JOB_READINESS_CONNECT_HINT,
    actionKey: DEFAULT.JOB_READINESS_CONNECT_ACTION,
  },
];
