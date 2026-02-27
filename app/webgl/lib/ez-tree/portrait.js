import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";

export class Portrait extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(3, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });

    material.opacity = 0.7;

    super(geometry, material);

    const portraitInfos = document.createElement("div");
    portraitInfos.style.display = "flex";
    portraitInfos.style.flexDirection = "column";
    portraitInfos.style.alignItems = "center";

    const portraitName = document.createElement("div");
    portraitName.textContent = "Portrait";
    portraitInfos.appendChild(portraitName);

    const portraitAge = document.createElement("div");
    portraitAge.textContent = "Age";
    portraitInfos.appendChild(portraitAge);

    const portraitGender = document.createElement("div");
    portraitGender.textContent = "Gender";
    portraitInfos.appendChild(portraitGender);

    const css2DObject = new CSS2DObject(portraitInfos);

    css2DObject.position.set(1, 1, 1);

    this.add(css2DObject);

    this.init();
  }

  init() {}

  animate(rotation) {
    this.quaternion.copy(rotation);
    this.updateMatrixWorld();
  }
}
