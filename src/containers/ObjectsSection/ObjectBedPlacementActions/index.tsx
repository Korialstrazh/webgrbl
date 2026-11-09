/**
 * One-click fixes for an object outside the bed: Move onto bed shifts it just far enough, keeping its size, and Fit to
 * bed shrinks it when it is larger than the bed and centres it. Both are one undo step. Move is off, with the reason,
 * when the object is too large to fit as it is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CompressOutlined, ImportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../../utils/antd.constants';
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import { useBedDimensions } from '../../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getObjectFittedToBedTransform } from '../../../utils/project/get.object.fitted.to.bed.transform';
import { getObjectMovedOntoBedTransform } from '../../../utils/project/get.object.moved.onto.bed.transform';
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ProjectObjectsTransformed } from '../../../utils/states/project.document.state';
import type { ObjectBedPlacementActionsProps } from '../interfaces/ObjectBedPlacementActionsProps';
import styles from './styles.module.scss';

export const ObjectBedPlacementActions = ({ projectObject }: ObjectBedPlacementActionsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const bed: BedDimensions = useBedDimensions();
  const movedTransform: ProjectObjectTransform | undefined = getObjectMovedOntoBedTransform(projectObject, bed);

  const placeObject = (transform: ProjectObjectTransform): void => {
    dispatch(new ProjectObjectsTransformed({ transforms: { [projectObject.id]: transform } }));
  };

  return (
    <div className={styles.actions}>
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<ImportOutlined aria-hidden />}
        disabled={!movedTransform}
        title={movedTransform ? undefined : t(DEFAULT.OBJECTS_MOVE_ONTO_BED_TOO_LARGE)}
        onClick={() => {
          if (movedTransform) {
            placeObject(movedTransform);
          }
        }}
      >
        {t(DEFAULT.OBJECTS_MOVE_ONTO_BED)}
      </Button>
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<CompressOutlined aria-hidden />}
        onClick={() => placeObject(getObjectFittedToBedTransform(projectObject, bed))}
      >
        {t(DEFAULT.OBJECTS_FIT_TO_BED)}
      </Button>
    </div>
  );
};
