/**
 * Keyboard access to the virtual element tree. Only the rows in view exist, so Tab alone could never reach the rest:
 * one row is the tree's stop in the Tab order (roving tab index), Arrow Up and Down, Home and End move that stop to
 * another row, scroll the list to it and focus its first button, and Tab then walks that row's buttons and leaves.
 * The keys and focus events of a row never reach antd's own tree keyboard: on focus it scrolled back to the first
 * row, and Enter on a button of a layer row folded the layer instead of pressing the button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useCallback, useMemo, useState } from 'react';
import type { FocusEvent, Key, KeyboardEvent, RefObject } from 'react';
import { ANTD_TREE_SCROLL_ALIGN_AUTO } from '../../../utils/antd.constants';
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  END_KEY,
  ENTER_KEY,
  HOME_KEY,
  SPACE_KEY,
} from '../../../utils/browser/browser.events.constants';
import type { SvgTreeNode } from '../../../utils/svg/tree/interfaces/SvgTreeNode';
import type { ElementTreeKeyboard } from './interfaces/ElementTreeKeyboard';
import type { ElementTreeScroller } from './interfaces/ElementTreeScroller';

/** Every row element carries the path of its node in this attribute. */
const ROW_PATH_SELECTOR = '[data-tree-path]';
/** The first button of a row, the one an arrow key focuses. */
const ROW_BUTTON_SELECTOR = 'button';
/** The keys antd's tree keyboard acts on; inside a row they belong to the row's buttons and to this hook. */
const ANTD_TREE_KEYS: ReadonlySet<string> = new Set<string>([
  ARROW_UP_KEY,
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  HOME_KEY,
  END_KEY,
  ENTER_KEY,
  SPACE_KEY,
]);
/** The virtual list mounts a row a frame or two after it scrolls; give up after this many frames. */
const ROW_FOCUS_FRAME_LIMIT = 5;

const getVisibleRowPaths = (nodes: SvgTreeNode[], collapsedPaths: ReadonlySet<string>): string[] => {
  const rowPaths: string[] = [];

  for (const node of nodes) {
    rowPaths.push(node.path);

    if (!collapsedPaths.has(node.path)) {
      rowPaths.push(...getVisibleRowPaths(node.children, collapsedPaths));
    }
  }

  return rowPaths;
};

const getParentRowPaths = (nodes: SvgTreeNode[]): string[] => {
  const parentPaths: string[] = [];

  for (const node of nodes) {
    if (node.children.length) {
      parentPaths.push(node.path, ...getParentRowPaths(node.children));
    }
  }

  return parentPaths;
};

const getRowElement = (treeElement: HTMLElement, rowPath: string): HTMLElement | undefined => {
  for (const rowElement of treeElement.querySelectorAll<HTMLElement>(ROW_PATH_SELECTOR)) {
    if (rowElement.dataset.treePath === rowPath) {
      return rowElement;
    }
  }

  return undefined;
};

const getRowPathOfElement = (element: EventTarget | null): string | undefined =>
  element instanceof HTMLElement ? element.closest<HTMLElement>(ROW_PATH_SELECTOR)?.dataset.treePath : undefined;

const getTargetRowPath = (pressedKey: string, rowPaths: string[], currentPath: string): string | undefined => {
  const currentIndex: number = rowPaths.indexOf(currentPath);

  if (pressedKey === ARROW_DOWN_KEY) {
    return rowPaths[Math.min(currentIndex + 1, rowPaths.length - 1)];
  }

  if (pressedKey === ARROW_UP_KEY) {
    return rowPaths[Math.max(currentIndex - 1, 0)];
  }

  if (pressedKey === HOME_KEY) {
    return rowPaths[0];
  }

  return pressedKey === END_KEY ? rowPaths.at(-1) : undefined;
};

const focusRowButtonWhenMounted = (treeElement: HTMLElement, rowPath: string, framesLeft: number): void => {
  const rowButton: HTMLElement | null | undefined = getRowElement(treeElement, rowPath)
    ?.querySelector<HTMLElement>(ROW_BUTTON_SELECTOR);

  if (rowButton) {
    rowButton.focus();

    return;
  }

  if (framesLeft) {
    requestAnimationFrame(() => focusRowButtonWhenMounted(treeElement, rowPath, framesLeft - 1));
  }
};

