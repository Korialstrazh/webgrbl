import { COLOUR_CHANNEL_MAX } from './colour.constants';
import { getParsedColour } from './get.parsed.colour';

const RED = '#ff0000';
const HALF_ALPHA = 0.5;
const HALF_ALPHA_CHANNEL_VALUE = 128;
const HEX_HALF_ALPHA = HALF_ALPHA_CHANNEL_VALUE / COLOUR_CHANNEL_MAX;

describe(getParsedColour.name, () => {
  it('reads the forms getNormalizedColour reads with full alpha', () => {
    expect(getParsedColour('#F00')).toEqual({ colour: RED, alpha: 1 });
    expect(getParsedColour('red')).toEqual({ colour: RED, alpha: 1 });
    expect(getParsedColour('rgb(255, 0, 0)')).toEqual({ colour: RED, alpha: 1 });
  });

  it('reads transparent as alpha 0', () => {
    expect(getParsedColour('transparent')?.alpha).toBe(0);
  });

  it('reads rgba, hex with alpha, percent rgb and hsl', () => {
    expect(getParsedColour('rgba(255,0,0,0.5)')).toEqual({ colour: RED, alpha: HALF_ALPHA });
    expect(getParsedColour('#ff000080')?.alpha).toBeCloseTo(HEX_HALF_ALPHA);
    expect(getParsedColour('#f008')?.colour).toBe(RED);
    expect(getParsedColour('rgb(100%, 0%, 0%)')).toEqual({ colour: RED, alpha: 1 });
    expect(getParsedColour('hsl(0, 100%, 50%)')).toEqual({ colour: RED, alpha: 1 });
    expect(getParsedColour('hsla(120, 100%, 50%, 0.5)')).toEqual({ colour: '#00ff00', alpha: HALF_ALPHA });
  });

  it('gives undefined for anything else', () => {
    expect(getParsedColour('bogus')).toBeUndefined();
    expect(getParsedColour('rgb(300,0,0)')).toBeUndefined();
    expect(getParsedColour('')).toBeUndefined();
  });
});
