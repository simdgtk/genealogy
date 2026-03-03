import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";

export class Portrait extends THREE.Mesh {
  css2dObjects: any[] = [];
  constructor(name = "test", surname = "", age = null, gender = "") {
    const geometry = new THREE.PlaneGeometry(3, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });

    // material.opacity = 0;

    super(geometry, material);

    this.css2dObjects = [];

    const portraitInfos = document.createElement("div");
    portraitInfos.style.position = "absolute";
    portraitInfos.style.display = "flex";
    portraitInfos.style.flexDirection = "column";
    portraitInfos.style.alignItems = "center";
    portraitInfos.style.width = "fit-content";
    portraitInfos.style.pointerEvents = "all"; // Allow interaction if needed
    this.css2dObjects.push(portraitInfos);

    const portraitContainer = document.createElement("div");
    portraitContainer.style.position = "absolute";
    portraitContainer.style.display = "flex";
    portraitContainer.style.flexDirection = "column";
    portraitContainer.style.width = "fit-content";
    portraitContainer.style.transform = "translateX(-100%)";
    this.css2dObjects.push(portraitContainer);

    const portraitName = document.createElement("div");
    if (name !== "" || surname !== "")
      portraitName.textContent = `${name} ${surname}`;
    portraitContainer.appendChild(portraitName);
    this.css2dObjects.push(portraitName);

    const portraitAge = document.createElement("div");
    if (age !== null) portraitAge.textContent = `${age}`;
    portraitContainer.appendChild(portraitAge);
    this.css2dObjects.push(portraitAge);

    const portraitGender = document.createElement("div");
    if (gender !== "") portraitGender.textContent = `${gender}`;
    portraitContainer.appendChild(portraitGender);
    this.css2dObjects.push(portraitGender);

    portraitInfos.appendChild(portraitContainer);

    const css2DObject = new CSS2DObject(portraitInfos);

    css2DObject.position.set(1, 1, 1);

    this.add(css2DObject);

    this.init();
  }

  init() {}

  animate(rotation: THREE.Quaternion) {
    this.quaternion.copy(rotation);
    this.updateMatrixWorld();
  }

  dispose() {
    this.geometry.dispose();
    if (this.material instanceof THREE.Material) {
      this.material.dispose();
    } else if (Array.isArray(this.material)) {
      this.material.forEach((m) => m.dispose());
    }

    this.children.forEach((child) => {
      if (child instanceof CSS2DObject) {
        child.element.remove();
      }
    });

    this.parent?.remove(this);
  }
}
