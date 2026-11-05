import { newProjectObject } from '../project/new.project.object';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { getSampleJobObject } from './get.sample.job.object';
import { isSampleJobObject } from './is.sample.job.object';
import { SAMPLE_OBJECT_NAME } from './sample.job.constants';

describe(isSampleJobObject.name, () => {
  it('knows the test sample the app adds', () => {
    expect(isSampleJobObject(getSampleJobObject(newToolpathMachineArea()))).toBe(true);
  });

  it('treats a drawing that is only named like the sample as an imported drawing', () => {
    expect(isSampleJobObject(newProjectObject({ name: SAMPLE_OBJECT_NAME }))).toBe(false);
  });
});
