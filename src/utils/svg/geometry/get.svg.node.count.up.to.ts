/**
 * Counts a node and every node below it (elements, text and comments: a copy clones them all, so each one costs), but
 * stops as soon as the count passes the limit and then gives limit + 1. A copy too large for the budget is then
 * rejected without walking all of it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/**
 * The next node after the given one in document order, without going below it and staying inside the counted root:
 * its next sibling, or else the next sibling of the nearest ancestor that has one.
 */
const getNextNodeAfterSubtree = (node: Node, rootNode: Node): Node | undefined => {
  for (let currentNode: Node | null = node; currentNode && currentNode !== rootNode;
    currentNode = currentNode.parentNode) {
    if (currentNode.nextSibling) {
      return currentNode.nextSibling;
    }
  }

  return undefined;
};

/**
 * Walks the tree one node at a time by its child and sibling links, so no list of children is built: the work stays
 * within the limit even under a node with very many children.
 */
export const getSvgNodeCountUpTo = (rootNode: Node, limit: number): number => {
  let nodeCount = 0;

  for (let currentNode: Node | undefined = rootNode; currentNode;
    currentNode = currentNode.firstChild ?? getNextNodeAfterSubtree(currentNode, rootNode)) {
    nodeCount++;

    if (nodeCount > limit) {
      return nodeCount;
    }
  }

  return nodeCount;
};
