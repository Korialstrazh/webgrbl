/**
 * The note under the job actions when the frame outline would leave the bed: a warning icon, a short label with the
 * distance and the edge, and a Move job icon button that selects every object in the Design view, ready to be dragged
 * onto the bed. When objects outside the bed fit on it as they are, a Move onto bed button shifts them onto it in one
 * undo step. The full sentence opens in a tooltip and is read out by screen readers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DragOutlined, ImportOutlined, WarningOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../../../../utils/antd.constants';
import { ARIA_ROLE_ALERT } from '../../../../../utils/aria.constants';
import { BED_VIEW_MODE } from '../../../../../utils/bed/bed.view.constants';
import type { BedDimensions } from '../../../../../utils/bed/interfaces/BedDimensions';
import type { FrameBedOverrun } from '../../../../../utils/frame/interfaces/FrameBedOverrun';
import { useBedDimensions } from '../../../../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../../../../utils/localization/default.locales';
import { getObjectMovedOntoBedTransform } from '../../../../../utils/project/get.object.moved.onto.bed.transform';
import type { ProjectObject } from '../../../../../utils/project/interfaces/ProjectObject';
import type { ProjectObjectTransform } from '../../../../../utils/project/interfaces/ProjectObjectTransform';
import { isObjectArtworkOutsideBed } from '../../../../../utils/project/is.object.artwork.outside.bed';
import { BedViewModeChanged } from '../../../../../utils/states/bed.view.state';
import type { AppDispatch } from '../../../../../utils/states/new.store';
import { ProjectObjectsTransformed, selectProjectObjects } from '../../../../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../../../../utils/states/project.selection.state';
import { IconActionButton } from '../../../../../views/IconActionButton';
import { FRAME_EDGE_TEXT_KEYS } from '../frame.controls.constants';
import styles from './styles.module.scss';

/** The values filled into the frame overrun texts. */
type FrameBedOverrunTextValues = Record<'distanceMm' | 'edge', number | string>;

/** The move onto the bed of every object outside it that fits on the bed as it is. */
const getOffBedObjectsMovedOntoBed = (
  projectObjects: ProjectObject[],
  bed: BedDimensions,
): Record<string, ProjectObjectTransform> => {
  const transforms: Record<string, ProjectObjectTransform> = {};

  for (const projectObject of projectObjects) {
    const movedTransform: ProjectObjectTransform | undefined = isObjectArtworkOutsideBed(projectObject, bed)
      ? getObjectMovedOntoBedTransform(projectObject, bed)
      : undefined;

    if (movedTransform) {
      transforms[projectObject.id] = movedTransform;
    }
  }

  return transforms;
};

interface FrameBedOverrunNoteProps {
  bedOverrun: FrameBedOverrun;
}

export const FrameBedOverrunNote = ({ bedOverrun }: FrameBedOverrunNoteProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const bed: BedDimensions = useBedDimensions();
  const movedTransforms: Record<string, ProjectObjectTransform> = getOffBedObjectsMovedOntoBed(projectObjects, bed);
  const hasMovableObjects: boolean = Boolean(Object.keys(movedTransforms).length);
  const textValues: FrameBedOverrunTextValues = {
    distanceMm: Math.ceil(bedOverrun.distanceMm),
    edge: t(FRAME_EDGE_TEXT_KEYS[bedOverrun.edge]),
  };
  const fullText: string = t(DEFAULT.FRAME_BED_OVERRUN, textValues);

  const selectJobToMove = (): void => {
    dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }));
    dispatch(new ProjectSelectionChanged({
      objectIds: projectObjects.map((projectObject: ProjectObject): string => projectObject.id),
    }));
  };

  return (
    <div className={styles.frameBedOverrunNote} role={ARIA_ROLE_ALERT}>
      <Tooltip title={fullText}>
        <span className={styles.label}>
          <WarningOutlined className={styles.icon} aria-hidden />
          <span aria-hidden>{t(DEFAULT.FRAME_BED_OVERRUN_SHORT, textValues)}</span>
          <span className={styles.fullText}>{fullText}</span>
        </span>
      </Tooltip>
      {hasMovableObjects && (
        <IconActionButton
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(DEFAULT.OBJECTS_MOVE_ONTO_BED)}
          iconComponent={<ImportOutlined />}
          onClick={() => dispatch(new ProjectObjectsTransformed({ transforms: movedTransforms }))}
        />
      )}
      <IconActionButton
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={t(DEFAULT.FRAME_BED_OVERRUN_MOVE)}
        iconComponent={<DragOutlined />}
        onClick={selectJobToMove}
      />
    </div>
  );
};
