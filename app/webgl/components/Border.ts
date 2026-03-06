import * as THREE from "three";
import { Text } from "troika-three-text";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default class Border {
  hudCamera: THREE.OrthographicCamera;
  mainCamera: THREE.OrthographicCamera;
  meshTop!: THREE.Mesh;
  textTop!: Text;
  meshBottom!: THREE.Mesh;

  smallMeshTopTop!: THREE.Mesh;
  smallMeshTopBottom!: THREE.Mesh;
  smallMeshBottomTop!: THREE.Mesh;
  smallMeshBottomBottom!: THREE.Mesh;
  geometry!: THREE.PlaneGeometry;
  smallGeometry!: THREE.PlaneGeometry;
  material!: THREE.MeshBasicMaterial;
  smallMaterial!: THREE.MeshBasicMaterial;
  smallMaterial2!: THREE.MeshBasicMaterial;
  patternTexture!: THREE.Texture;
  patternTexture2!: THREE.Texture;
  buttonsContainer!: CSS2DObject;
  controls: OrbitControls;
  zOffset: number;
  familyName: string;

  constructor(
    hudCamera: THREE.OrthographicCamera,
    mainCamera: THREE.OrthographicCamera,
    controls: OrbitControls,
    zOffset: number = -5,
    familyName: string,
  ) {
    this.hudCamera = hudCamera;
    this.mainCamera = mainCamera;
    this.controls = controls;
    this.zOffset = zOffset;
    this.familyName = familyName;
    this.init();
  }

  init() {
    this.geometry = new THREE.PlaneGeometry(2, 0.9);
    this.smallGeometry = new THREE.PlaneGeometry(2, 0.2);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xedd8be,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });

    const textureLoader = new THREE.TextureLoader();
    this.patternTexture = textureLoader.load("/webgl/pattern.svg");
    this.patternTexture.wrapS = THREE.RepeatWrapping;
    this.patternTexture.wrapT = THREE.RepeatWrapping;
    this.patternTexture.colorSpace = THREE.SRGBColorSpace;
    this.patternTexture.repeat.set(1, 1);
    this.patternTexture2 = textureLoader.load("/webgl/pattern.svg");
    this.patternTexture2.wrapS = THREE.RepeatWrapping;
    this.patternTexture2.wrapT = THREE.RepeatWrapping;
    this.patternTexture2.colorSpace = THREE.SRGBColorSpace;
    this.patternTexture2.repeat.set(1, 1);
    this.smallMaterial = new THREE.MeshBasicMaterial({
      map: this.patternTexture,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });
    this.smallMaterial2 = new THREE.MeshBasicMaterial({
      map: this.patternTexture2,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });

    this.meshTop = new THREE.Mesh(this.geometry, this.material);
    this.meshTop.position.z = this.zOffset;
    this.meshTop.renderOrder = 1000;
    this.hudCamera.add(this.meshTop);

    this.meshBottom = new THREE.Mesh(this.geometry, this.material);
    this.meshBottom.position.z = this.zOffset;
    this.meshBottom.renderOrder = 1000;
    this.hudCamera.add(this.meshBottom);

    // small borders
    this.smallMeshTopTop = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial2,
    );
    this.smallMeshTopTop.position.z = this.zOffset;
    this.smallMeshTopTop.renderOrder = 1001;
    this.hudCamera.add(this.smallMeshTopTop);

    this.smallMeshTopBottom = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshTopBottom.position.z = this.zOffset;
    this.smallMeshTopBottom.renderOrder = 1001;
    this.hudCamera.add(this.smallMeshTopBottom);

    this.smallMeshBottomTop = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshBottomTop.position.z = this.zOffset;
    this.smallMeshBottomTop.renderOrder = 1001;
    this.hudCamera.add(this.smallMeshBottomTop);

    this.smallMeshBottomBottom = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial2,
    );
    this.smallMeshBottomBottom.position.z = this.zOffset;
    this.smallMeshBottomBottom.renderOrder = 1001;
    this.hudCamera.add(this.smallMeshBottomBottom);

    this.textTop = new Text();
    this.textTop.text = `La famille ${this.familyName}`;
    this.textTop.fontSize = 0.5;
    this.textTop.color = new THREE.Color(0x7c2d12);
    this.textTop.font = "/fonts/Aktura-Regular.ttf";
    this.textTop.anchorX = "center";
    this.textTop.anchorY = "middle";
    this.textTop.renderOrder = 1002;
    this.hudCamera.add(this.textTop);

    this.textTop.material.depthTest = false;

    this.textTop.sync();

    this.initButtons();

    this.resize();
  }

  initButtons() {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.display = "flex";
    buttonsDiv.style.gap = "16px";
    buttonsDiv.style.pointerEvents = "auto";

    const btnFlex = document.createElement("div");
    btnFlex.style.display = "grid";
    btnFlex.style.gridTemplateColumns = "1fr 1fr";
    btnFlex.style.columnGap = "4px";
    btnFlex.style.rowGap = "8px";
    btnFlex.style.pointerEvents = "auto";
    btnFlex.style.width = "fit-content";
    btnFlex.style.transform = "translateX(-50%)";
    btnFlex.style.marginRight = "20px";

    buttonsDiv.appendChild(btnFlex);

    const svgPlus = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M152,112a8,8,0,0,1-8,8H120v24a8,8,0,0,1-16,0V120H80a8,8,0,0,1,0-16h24V80a8,8,0,0,1,16,0v24h24A8,8,0,0,1,152,112Zm77.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88.11,88.11,0,1,1,11.31-11.31l50.07,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"></path></svg>`;
    const svgMinus = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M152,112a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h64A8,8,0,0,1,152,112Zm77.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88.11,88.11,0,1,1,11.31-11.31l50.07,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"></path></svg>`;
    const svgUp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Zm-42.34-77.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z"></path></svg>`;
    const svgDown = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208ZM90.34,125.66a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,107.31V168a8,8,0,0,1-16,0V107.31l-18.34,18.35A8,8,0,0,1,90.34,125.66Z"></path></svg>`;

    const createBtn = (svg: string) => {
      const btn = document.createElement("button");
      btn.innerHTML = svg;
      btn.style.background = "#edd8be";
      btn.style.borderRadius = "50%";
      btn.style.width = "40px";
      btn.style.height = "40px";
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.cursor = "pointer";
      btn.style.transition = "transform 0.1s";
      btn.onmousedown = () => (btn.style.transform = "scale(0.98)");
      btn.onmouseup = () => (btn.style.transform = "scale(1)");
      btn.onmouseleave = () => (btn.style.transform = "scale(1)");
      return btn;
    };

    const btnPlusEl = createBtn(svgPlus);
    const btnMinusEl = createBtn(svgMinus);

    const btnUpEl = createBtn(svgUp);
    const btnDownEl = createBtn(svgDown);

    btnPlusEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.mainCamera.zoom = Math.min(this.mainCamera.zoom + 0.2, 1.5);
      this.mainCamera.updateProjectionMatrix();
    });

    btnMinusEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.mainCamera.zoom = Math.max(this.mainCamera.zoom - 0.2, 0.2);
      this.mainCamera.updateProjectionMatrix();
    });

    btnUpEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.mainCamera.position.y -= 1;
      this.controls.target.y -= 1;
      this.mainCamera.updateProjectionMatrix();
    });

    btnDownEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.mainCamera.position.y += 1;
      this.controls.target.y += 1;
      this.mainCamera.updateProjectionMatrix();
    });

    btnFlex.appendChild(btnPlusEl);
    btnFlex.appendChild(btnMinusEl);
    btnFlex.appendChild(btnDownEl);
    btnFlex.appendChild(btnUpEl);

    this.buttonsContainer = new CSS2DObject(buttonsDiv);
    this.hudCamera.add(this.buttonsContainer);
  }

  resize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    const worldWidth = frustumSize * aspect;
    const scaleX = worldWidth / 2; // div par 2 car la géométrie est de base de largeur 2

    this.meshTop.scale.set(scaleX, 1, 1);
    this.meshBottom.scale.set(scaleX, 1, 1);

    this.smallMeshTopTop.scale.set(scaleX, 1, 1);
    this.smallMeshTopBottom.scale.set(scaleX, 1, 1);
    this.smallMeshBottomTop.scale.set(scaleX, 1, 1);
    this.smallMeshBottomBottom.scale.set(scaleX, 1, 1);

    const cameraTop = frustumSize / 2; // 5
    const cameraBottom = -frustumSize / 2; // -5

    const actualHeight = 0.9;
    const smallHeight = 0.2;

    this.meshTop.position.y = cameraTop - actualHeight / 2;
    this.meshBottom.position.y = cameraBottom + actualHeight / 2;

    if (this.textTop) {
      this.textTop.position.y = this.meshTop.position.y - 0.03;
      this.textTop.position.z = this.zOffset;
      this.textTop.sync();
    }

    this.smallMeshTopTop.position.y = cameraTop - smallHeight / 2;
    this.smallMeshTopBottom.position.y =
      cameraTop - actualHeight + smallHeight / 2;

    this.smallMeshBottomTop.position.y =
      cameraBottom + actualHeight - smallHeight / 2;
    this.smallMeshBottomBottom.position.y = cameraBottom + smallHeight / 2;

    if (this.buttonsContainer) {
      this.buttonsContainer.position.set(
        worldWidth / 2,
        0,
        this.zOffset,
      );
    }

    const imageWidth = 1050;
    const imageHeight = 612;
    const imageAspect = imageWidth / imageHeight;

    const meshRealWidth = 2 * scaleX;
    const meshRealHeight = 0.2;
    const meshAspect = meshRealWidth / meshRealHeight;
    const repeatX = meshAspect / imageAspect;

    if (this.patternTexture) {
      this.patternTexture.repeat.set(repeatX, 1);
      this.patternTexture.wrapT = THREE.ClampToEdgeWrapping;
    }

    if (this.patternTexture2) {
      this.patternTexture2.repeat.set(repeatX, 1);
      this.patternTexture2.wrapT = THREE.ClampToEdgeWrapping;
    }
  }

  animate() {
    this.patternTexture.offset.x += 0.001;
    this.patternTexture2.offset.x -= 0.001;
  }

  updateFamilyName(familyName: string) {
    this.familyName = familyName;
    if (this.textTop) {
      this.textTop.text = `La famille ${this.familyName}`;
      this.textTop.sync();
    }
  }
}
