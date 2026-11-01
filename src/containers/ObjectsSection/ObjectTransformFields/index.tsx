/**
 * The placement form of the single selected object: X, Y, width, height and rotation, with a switch that keeps the
 * aspect ratio while a size changes. Each committed field is one change in the project history.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Switch } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_SWITCH_SIZE_SMALL } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getObjectTransformWithField } from '../../../utils/project/get.object.transform.with.field';
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ProjectObjectsTransformed } from '../../../utils/states/project.document.state';
import type { ObjectTransformFieldConfig } from '../interfaces/ObjectTransformFieldConfig';
import type { ObjectTransformFieldsProps } from '../interfaces/ObjectTransformFieldsProps';
import { OBJECT_FIELD_KEY_SEPARATOR, OBJECT_TRANSFORM_FIELDS } from '../objects.section.constants';
import { ObjectTransformField } from './ObjectTransformField';
import styles from './styles.module.scss';

export const ObjectTransformFields = ({ projectObject }: ObjectTransformFieldsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const lockLabelId: string = useId();
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);

  const commitField = (field: keyof ProjectObjectTransform, fieldValue: number): void => {
    dispatch(new ProjectObjectsTransformed({
      transforms: {
        [projectObject.id]: getObjectTransformWithField(projectObject, field, fieldValue, isRatioLocked),
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
            value={projectObject[config.field]}
            decimals={config.decimals}
            onCommit={(fieldValue: number) => commitField(config.field, fieldValue)}
          />
        ))}
      </div>
      <div className={styles.lock}>
        <Switch
          size={ANTD_SWITCH_SIZE_SMALL}
          checked={isRatioLocked}
          onChange={setIsRatioLocked}
          aria-labelledby={lockLabelId}
        />
        <span id={lockLabelId}>{t(DEFAULT.OBJECTS_LOCK_RATIO)}</span>
      </div>
    </div>
  );
};
