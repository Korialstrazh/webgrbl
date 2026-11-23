/**
 * The element tree of one object in the Objects card: its Inkscape layers, groups and shapes, each with icon buttons
 * to skip it, recolour it into another laser layer, or delete it. Every edit is one undo step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BlockOutlined, FolderOutlined } from '@ant-design/icons';
import { Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { useCallback, useMemo, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { Palette } from '../../../utils/palette/interfaces/Palette';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectPalette } from '../../../utils/states/palette.state';
import { ProjectObjectSvgTextChangeRequested } from '../../../utils/states/project.document.state';
import { getSvgElementTree } from '../../../utils/svg/tree/get.svg.element.tree';
import { getSvgTextWithElementColour } from '../../../utils/svg/tree/get.svg.text.with.element.colour';
import { getSvgTextWithElementDisabled } from '../../../utils/svg/tree/get.svg.text.with.element.disabled';
import { getSvgTextWithoutElement } from '../../../utils/svg/tree/get.svg.text.without.element';
import type { SvgTreeNode } from '../../../utils/svg/tree/interfaces/SvgTreeNode';
import { SVG_TREE_NODE_KIND } from '../../../utils/svg/tree/svg.tree.constants';
import type { SvgTreeNodeKind } from '../../../utils/svg/tree/svg.tree.constants';
import { SvgShapeIcon } from '../../../views/SvgShapeIcon';
import { ElementNodeActions } from './ElementNodeActions';
import type { ObjectElementTreeProps } from './interfaces/ObjectElementTreeProps';
import styles from './styles.module.scss';
import { useElementTreeViewportHeightPx } from './use.element.tree.viewport.height.px';

const getNodeKindIcon = (svgNode: SvgTreeNode): ReactNode => {
  if (svgNode.kind === SVG_TREE_NODE_KIND.LAYER) {
    return <FolderOutlined />;
  }

  if (svgNode.kind === SVG_TREE_NODE_KIND.GROUP) {
    return <BlockOutlined />;
  }

  return <SvgShapeIcon elementName={svgNode.elementName} />;
};

const NODE_KIND_TEXT_KEY: Readonly<Record<SvgTreeNodeKind, string>> = {
  [SVG_TREE_NODE_KIND.LAYER]: DEFAULT.OBJECTS_TREE_KIND_LAYER,
  [SVG_TREE_NODE_KIND.GROUP]: DEFAULT.OBJECTS_TREE_KIND_GROUP,
  [SVG_TREE_NODE_KIND.SHAPE]: DEFAULT.OBJECTS_TREE_KIND_SHAPE,
};

/** The tree data of antd, with the SVG node kept on each entry for the row renderer. */
interface ElementTreeDataNode extends TreeDataNode {
  /** The SVG node the row shows. */
  svgNode: SvgTreeNode;
  children: ElementTreeDataNode[];
}

const getElementTreeData = (nodes: SvgTreeNode[]): ElementTreeDataNode[] =>
  nodes.map((node: SvgTreeNode): ElementTreeDataNode => ({
    key: node.path,
    svgNode: node,
    children: getElementTreeData(node.children),
  }));

export const ObjectElementTree = ({ projectObject }: ObjectElementTreeProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const palette: Palette = useSelector(selectPalette);
  const { id: objectId, svgText, name: objectName } = projectObject;
  const treeData: ElementTreeDataNode[] = useMemo(() => getElementTreeData(getSvgElementTree(svgText)), [svgText]);
  const treeWrapperRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const viewportHeightPx: number = useElementTreeViewportHeightPx(treeWrapperRef);

  const changeSvgText = useCallback((changedSvgText: string): void => {
    dispatch(new ProjectObjectSvgTextChangeRequested({ objectId, svgText: changedSvgText }));
  }, [dispatch, objectId]);

  const changeElementDisabled = useCallback((nodePath: string, isDisabled: boolean): void => {
    changeSvgText(getSvgTextWithElementDisabled(svgText, nodePath, isDisabled));
  }, [changeSvgText, svgText]);

  const deleteElement = useCallback((nodePath: string): void => {
    changeSvgText(getSvgTextWithoutElement(svgText, nodePath));
  }, [changeSvgText, svgText]);

  const recolourElement = useCallback((nodePath: string, colour: string): void => {
    changeSvgText(getSvgTextWithElementColour(svgText, nodePath, colour));
  }, [changeSvgText, svgText]);

  const renderNodeTitle = useCallback(({ svgNode }: ElementTreeDataNode): ReactNode => {
    const isSkipped: boolean = svgNode.isDisabled || svgNode.isInsideDisabled;
    const nodeClassName: string | undefined = isSkipped ? [styles.node, styles.skippedNode].join(' ') : styles.node;

    return (
      <span className={nodeClassName} data-tree-path={svgNode.path}>
        <span className={styles.kindIcon} title={t(NODE_KIND_TEXT_KEY[svgNode.kind])} aria-hidden>
          {getNodeKindIcon(svgNode)}
        </span>
        <span className={styles.name} title={svgNode.name}>{svgNode.name}</span>
        <ElementNodeActions
          node={svgNode}
          palette={palette}
          onDisabledChange={changeElementDisabled}
          onDelete={deleteElement}
          onRecolour={recolourElement}
        />
      </span>
    );
  }, [changeElementDisabled, deleteElement, palette, recolourElement, t]);

  if (!treeData.length) {
    return <p className={styles.empty}>{t(DEFAULT.OBJECTS_TREE_EMPTY)}</p>;
  }

  // A height turns on the virtual list of antd: only the rows in view are rendered, so an SVG of thousands of shapes
  // opens at once. The height follows the panel, and the list only grows to it, so a short tree takes no more room
  // than its rows.
  return (
    <div ref={treeWrapperRef} className={styles.tree} aria-label={t(DEFAULT.OBJECTS_TREE_LABEL, { name: objectName })}>
      <Tree<ElementTreeDataNode>
        blockNode
        defaultExpandAll
        selectable={false}
        height={viewportHeightPx}
        treeData={treeData}
        titleRender={renderNodeTitle}
      />
    </div>
  );
};
