import * as THREE from "three";
import { Text } from "troika-three-text";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let cachedModel: THREE.Group | null = null;
let loadPromise: Promise<THREE.Group> | null = null;

function loadFrameModel(): Promise<THREE.Group> {
  if (cachedModel) return Promise.resolve(cachedModel);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "/webgl/frame.glb",
      (gltf) => {
        cachedModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(cachedModel);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0.001) {
          const scale = 4.4 / maxDim;
          cachedModel.scale.setScalar(scale);
          cachedModel.rotation.x = Math.PI / 2;
        }

        box.setFromObject(cachedModel);
        const center = box.getCenter(new THREE.Vector3());
        cachedModel.position.sub(center);

        cachedModel.traverse((child) => {
          child.position.y += 0.4;

          if (child.name === "Plane056_1") {
            // child.position.y += 0.005;
            // child.rotation.y = Math.PI;
            // child.position.z = -maxDim / 2;
          }
          if (child instanceof THREE.Mesh) {
            child.position.y += 0.05;

            child.userData.isCachedModel = true;
            if (child.material) {
              // child.material.depthTest = false;
              // child.material.transparent = true;
              child.material.side = THREE.DoubleSide;
              // child.renderOrder = 1;
            }
          }
        });
        resolve(cachedModel);
      },
      undefined,
      reject,
    );
  });

  return loadPromise;
}

export class Portrait extends THREE.Group {
  textName!: Text;
  textSurname!: Text;
  textAge!: Text;
  textGender!: Text;
  modelInstance?: THREE.Group;

  constructor(
    name: string = "test",
    surname: string = "",
    age: number | string | null = null,
    image: string | null = null,
  ) {
    super();

    loadFrameModel().then((model) => {
      this.modelInstance = model.clone();

      if (image) {
        new THREE.TextureLoader().load(`${image}`, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.repeat.set(1, 1);
          texture.flipY = false;

          this.modelInstance?.traverse((child) => {
            if (child.name === "Plane056_1" && child instanceof THREE.Mesh) {
              child.material = new THREE.MeshBasicMaterial({
                map: texture,
                // transparent: true,
                // depthTest: false,
                side: THREE.DoubleSide,
              });
            }
          });
        });
      }

      this.add(this.modelInstance);
    });

    const textNameStr = `${name || ""} ${surname || ""}`.trim();
    this.textName = this.createText(
      textNameStr !== "" ? textNameStr : " ",
      0.55,
      "#000000",
      -0.65,
    );
    this.textAge = this.createText(
      age !== null && age !== undefined && age.toString().trim() !== ""
        ? age.toString()
        : " ",
      0.25,
      "#000000",
      0.0,
    );

    this.init();
  }

  private createText(
    content: string,
    fontSize: number,
    color: string,
    y: number,
  ): Text {
    const text = new Text();
    this.add(text);
    text.text = content;
    text.fontSize = fontSize;
    text.color = new THREE.Color(color);
    text.position.set(0, y, 5);
    text.font = "/fonts/Aktura-Regular.ttf";
    text.anchorX = "center";
    text.position.z += 2;
    text.position.y += 0.35;
    text.sync();
    return text;
  }

  init() {}

  animate(rotation: THREE.Quaternion) {
    this.quaternion.copy(rotation);
    this.updateMatrixWorld();
  }

  dispose() {
    if (this.modelInstance) {
      this.modelInstance.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.userData.isCachedModel) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        }
      });
      this.remove(this.modelInstance);
    }

    if (this.textName) {
      this.remove(this.textName);
      this.textName.dispose();
    }
    if (this.textSurname) {
      this.remove(this.textSurname);
      this.textSurname.dispose();
    }
    if (this.textAge) {
      this.remove(this.textAge);
      this.textAge.dispose();
    }
    if (this.textGender) {
      this.remove(this.textGender);
      this.textGender.dispose();
    }

    this.parent?.remove(this);
  }
}
