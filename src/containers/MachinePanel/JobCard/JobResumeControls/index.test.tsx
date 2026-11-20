import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobResumeControls } from '.';
import { newMachineProfile } from '../../../../utils/profiles/new.machine.profile';
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';
import type { GcodeLine } from '../../../../utils/toolpath/interfaces/GcodeLine';
import { newToolpath } from '../../../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../../../utils/toolpath/test.support/new.toolpath.move';
import { JobResumePointRecorded } from '../../../../utils/states/job.resume.state';
import { JobSafetyChecklistOpened } from '../../../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../../../utils/states/job.start.request.constants';
import { ActiveMachineProfileSelected, MachineProfileSaved } from '../../../../utils/states/machine.profile.state';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';
import { AntdTestProvider } from '../../../../utils/test.support/antd.test.provider';

const blockedReasonKeyMock = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock('../../../../utils/states/job.resume.blocked.reason.selector', () => ({
  selectJobResumeBlockedReasonKey: (): string | undefined => blockedReasonKeyMock.value,
}));

const RESUME_LABEL = 'Resume from about 63 %';
const FRAME_HINT_TEXT = 'Run Frame job first to check the position, and do not touch the material.';
const NO_HOMING_TEXT = /must be at exactly the same work zero/;
const MOVE_COUNT = 28;
const ANSWERED_LINE_COUNT = 19;
const LINES: GcodeLine[] = [
  { text: 'G21', moveIndex: undefined },
  { text: 'M4', moveIndex: undefined },
  ...Array.from({ length: MOVE_COUNT }, (_: unknown, moveIndex: number): GcodeLine => ({
    text: `G1 X${moveIndex}`,
    moveIndex,
  })),
];

const newResumeStore = (hasHomingSwitches: boolean, isResumeRecorded: boolean = true): AppStore => {
  const store: AppStore = newStore();
  const profile: MachineProfile = newMachineProfile({ hasHomingSwitches });

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));

  if (isResumeRecorded) {
    store.dispatch(new JobResumePointRecorded({
      lines: LINES,
      answeredLineCount: ANSWERED_LINE_COUNT,
      toolpathDocumentVersion: 0,
      profileId: profile.id,
      toolpath: newToolpath({ moves: Array.from({ length: MOVE_COUNT }, () => newToolpathMove()) }),
    }));
  }

  return store;
};

const renderControls = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <JobResumeControls />
      </AntdTestProvider>
    </Provider>,
  );
};

describe('JobResumeControls', () => {
  beforeEach(() => {
    blockedReasonKeyMock.value = undefined;
  });

  it('offers to resume from the percent reached, with a hint to frame first and leave the material', () => {
    renderControls(newResumeStore(true));

    expect(screen.getByRole('button', { name: RESUME_LABEL })).toBeInTheDocument();
    expect(screen.getByText(FRAME_HINT_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(NO_HOMING_TEXT)).not.toBeInTheDocument();
  });

  it('warns that the work zero must match on a laser without homing switches', () => {
    renderControls(newResumeStore(false));

    expect(screen.getByText(NO_HOMING_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: RESUME_LABEL })).not.toHaveAttribute('aria-disabled');
  });

  it('opens the safety checklist for a resume', () => {
    const store: AppStore = newResumeStore(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderControls(store);
    fireEvent.click(screen.getByRole('button', { name: RESUME_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new JobSafetyChecklistOpened({ kind: JOB_START_REQUEST_KIND.RESUME }));
  });

  it('turns the button off while a resume is blocked', () => {
    blockedReasonKeyMock.value = 'JOB_RESUME_BLOCKED_PROJECT_CHANGED';
    const store: AppStore = newResumeStore(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderControls(store);
    fireEvent.click(screen.getByRole('button', { name: RESUME_LABEL }));

    expect(screen.getByRole('button', { name: RESUME_LABEL })).toHaveAttribute('aria-disabled', 'true');
    expect(dispatchSpy).not.toHaveBeenCalledWith(new JobSafetyChecklistOpened({ kind: JOB_START_REQUEST_KIND.RESUME }));
  });

  it('shows nothing when no run stopped early', () => {
    renderControls(newResumeStore(true, false));

    expect(screen.queryByRole('button', { name: RESUME_LABEL })).not.toBeInTheDocument();
  });
});
