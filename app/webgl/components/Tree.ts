import * as THREE from "three";
import { Tree as TreeLib } from "~/webgl/lib/ez-tree";
import Config from "~/webgl/Config";

export default class Tree {
  scene: THREE.Scene;
  instance!: TreeLib;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    const tree = new TreeLib();

    tree.options.copy(Config.tree as any);
    tree.generate();
    this.instance = tree;

    tree.scale.set(0.3, 0.3, 0.3);
    tree.position.set(0, -5, 0);

    this.scene.add(tree);
  }

  update(delta: number) {
    // this.instance.rotation.x += delta * 0.5;
    // this.instance.rotation.y += delta * 0.5;
  }
}