export const useElementTreeKeyboard = (
  svgNodes: SvgTreeNode[],
  treeWrapperRef: RefObject<HTMLElement | null>,
  treeScrollerRef: RefObject<ElementTreeScroller | null>,
): ElementTreeKeyboard => {
  const [collapsedPaths, setCollapsedPaths] = useState<ReadonlySet<string>>(new Set<string>());
  const [chosenTabStopPath, setChosenTabStopPath] = useState<string | undefined>(undefined);
  const visibleRowPaths: string[] = useMemo(
    () => getVisibleRowPaths(svgNodes, collapsedPaths),
    [collapsedPaths, svgNodes],
  );
  const expandedPaths: string[] = useMemo(
    () => getParentRowPaths(svgNodes).filter((rowPath: string) => !collapsedPaths.has(rowPath)),
    [collapsedPaths, svgNodes],
  );
  const isChosenPathVisible: boolean = Boolean(chosenTabStopPath) && visibleRowPaths.includes(chosenTabStopPath ?? '');
  const tabStopPath: string | undefined = isChosenPathVisible ? chosenTabStopPath : visibleRowPaths[0];

  const changeExpandedPaths = useCallback((expandedKeys: Key[]): void => {
    const expandedPathSet: Set<string> = new Set<string>(expandedKeys.map(String));

    const collapsedRowPaths: string[] = getParentRowPaths(svgNodes)
      .filter((rowPath: string) => !expandedPathSet.has(rowPath));

    setCollapsedPaths(new Set<string>(collapsedRowPaths));
  }, [svgNodes]);

  const moveTabStopByKey = useCallback((keyboardEvent: KeyboardEvent<HTMLElement>): void => {
    if (ANTD_TREE_KEYS.has(keyboardEvent.key)) {
      keyboardEvent.stopPropagation();
    }

    const treeElement: HTMLElement | null = treeWrapperRef.current;
    const isInsideTree: boolean = Boolean(treeElement?.contains(keyboardEvent.target as Node));
    const currentPath: string | undefined = getRowPathOfElement(keyboardEvent.target) ?? tabStopPath;
    const targetPath: string | undefined = getTargetRowPath(keyboardEvent.key, visibleRowPaths, currentPath ?? '');

    // A key pressed in the colour popover reaches here through the React portal; the popover keeps it.
    if (!treeElement || !isInsideTree || !targetPath) {
      return;
    }

    keyboardEvent.preventDefault();
    setChosenTabStopPath(targetPath);
    treeScrollerRef.current?.scrollTo({ key: targetPath, align: ANTD_TREE_SCROLL_ALIGN_AUTO });
    focusRowButtonWhenMounted(treeElement, targetPath, ROW_FOCUS_FRAME_LIMIT);
  }, [tabStopPath, treeScrollerRef, treeWrapperRef, visibleRowPaths]);

  const followFocusedRow = useCallback((focusEvent: FocusEvent<HTMLElement>): void => {
    const focusedPath: string | undefined = getRowPathOfElement(focusEvent.target);

    focusEvent.stopPropagation();

    if (focusedPath) {
      setChosenTabStopPath(focusedPath);
    }
  }, []);

  const stopRowBlur = useCallback((focusEvent: FocusEvent<HTMLElement>): void => {
    focusEvent.stopPropagation();
  }, []);

  // Scrolled by mouse or wheel, the tab stop row may leave the list; the first row in view takes over, so Tab still
  // enters the tree. While a row has focus the arrow keys are moving the stop, so it is left alone.
  const keepTabStopInView = useCallback((): void => {
    const treeElement: HTMLElement | null = treeWrapperRef.current;
    const hasFocusInTree: boolean = Boolean(treeElement?.contains(document.activeElement));

    if (!treeElement || hasFocusInTree || getRowElement(treeElement, tabStopPath ?? '')) {
      return;
    }

    setChosenTabStopPath(treeElement.querySelector<HTMLElement>(ROW_PATH_SELECTOR)?.dataset.treePath);
  }, [tabStopPath, treeWrapperRef]);

  return {
    tabStopPath,
    expandedPaths,
    changeExpandedPaths,
    moveTabStopByKey,
    followFocusedRow,
    stopRowBlur,
    keepTabStopInView,
  };
};
