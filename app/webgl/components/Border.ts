import * as THREE from "three";
import { Text } from "troika-three-text";

export default class Border {
  camera: THREE.OrthographicCamera;
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
  zOffset: number;

  constructor(camera: THREE.OrthographicCamera, zOffset: number = -5) {
    this.camera = camera;
    this.zOffset = zOffset;
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

    // this.smallMaterial = new THREE.MeshBasicMaterial({
    //   color: 0xffffff,
    //   side: THREE.DoubleSide,
    //   depthTest: false,
    //   transparent: true,
    //   opacity: 0.5,
    // });

    // repeating texture
    const textureLoader = new THREE.TextureLoader();
    const patternTexture = textureLoader.load("/webgl/pattern.svg");
    patternTexture.wrapS = THREE.RepeatWrapping;
    patternTexture.wrapT = THREE.RepeatWrapping;
    patternTexture.colorSpace = THREE.SRGBColorSpace;
    patternTexture.repeat.set(1, 1);
    this.smallMaterial = new THREE.MeshBasicMaterial({
      map: patternTexture,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
    });
    // this.smallMaterial = new THREE.

    this.meshTop = new THREE.Mesh(this.geometry, this.material);
    this.meshTop.position.z = this.zOffset;
    this.meshTop.renderOrder = 1000;
    this.camera.add(this.meshTop);

    this.meshBottom = new THREE.Mesh(this.geometry, this.material);
    this.meshBottom.position.z = this.zOffset;
    this.meshBottom.renderOrder = 1000;
    this.camera.add(this.meshBottom);

    // small borders
    this.smallMeshTopTop = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshTopTop.position.z = this.zOffset;
    this.smallMeshTopTop.renderOrder = 1001;
    this.camera.add(this.smallMeshTopTop);

    this.smallMeshTopBottom = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshTopBottom.position.z = this.zOffset;
    this.smallMeshTopBottom.renderOrder = 1001;
    this.camera.add(this.smallMeshTopBottom);

    this.smallMeshBottomTop = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshBottomTop.position.z = this.zOffset;
    this.smallMeshBottomTop.renderOrder = 1001;
    this.camera.add(this.smallMeshBottomTop);

    this.smallMeshBottomBottom = new THREE.Mesh(
      this.smallGeometry,
      this.smallMaterial,
    );
    this.smallMeshBottomBottom.position.z = this.zOffset;
    this.smallMeshBottomBottom.renderOrder = 1001;
    this.camera.add(this.smallMeshBottomBottom);

    this.textTop = new Text();
    this.textTop.text = "La famille Daguet";
    this.textTop.fontSize = 0.5;
    this.textTop.color = new THREE.Color(0x7c2d12);
    this.textTop.font = "/fonts/Aktura-Regular.ttf";
    this.textTop.anchorX = "center";
    this.textTop.anchorY = "middle";
    this.textTop.renderOrder = 1002;
    this.camera.add(this.textTop);

    this.textTop.material.depthTest = false;

    this.textTop.sync();

    this.resize();
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

    if (this.smallMaterial.map) {
      const texture = this.smallMaterial.map;

      const imageWidth = 1050;
      const imageHeight = 612;
      const imageAspect = imageWidth / imageHeight;

      const meshRealWidth = 2 * scaleX;
      const meshRealHeight = 0.2;
      const meshAspect = meshRealWidth / meshRealHeight;

      texture.repeat.set(meshAspect / imageAspect, 1);

      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }
}
