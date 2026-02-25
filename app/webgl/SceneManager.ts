import * as THREE from "three";
import Config from "./Config";
import Tree from "./components/Tree";
import BackgroundPlane from "./components/BackgroundPlane";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import { Portrait } from "./lib/ez-tree/portrait";
import { Portrait } from "./lib/ez-tree/portrait";

export default class SceneManager {
  canvas: HTMLCanvasElement;
  scene!: THREE.Scene;
  camera!: THREE.OrthographicCamera;
  renderer!: THREE.WebGLRenderer;
  timer: THREE.Timer;
  tree!: Tree;
  portrait!: Portrait;
  backgroundPlane!: BackgroundPlane;
  controls!: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.timer = new THREE.Timer();

    this.initScene();
    this.initCamera();
    this.initLights();
    this.initRenderer();
    this.initControls();
    this.initComponents();
    this.addEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100,
    );
    this.camera.position.z = 10;
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 5, 5);
    this.scene.add(directionalLight);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.target.set(0, 0, 0);
  }

  initComponents() {
    this.tree = new Tree(this.scene);
    this.portrait = new Portrait();
    // this.scene.add(this.portrait);
    this.backgroundPlane = new BackgroundPlane(this.scene);
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    this.camera.left = (-frustumSize * aspect) / 2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.backgroundPlane) {
      this.backgroundPlane.resize();
    }
  }

  animate() {
    const delta = this.timer.getDelta();
    // const time = this.timer.getElapsedTime()

    // if (this.backgroundPlane) this.backgroundPlane.update(delta)

    this.renderer.render(this.scene, this.camera);
    if (this.controls) this.controls.update();

    if (this.tree) this.tree.update(delta, this.camera.quaternion);
    this.portrait.animate(this.camera.quaternion);
    requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    window.removeEventListener("resize", this.onResize.bind(this));
    this.renderer.dispose();
  }
}
