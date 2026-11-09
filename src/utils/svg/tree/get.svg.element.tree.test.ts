import { getSanitizedSvg } from '../get.sanitized.svg';
import type { SanitizedSvg } from '../interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../interfaces/SvgImportFailure';
import { SVG_NAMESPACE_URI } from '../svg.constants';
import { getSvgElementTree } from './get.svg.element.tree';
import { getSvgTextWithElementDisabled } from './get.svg.text.with.element.disabled';
import type { SvgTreeNode } from './interfaces/SvgTreeNode';
import { INKSCAPE_NAMESPACE_URI, SVG_TREE_NODE_KIND } from './svg.tree.constants';

const LAYER_LABEL = 'Cut layer';
const PATH_ID = 'outline';

const INKSCAPE_SVG_TEXT: string = `<svg xmlns="${SVG_NAMESPACE_URI}" xmlns:inkscape="${INKSCAPE_NAMESPACE_URI}" `
  + 'width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<defs><path id="hidden" d="M0 0 L1 1"/></defs>'
  + `<g inkscape:groupmode="layer" inkscape:label="${LAYER_LABEL}">`
  + `<path id="${PATH_ID}" d="M0 0 L5 5" stroke="#ff0000"/>`
  + '<g><rect width="2" height="2"/></g>'
  + '</g></svg>';

const isSanitizedSvg = (result: SanitizedSvg | SvgImportFailure): result is SanitizedSvg => 'svgText' in result;

const getImportedSvgText = (): string => {
  const result: SanitizedSvg | SvgImportFailure = getSanitizedSvg(INKSCAPE_SVG_TEXT);

  if (!isSanitizedSvg(result)) {
    throw new Error('test svg did not import');
  }

  return result.svgText;
};

describe(getSvgElementTree.name, () => {
  it('lists Inkscape layers, groups and shapes with readable names and skips defs', () => {
    const tree: SvgTreeNode[] = getSvgElementTree(getImportedSvgText());

    expect(tree).toHaveLength(1);
    expect(tree[0]).toMatchObject({ kind: SVG_TREE_NODE_KIND.LAYER, name: LAYER_LABEL, path: '1' });
    expect(tree[0]?.children.map((node: SvgTreeNode) => [node.kind, node.name, node.path])).toEqual([
      [SVG_TREE_NODE_KIND.SHAPE, PATH_ID, '1.0'],
      [SVG_TREE_NODE_KIND.GROUP, 'g', '1.1'],
    ]);
    expect(tree[0]?.children[1]?.children[0]).toMatchObject({
      kind: SVG_TREE_NODE_KIND.SHAPE,
      name: 'rect',
      elementName: 'rect',
    });
  });

  it('marks a turned-off node and everything under it', () => {
    const tree: SvgTreeNode[] = getSvgElementTree(getSvgTextWithElementDisabled(getImportedSvgText(), '1', true));

    expect(tree[0]?.isDisabled).toBe(true);
    expect(tree[0]?.children[0]).toMatchObject({ isDisabled: false, isInsideDisabled: true });
  });

  it('turns a node back on', () => {
    const disabledText: string = getSvgTextWithElementDisabled(getImportedSvgText(), '1.0', true);
    const tree: SvgTreeNode[] = getSvgElementTree(getSvgTextWithElementDisabled(disabledText, '1.0', false));

    expect(tree[0]?.children[0]?.isDisabled).toBe(false);
  });

  it('gives an empty tree for unreadable text', () => {
    expect(getSvgElementTree('<svg')).toEqual([]);
  });
});
