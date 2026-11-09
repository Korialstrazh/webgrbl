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
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { useObjectArtworkFrame } from '../../../utils/hooks/use.object.artwork.frame';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { isSampleJobObject } from '../../../utils/materials/is.sample.job.object';
import { selectCurrentToolpathWarnings } from '../../../utils/states/toolpath.warnings.selector';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../../utils/toolpath/interfaces/ObjectWarning';
import type { ObjectArtworkFrame } from '../../../utils/toolpath/interfaces/ObjectArtworkFrame';
import type { ObjectRowProps } from '../interfaces/ObjectRowProps';
import { OBJECT_KIND } from '../objects.section.constants';
import { IconActionButton } from '../../../views/IconActionButton';
import { TestSampleIcon } from '../../../views/TestSampleIcon';
import { ObjectBedPlacementActions } from '../ObjectBedPlacementActions';
import { ObjectElementTree } from '../ObjectElementTree';
import { ObjectWarningChip } from '../ObjectWarningChip';
import { getCompactMillimetreText } from './get.compact.millimetre.text';
import { getObjectWarningKinds } from './get.object.warning.kinds';
import styles from './styles.module.scss';

const TREE_SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = { block: 'nearest' };

export const ObjectRow = ({
  projectObject,
  isSelected,
  isOutsideBed,
  onSelect,
  onDelete,
}: ObjectRowProps): ReactNode => {
  const { t } = useTranslation();
  const rowClassName: string | undefined = isSelected ? [styles.row, styles.selectedRow].join(' ') : styles.row;
  const readyToolpathWarnings: ObjectWarning[] | undefined = useSelector(selectCurrentToolpathWarnings);
  const warningKinds: SvgUnsupportedKind[] = useMemo(
    () => getObjectWarningKinds(projectObject, readyToolpathWarnings),
    [projectObject, readyToolpathWarnings],
  );

  const artworkFrame: ObjectArtworkFrame = useObjectArtworkFrame(projectObject);
  const isSample: boolean = isSampleJobObject(projectObject);
  const kindText: string = t(isSample ? DEFAULT.OBJECTS_KIND_SAMPLE : DEFAULT.OBJECTS_KIND_SVG);
  const [isTreeOpen, setIsTreeOpen] = useState<boolean>(false);
  const treeToggleTextKey: string = isTreeOpen ? DEFAULT.OBJECTS_TREE_HIDE : DEFAULT.OBJECTS_TREE_SHOW;
  const sizeWidthMm: number = projectObject.widthMm * artworkFrame.widthFraction;
  const sizeHeightMm: number = projectObject.heightMm * artworkFrame.heightFraction;
  const rowRef: RefObject<HTMLLIElement | null> = useRef<HTMLLIElement>(null);

  // An opened tree can fall below the fold of the panel: the panel scrolls just enough to show it.
  useEffect(() => {
    if (isTreeOpen) {
      rowRef.current?.scrollIntoView(TREE_SCROLL_INTO_VIEW_OPTIONS);
    }
  }, [isTreeOpen]);

  return (
    <li ref={rowRef} className={rowClassName}>
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
                widthMm: getCompactMillimetreText(sizeWidthMm),
                heightMm: getCompactMillimetreText(sizeHeightMm),
              })}
            </span>
          </span>
        </Button>
        <ObjectWarningChip
          objectName={projectObject.name}
          isOutsideBed={isOutsideBed}
          outsideBedActionsComponent={<ObjectBedPlacementActions projectObject={projectObject} />}
          warningKinds={warningKinds}
        />
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
