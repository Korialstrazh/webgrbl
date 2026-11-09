/**
 * A row of the object list: a button that selects the object, with an icon for its kind (imported drawing or test
 * sample), its name and its size, a warning chip when it is outside
 * the bed or has content the job leaves out (text, images, ...), and a button that deletes it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ApartmentOutlined, CloseOutlined, ColumnWidthOutlined, FileImageOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { useObjectArtworkFrame } from '../../../utils/hooks/use.object.artwork.frame';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { isSampleJobObject } from '../../../utils/materials/is.sample.job.object';
import { selectToolpath, selectToolpathStatus } from '../../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../../utils/states/toolpath.status.constants';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../../utils/toolpath/interfaces/ObjectWarning';
import type { Toolpath } from '../../../utils/toolpath/interfaces/Toolpath';
import type { ObjectArtworkFrame } from '../../../utils/toolpath/interfaces/ObjectArtworkFrame';
import type { ObjectRowProps } from '../interfaces/ObjectRowProps';
import { OBJECT_KIND, OBJECT_MILLIMETRE_DECIMALS } from '../objects.section.constants';
import { IconActionButton } from '../../../views/IconActionButton';
import { TestSampleIcon } from '../../../views/TestSampleIcon';
import { ObjectElementTree } from '../ObjectElementTree';
import { ObjectWarningChip } from '../ObjectWarningChip';
import { getObjectWarningKinds } from './get.object.warning.kinds';
import styles from './styles.module.scss';

export const ObjectRow = ({
  projectObject,
  isSelected,
  isOutsideBed,
  onSelect,
  onDelete,
}: ObjectRowProps): ReactNode => {
  const { t } = useTranslation();
  const rowClassName: string | undefined = isSelected ? [styles.row, styles.selectedRow].join(' ') : styles.row;
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const readyToolpathWarnings: ObjectWarning[] | undefined = isToolpathCurrent ? toolpath?.warnings : undefined;
  const warningKinds: SvgUnsupportedKind[] = useMemo(
    () => getObjectWarningKinds(projectObject, readyToolpathWarnings),
    [projectObject, readyToolpathWarnings],
  );

  const artworkFrame: ObjectArtworkFrame = useObjectArtworkFrame(projectObject);
  const isSample: boolean = isSampleJobObject(projectObject);
  const kindText: string = t(isSample ? DEFAULT.OBJECTS_KIND_SAMPLE : DEFAULT.OBJECTS_KIND_SVG);
  const [isTreeOpen, setIsTreeOpen] = useState<boolean>(false);
  const treeToggleTextKey: string = isTreeOpen ? DEFAULT.OBJECTS_TREE_HIDE : DEFAULT.OBJECTS_TREE_SHOW;

  return (
    <li className={rowClassName}>
      <div className={styles.rowMain}>
        <Button
          className={styles.selectButton}
          type={ANTD_BUTTON_TYPE_TEXT}
          data-object-id={projectObject.id}
          aria-pressed={isSelected}
          onClick={() => onSelect(projectObject.id)}
        >
          <span
            className={[styles.kindIcon, isSample ? styles.sampleKind : styles.svgKind].join(' ')}
            title={kindText}
            data-object-kind={isSample ? OBJECT_KIND.SAMPLE : OBJECT_KIND.SVG}
            aria-hidden
          >
            {isSample ? <TestSampleIcon /> : <FileImageOutlined />}
          </span>
          <span className={styles.details}>
            <span className={styles.name} title={projectObject.name}>{projectObject.name}</span>
            <span className={styles.size} title={t(DEFAULT.OBJECTS_SIZE_HINT)}>
              <ColumnWidthOutlined className={styles.sizeIcon} aria-hidden />
              {t(DEFAULT.OBJECTS_SIZE, {
                widthMm: (projectObject.widthMm * artworkFrame.widthFraction).toFixed(OBJECT_MILLIMETRE_DECIMALS),
                heightMm: (projectObject.heightMm * artworkFrame.heightFraction).toFixed(OBJECT_MILLIMETRE_DECIMALS),
              })}
            </span>
          </span>
        </Button>
        <ObjectWarningChip objectName={projectObject.name} isOutsideBed={isOutsideBed} warningKinds={warningKinds} />
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(treeToggleTextKey, { name: projectObject.name })}
          iconComponent={<ApartmentOutlined />}
          aria-expanded={isTreeOpen}
          onClick={() => setIsTreeOpen(!isTreeOpen)}
        />
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<CloseOutlined />}
          aria-label={t(DEFAULT.OBJECTS_DELETE, { name: projectObject.name })}
          onClick={() => onDelete(projectObject.id)}
        />
      </div>
      {isTreeOpen && <ObjectElementTree projectObject={projectObject} />}
    </li>
  );
};
