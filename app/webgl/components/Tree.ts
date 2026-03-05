import * as THREE from "three";
import { Tree as TreeLib } from "~/webgl/lib/ez-tree";
import Config, { getTreeConfig } from "~/webgl/Config";
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

    this.instance.scale.set(0.2, 0.2, 0.2);
    this.instance.position.set(0, -4.8, 0);
    this.instance.rotation.y = Math.PI / 2;

    this.scene.add(this.instance);
  }

  setPersons(persons: any[]) {
    if (this.instance) {
      this.scene.remove(this.instance);
      this.instance.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.userData.isCachedModel) {
            if (child.geometry) child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }

    const newConfig = getTreeConfig(persons);
    const tree = new TreeLib();
    tree.options.copy(newConfig as any);
    tree.generate();
    this.instance = tree;

    this.instance.scale.set(0.3, 0.3, 0.3);
    this.instance.position.set(0, -4.8, 0);
    this.instance.rotation.y = Math.PI / 2;

    this.scene.add(this.instance);
  }

  update(delta: number, rotation: THREE.Quaternion) {
    if (this.instance) {
      this.instance.animate();
      this.instance.updatePortraits(rotation);
    }
  }
}
