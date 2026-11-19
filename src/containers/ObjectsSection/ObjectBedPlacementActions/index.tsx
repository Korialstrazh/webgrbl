/**
 * One-click fixes for an object outside the bed: Move onto bed shifts it just far enough, keeping its size, and Fit to
 * bed shrinks it when it is larger than the bed and centres it. Both are one undo step. Move is off when the object is
 * too large to fit as it is: its tooltip then says so and points to Fit to bed, which becomes the accent action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CompressOutlined, ImportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import { useBedDimensions } from '../../../utils/hooks/use.bed.dimensions';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getObjectFittedToBedTransform } from '../../../utils/project/get.object.fitted.to.bed.transform';
import { getObjectMovedOntoBedTransform } from '../../../utils/project/get.object.moved.onto.bed.transform';
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ProjectObjectsTransformed } from '../../../utils/states/project.document.state';
import { DismissibleTooltip } from '../../../views/DismissibleTooltip';
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
      {/* A disabled button takes no hover, so the tooltip sits on the wrapper around it. */}
      <DismissibleTooltip title={movedTransform ? undefined : t(DEFAULT.OBJECTS_MOVE_ONTO_BED_TOO_LARGE)}>
        <Button
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<ImportOutlined aria-hidden />}
          disabled={!movedTransform}
          aria-description={movedTransform ? undefined : t(DEFAULT.OBJECTS_MOVE_ONTO_BED_TOO_LARGE)}
          onClick={() => {
            if (movedTransform) {
              placeObject(movedTransform);
            }
          }}
        >
          {t(DEFAULT.OBJECTS_MOVE_ONTO_BED)}
        </Button>
      </DismissibleTooltip>
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        type={movedTransform ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
        icon={<CompressOutlined aria-hidden />}
        onClick={() => placeObject(getObjectFittedToBedTransform(projectObject, bed))}
      >
        {t(DEFAULT.OBJECTS_FIT_TO_BED)}
      </Button>
    </div>
  );
};
