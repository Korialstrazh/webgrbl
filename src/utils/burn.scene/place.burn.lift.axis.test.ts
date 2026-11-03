import { BoxGeometry, BufferGeometry, Group, Mesh } from 'three';
import { placeBurnLiftAxis } from './place.burn.lift.axis';

const BOX_SIDE_MM = 2;

describe(placeBurnLiftAxis.name, () => {
  it('stands on top of the middle of the mesh', () => {
    const liftAxis: Group = new Group();

    placeBurnLiftAxis(liftAxis, new Mesh(new BoxGeometry(BOX_SIDE_MM, BOX_SIDE_MM, BOX_SIDE_MM)));

    expect(liftAxis.visible).toBe(true);
    expect(liftAxis.position.z).toBe(BOX_SIDE_MM / 2);
    expect(liftAxis.position.x).toBe(0);
  });

  it('hides without a mesh, and for a mesh with an empty box', () => {
    const liftAxis: Group = new Group();

    placeBurnLiftAxis(liftAxis, undefined);
    expect(liftAxis.visible).toBe(false);

    liftAxis.visible = true;
    placeBurnLiftAxis(liftAxis, new Mesh(new BufferGeometry()));
    expect(liftAxis.visible).toBe(false);
  });
});
