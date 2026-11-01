import { hasRemoteStyleReference } from './has.remote.style.reference';

describe(hasRemoteStyleReference.name, () => {
  it('flags @import and remote url()', () => {
    expect(hasRemoteStyleReference('@import "a.css";')).toBe(true);
    expect(hasRemoteStyleReference('a { fill: url(https://x.test/a.png) }')).toBe(true);
    expect(hasRemoteStyleReference("a { fill: url( 'x.png' ) }")).toBe(true);
  });

  it('allows data: and same-document url()', () => {
    expect(hasRemoteStyleReference('a { fill: url(#g) }')).toBe(false);
    expect(hasRemoteStyleReference('a { fill: url( "#g" ) }')).toBe(false);
    expect(hasRemoteStyleReference('a { fill: url(data:image/png;base64,AAAA) }')).toBe(false);
    expect(hasRemoteStyleReference('a { fill: red }')).toBe(false);
  });

  it('flags css escapes and image functions', () => {
    expect(hasRemoteStyleReference('a { fill: u\\72l(x) }')).toBe(true);
    expect(hasRemoteStyleReference('@im\\port "x";')).toBe(true);
    expect(hasRemoteStyleReference('a { fill: image-set("x" 1x) }')).toBe(true);
    expect(hasRemoteStyleReference('a { fill: -webkit-image-set("x" 1x) }')).toBe(true);
    expect(hasRemoteStyleReference('a { fill: image("x") }')).toBe(true);
    expect(hasRemoteStyleReference('a { fill: src("x") }')).toBe(true);
  });
});
