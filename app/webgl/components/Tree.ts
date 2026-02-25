import * as THREE from "three";
import { Tree as TreeLib } from "~/webgl/lib/ez-tree";
import Config from "~/webgl/Config";
import PaneManager from "~/webgl/PaneManager";
// import { Portrait } from "~/webgl/lib/ez-tree/portrait";

export default class Tree {
  scene: THREE.Scene;
  instance!: TreeLib;
  paneManager!: PaneManager;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    const tree = new TreeLib();

    tree.options.copy(Config.tree as any);
    tree.generate();
    this.instance = tree;
    this.paneManager = new PaneManager(this.instance);

    tree.scale.set(0.2, 0.2, 0.2);
    tree.position.set(0, -5, 0);
    tree.rotation.y = Math.PI / 2;

    this.scene.add(tree);
    this.paneManager.initPane();

    this.instance.createBoxModels();
  }

  update(delta: number, rotation: THREE.Quaternion) {
    if (this.instance) {
      this.instance.updatePortraits(rotation);
      this.instance.animate();
    }
  }
}
