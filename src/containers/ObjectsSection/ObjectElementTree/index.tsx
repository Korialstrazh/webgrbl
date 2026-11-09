/**
 * The element tree of one object in the Objects card: its Inkscape layers, groups and shapes, each with icon buttons
 * to skip it, recolour it into another laser layer, or delete it. Every edit is one undo step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BlockOutlined, BorderOutlined, FolderOutlined } from '@ant-design/icons';
import { Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { ProjectObjectSvgTextChangeRequested } from '../../../utils/states/project.document.state';
import { getSvgElementTree } from '../../../utils/svg/tree/get.svg.element.tree';
import { getSvgTextWithElementColour } from '../../../utils/svg/tree/get.svg.text.with.element.colour';
import { getSvgTextWithElementDisabled } from '../../../utils/svg/tree/get.svg.text.with.element.disabled';
import { getSvgTextWithoutElement } from '../../../utils/svg/tree/get.svg.text.without.element';
import type { SvgTreeNode } from '../../../utils/svg/tree/interfaces/SvgTreeNode';
import { SVG_TREE_NODE_KIND } from '../../../utils/svg/tree/svg.tree.constants';
import type { SvgTreeNodeKind } from '../../../utils/svg/tree/svg.tree.constants';
import { ElementNodeActions } from './ElementNodeActions';
import type { ObjectElementTreeProps } from './interfaces/ObjectElementTreeProps';
import styles from './styles.module.scss';

const NODE_KIND_ICON: Readonly<Record<SvgTreeNodeKind, ReactNode>> = {
  [SVG_TREE_NODE_KIND.LAYER]: <FolderOutlined />,
  [SVG_TREE_NODE_KIND.GROUP]: <BlockOutlined />,
  [SVG_TREE_NODE_KIND.SHAPE]: <BorderOutlined />,
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
  const { id: objectId, svgText, name: objectName } = projectObject;
  const treeData: ElementTreeDataNode[] = useMemo(() => getElementTreeData(getSvgElementTree(svgText)), [svgText]);

  const changeSvgText = (changedSvgText: string): void => {
    dispatch(new ProjectObjectSvgTextChangeRequested({ objectId, svgText: changedSvgText }));
  };

  if (!treeData.length) {
    return <p className={styles.empty}>{t(DEFAULT.OBJECTS_TREE_EMPTY)}</p>;
  }

  const renderNodeTitle = ({ svgNode }: ElementTreeDataNode): ReactNode => {
    const isSkipped: boolean = svgNode.isDisabled || svgNode.isInsideDisabled;
    const nodeClassName: string | undefined = isSkipped ? [styles.node, styles.skippedNode].join(' ') : styles.node;

    return (
      <span className={nodeClassName} data-tree-path={svgNode.path}>
        <span className={styles.kindIcon} title={t(NODE_KIND_TEXT_KEY[svgNode.kind])} aria-hidden>
          {NODE_KIND_ICON[svgNode.kind]}
        </span>
        <span className={styles.name} title={svgNode.name}>{svgNode.name}</span>
        <ElementNodeActions
          node={svgNode}
          onDisabledChange={(nodePath: string, isDisabled: boolean) =>
            changeSvgText(getSvgTextWithElementDisabled(svgText, nodePath, isDisabled))}
          onDelete={(nodePath: string) => changeSvgText(getSvgTextWithoutElement(svgText, nodePath))}
          onRecolour={(nodePath: string, colour: string) =>
            changeSvgText(getSvgTextWithElementColour(svgText, nodePath, colour))}
        />
      </span>
    );
  };

  return (
    <div className={styles.tree} aria-label={t(DEFAULT.OBJECTS_TREE_LABEL, { name: objectName })}>
      <Tree<ElementTreeDataNode>
        blockNode
        defaultExpandAll
        selectable={false}
        treeData={treeData}
        titleRender={renderNodeTitle}
      />
    </div>
  );
};
