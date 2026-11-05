/**
 * The Objects section of the design panel: the list of project objects, and for a single selected object its
 * placement fields. With no objects it shows a short hint; the card on the bed offers the import.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
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

  if (!projectObjects.length) {
    return (
      <div className={styles.empty}>
        <p className={styles.hint}>{t(DEFAULT.OBJECTS_EMPTY_HINT)}</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <ul className={styles.list} aria-label={t(DEFAULT.OBJECTS_LIST_LABEL)}>
        {projectObjects.map((projectObject: ProjectObject) => (
          <ObjectRow
            key={projectObject.id}
            projectObject={projectObject}
            isSelected={selectedObjectIds.includes(projectObject.id)}
            isOutsideBed={isObjectOutsideBed(projectObject, bed)}
            onSelect={(objectId: string) => dispatch(new ProjectSelectionChanged({ objectIds: [objectId] }))}
            onDelete={(objectId: string) => dispatch(new ProjectObjectsDeleted({ objectIds: [objectId] }))}
          />
        ))}
      </ul>
      {singleSelectedObject && <ObjectTransformFields projectObject={singleSelectedObject} />}
    </div>
  );
};
