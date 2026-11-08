/**
 * The Objects section of the design panel: the list of project objects, and for a single selected object its
 * placement fields above the list. A new single selection scrolls its fields and its row into view, so the object being
 * edited is never out of sight. With no objects it shows a short hint; the card on the bed offers the import.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { FileImageOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { useBedDimensions } from '../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { isObjectOutsideBed } from '../../utils/project/is.object.outside.bed';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectObjectsDeleted, selectProjectObjects } from '../../utils/states/project.document.state';
import {
  ProjectSelectionChanged,
  selectSelectedObjectIds,
  selectSelectedObjects,
} from '../../utils/states/project.selection.state';
import { SCRIPT_FOCUS_ONLY_TAB_INDEX } from '../../utils/tab.index.constants';
import { BED_EMPTY_IMPORT_BUTTON_ID } from '../BedEmptyCard/bed.empty.card.constants';
import { JOB_NEXT_STEP_BUTTON_ID } from '../MachinePanel/JobCard/JobReadinessRow/job.readiness.row.constants';
import { ObjectRow } from './ObjectRow';
import { ObjectTransformFields } from './ObjectTransformFields';
import styles from './styles.module.scss';

export const ObjectsSection = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const selectedObjects: ProjectObject[] = useSelector(selectSelectedObjects);
  const selectedObjectIds: string[] = useSelector(selectSelectedObjectIds);
  const bed: BedDimensions = useBedDimensions();
  const singleSelectedObject: ProjectObject | undefined = selectedObjects.length === 1 ? selectedObjects[0] : undefined;
  const sectionRef = useRef<HTMLDivElement>(null);
  const transformFieldsRef = useRef<HTMLDivElement>(null);
  const singleSelectedObjectId: string | undefined = singleSelectedObject?.id;
  // Set by a delete, so focus moves on to the next row, or after the last one to Import SVG on the empty bed card (the
  // empty hint when that card is not on screen), instead of falling back to the page.
  const isFocusAfterDeleteWantedRef = useRef<boolean>(false);
  const focusedObjectIdAfterDeleteRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isFocusAfterDeleteWantedRef.current) {
      return;
    }

    isFocusAfterDeleteWantedRef.current = false;
    const objectId: string | undefined = focusedObjectIdAfterDeleteRef.current;

    if (objectId) {
      sectionRef.current?.querySelector<HTMLElement>(`[data-object-id="${CSS.escape(objectId)}"]`)?.focus();

      return;
    }

    // The bed card's Import SVG in a narrow layout, the Job card's Import SVG next step in a wide one.
    const importButton: HTMLElement | null = document.getElementById(BED_EMPTY_IMPORT_BUTTON_ID)
      ?? document.getElementById(JOB_NEXT_STEP_BUTTON_ID);

    importButton?.focus();

    // A hidden bed region (a narrow layout showing another region) takes no focus.
    if (document.activeElement !== importButton) {
      sectionRef.current?.focus();
    }
  }, [projectObjects]);

  useEffect(() => {
    if (!singleSelectedObjectId) {
      return;
    }

    // The fields first, then the row, so a long list still shows the selected row and as much of its fields as fits.
    transformFieldsRef.current?.scrollIntoView({ block: 'nearest' });
    sectionRef.current
      ?.querySelector<HTMLElement>(`[data-object-id="${CSS.escape(singleSelectedObjectId)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [singleSelectedObjectId]);

  const deleteObject = (objectId: string): void => {
    const objectIndex: number = projectObjects.findIndex(
      (projectObject: ProjectObject) => projectObject.id === objectId,
    );
    const remainingObjects: ProjectObject[] = projectObjects.filter(
      (projectObject: ProjectObject) => projectObject.id !== objectId,
    );

    focusedObjectIdAfterDeleteRef.current = remainingObjects[Math.min(objectIndex, remainingObjects.length - 1)]?.id;
    isFocusAfterDeleteWantedRef.current = true;
    dispatch(new ProjectObjectsDeleted({ objectIds: [objectId] }));
  };

  if (!projectObjects.length) {
    return (
      <div ref={sectionRef} className={styles.empty} tabIndex={SCRIPT_FOCUS_ONLY_TAB_INDEX}>
        <p className={styles.hint}><FileImageOutlined aria-hidden />{t(DEFAULT.OBJECTS_EMPTY_HINT)}</p>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={styles.section}>
      {singleSelectedObject && (
        <div ref={transformFieldsRef} className={styles.transformFields}>
          <ObjectTransformFields projectObject={singleSelectedObject} />
        </div>
      )}
      <ul className={styles.list} aria-label={t(DEFAULT.OBJECTS_LIST_LABEL)}>
        {projectObjects.map((projectObject: ProjectObject) => (
          <ObjectRow
            key={projectObject.id}
            projectObject={projectObject}
            isSelected={selectedObjectIds.includes(projectObject.id)}
            isOutsideBed={isObjectOutsideBed(projectObject, bed)}
            onSelect={(objectId: string) => dispatch(new ProjectSelectionChanged({ objectIds: [objectId] }))}
            onDelete={deleteObject}
          />
        ))}
      </ul>
    </div>
  );
};
