import { Dexie } from 'dexie';
import { describe, expect, it } from 'vitest';
import type { StoredProject } from './interfaces/StoredProject';
import { PROJECT_REPOSITORY } from './project.repository';
import {
  WEBGRBL_DATABASE_NAME,
  WEBGRBL_DATABASE_SCHEMA_VERSION_1,
  WEBGRBL_DATABASE_VERSION_1,
} from './project.database.constants';

const OLD_PROJECT_ID = 'old-project';
const OLD_PROJECT_NAME = 'Made in version 1';
const OLD_TIMESTAMP = '2026-11-01T10:00:00.000Z';

describe('webgrbl database upgrade', () => {
  it('opens a version 1 database at version 2 and still reads its project', async () => {
    const oldDatabase = new Dexie(WEBGRBL_DATABASE_NAME);
    oldDatabase.version(WEBGRBL_DATABASE_VERSION_1).stores(WEBGRBL_DATABASE_SCHEMA_VERSION_1);
    const oldProject: StoredProject = {
      id: OLD_PROJECT_ID,
      name: OLD_PROJECT_NAME,
      createdAt: OLD_TIMESTAMP,
      updatedAt: OLD_TIMESTAMP,
      objects: [],
    };
    await oldDatabase.table('projects').put(oldProject);
    oldDatabase.close();

    const loadedProject = await PROJECT_REPOSITORY.getProject(OLD_PROJECT_ID);

    expect(loadedProject?.project.name).toBe(OLD_PROJECT_NAME);
  });
});
