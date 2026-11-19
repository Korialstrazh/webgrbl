/**
 * The placement form of the single selected object: X, Y, width, height and rotation, with a lock toggle that keeps the
 * aspect ratio while a size changes. Each committed field is one change in the project history.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DisconnectOutlined, LinkOutlined, RotateLeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { useObjectArtworkFrame } from '../../../utils/hooks/use.object.artwork.frame';
import { getObjectTransformWithField } from '../../../utils/project/get.object.transform.with.field';
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ProjectObjectsTransformed } from '../../../utils/states/project.document.state';
import { getObjectArtworkPlacement } from '../../../utils/toolpath/get.object.artwork.placement';
import { getObjectBoxFieldValue } from '../../../utils/toolpath/get.object.box.field.value';
import type { ObjectArtworkFrame } from '../../../utils/toolpath/interfaces/ObjectArtworkFrame';
import type { ObjectTransformFieldConfig } from '../interfaces/ObjectTransformFieldConfig';
import type { ObjectTransformFieldsProps } from '../interfaces/ObjectTransformFieldsProps';
import { OBJECT_FIELD_KEY_SEPARATOR, OBJECT_TRANSFORM_FIELDS } from '../objects.section.constants';
import { IconActionButton } from '../../../views/IconActionButton';
import { ObjectTransformField } from './ObjectTransformField';
import styles from './styles.module.scss';

// The rotation has no short letter that reads well, so its prefix is the turn icon (counter-clockwise, as it turns).
const ROTATION_PREFIX_ICON: ReactNode = <RotateLeftOutlined />;

export const ObjectTransformFields = ({ projectObject }: ObjectTransformFieldsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);
  const artworkFrame: ObjectArtworkFrame = useObjectArtworkFrame(projectObject);
  // The fields speak of the drawn geometry, the size that burns; the stored placement stays the box's.
  const artworkPlacement: ProjectObjectTransform = getObjectArtworkPlacement(projectObject, artworkFrame);

  const commitField = (field: keyof ProjectObjectTransform, artworkValue: number): void => {
    const boxValue: number = getObjectBoxFieldValue({ boxPlacement: projectObject, artworkFrame, field, artworkValue });

    dispatch(new ProjectObjectsTransformed({
      transforms: {
        [projectObject.id]: getObjectTransformWithField(projectObject, field, boxValue, isRatioLocked),
      },
    }));
  };

  return (
    <div className={styles.fields}>
      <div className={styles.grid}>
        {OBJECT_TRANSFORM_FIELDS.map((config: ObjectTransformFieldConfig) => (
          <ObjectTransformField
            key={[projectObject.id, config.field].join(OBJECT_FIELD_KEY_SEPARATOR)}
            label={t(config.labelKey)}
            hintText={t(config.hintKey)}
            prefixComponent={config.prefixKey ? t(config.prefixKey) : ROTATION_PREFIX_ICON}
            value={artworkPlacement[config.field]}
            decimals={config.decimals}
            onCommit={(fieldValue: number) => commitField(config.field, fieldValue)}
          />
        ))}
        <IconActionButton
          className={isRatioLocked ? styles.lockOn : undefined}
          labelText={t(DEFAULT.OBJECTS_LOCK_RATIO)}
          // A chain link, as in drawing apps: joined while width and height scale together, broken while they do not.
          iconComponent={isRatioLocked ? <LinkOutlined /> : <DisconnectOutlined />}
          aria-pressed={isRatioLocked}
          onClick={() => setIsRatioLocked(!isRatioLocked)}
        />
      </div>
    </div>
  );
};
