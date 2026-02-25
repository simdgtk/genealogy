import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB";

// import { type Quaternion } from "three";

export class Portrait extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });
    super(geometry, material);
    this.init();
  }

  init() {
    // this.geometry.computeBoundingBox();
    // this.userData.obb = new OBB().fromBox3(this.geometry.boundingBox);
  }

  animate(rotation) {
    this.quaternion.copy(rotation);
    this.updateMatrixWorld();

    // this.userData.obb.fromBox3(this.geometry.boundingBox);
    // this.userData.obb.applyMatrix4(this.matrixWorld);
  }
}
