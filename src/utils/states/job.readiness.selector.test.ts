import { GRBL_CONNECTION_STATUS } from '../grbl/grbl.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { newProjectObject } from '../project/new.project.object';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { ConnectionStatusChanged } from './grbl.connection.state';
import {
  isJobReadinessStepOptional,
  JOB_READINESS_STEP,
  selectFirstUnmetJobReadinessStep,
  selectIsJobReadinessStepMet,
  selectJobReadinessWarningCount,
} from './job.readiness.selector';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { ProjectObjectsAdded } from './project.document.state';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

const OFF_PAGE_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.OFF_PAGE };
const TEXT_WARNING: ObjectWarning = { objectId: 'object', kind: SVG_UNSUPPORTED_KIND.TEXT };
const WARNING_COUNT = 2;

describe(selectFirstUnmetJobReadinessStep.name, () => {
  it('starts at the profile in a fresh app', () => {
    expect(selectFirstUnmetJobReadinessStep(newStore().getState())).toBe(JOB_READINESS_STEP.PROFILE);
  });

  it('ticks Connect from the live connection state, without moving the first open step', () => {
    const store: AppStore = newStore();

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));

    expect(selectIsJobReadinessStepMet(JOB_READINESS_STEP.CONNECT)(store.getState())).toBe(true);
    expect(selectFirstUnmetJobReadinessStep(store.getState())).toBe(JOB_READINESS_STEP.PROFILE);
  });
});

describe('the optional Material step', () => {
  it('is the only optional step, as Start job does not need a material', () => {
    expect(isJobReadinessStepOptional(JOB_READINESS_STEP.MATERIAL)).toBe(true);
    expect(isJobReadinessStepOptional(JOB_READINESS_STEP.PROFILE)).toBe(false);
    expect(isJobReadinessStepOptional(JOB_READINESS_STEP.DESIGN)).toBe(false);
    expect(isJobReadinessStepOptional(JOB_READINESS_STEP.CONNECT)).toBe(false);
  });

  it('is skipped as the next step: with a profile and a design, Connect is next, then nothing', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));

    expect(selectIsJobReadinessStepMet(JOB_READINESS_STEP.MATERIAL)(store.getState())).toBe(false);
    expect(selectFirstUnmetJobReadinessStep(store.getState())).toBe(JOB_READINESS_STEP.CONNECT);

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));

    expect(selectFirstUnmetJobReadinessStep(store.getState())).toBeUndefined();
  });
});

describe('the Check step', () => {
  it('stays open, with the warning count, while toolpath warnings lock Start job, even when connected', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile();

    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new ToolpathReady({
      toolpath: newToolpath({ warnings: [OFF_PAGE_WARNING, TEXT_WARNING] }),
      documentVersion: selectToolpathDocumentVersion(store.getState()),
    }));

    expect(selectJobReadinessWarningCount(store.getState())).toBe(WARNING_COUNT);
    expect(selectIsJobReadinessStepMet(JOB_READINESS_STEP.WARNINGS)(store.getState())).toBe(false);
    expect(selectFirstUnmetJobReadinessStep(store.getState())).toBe(JOB_READINESS_STEP.WARNINGS);
  });

  it('is met while there is no toolpath warning', () => {
    expect(selectIsJobReadinessStepMet(JOB_READINESS_STEP.WARNINGS)(newStore().getState())).toBe(true);
  });
});
