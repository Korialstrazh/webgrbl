import { getObjectArtworkFrame } from './get.object.artwork.frame';
import { FULL_OBJECT_ARTWORK_FRAME } from './object.artwork.frame.constants';

const PAGE_WIDTH_MM = 120;
const PAGE_HEIGHT_MM = 80;
const MARGIN_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80">'
  + '<rect x="5" y="5" width="110" height="70" fill="none" stroke="#ff0000" stroke-width="4"/></svg>';
const EMPTY_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80"/>';

describe(getObjectArtworkFrame.name, () => {
  it('measures the geometry inside the page margins, without the stroke width', () => {
    const artworkFrame = getObjectArtworkFrame({
      svgText: MARGIN_SVG_TEXT,
      intrinsicWidthMm: PAGE_WIDTH_MM,
      intrinsicHeightMm: PAGE_HEIGHT_MM,
    });

    expect(artworkFrame.leftFraction * PAGE_WIDTH_MM).toBeCloseTo(5);
    expect(artworkFrame.topFraction * PAGE_HEIGHT_MM).toBeCloseTo(5);
    expect(artworkFrame.widthFraction * PAGE_WIDTH_MM).toBeCloseTo(110);
    expect(artworkFrame.heightFraction * PAGE_HEIGHT_MM).toBeCloseTo(70);
  });

  it('keeps the whole box when nothing is drawn', () => {
    expect(getObjectArtworkFrame({
      svgText: EMPTY_SVG_TEXT,
      intrinsicWidthMm: PAGE_WIDTH_MM,
      intrinsicHeightMm: PAGE_HEIGHT_MM,
    })).toEqual(FULL_OBJECT_ARTWORK_FRAME);
  });
});
