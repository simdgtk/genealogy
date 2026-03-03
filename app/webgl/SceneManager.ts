import * as THREE from "three";
import Tree from "./components/Tree";
import Border from "./components/Border";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { Portrait } from "./lib/ez-tree/portrait";

export default class SceneManager {
  canvas: HTMLCanvasElement;
  scene!: THREE.Scene;
  camera!: THREE.OrthographicCamera;
  renderer!: THREE.WebGLRenderer;
  cssRenderer!: CSS2DRenderer;
  timer: THREE.Timer;
  tree!: Tree;
  portrait!: Portrait;
  border!: Border;
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
    this.scene.add(this.camera);
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

    this.cssRenderer = new CSS2DRenderer();
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    this.cssRenderer.domElement.style.position = "absolute";
    this.cssRenderer.domElement.style.top = "0px";
    this.cssRenderer.domElement.style.pointerEvents = "none";

    if (this.canvas.parentElement) {
      this.canvas.parentElement.appendChild(this.cssRenderer.domElement);
    } else {
      document.body.appendChild(this.cssRenderer.domElement);
    }
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI / 2;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target.set(0, 0, 0);
  }

  initComponents() {
    this.tree = new Tree(this.scene);
    // this.portrait = new Portrait();
    // this.scene.add(this.portrait);
    this.border = new Border(this.camera, -1); // car caméra orthographique, frustumSize / 2
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
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);

    if (this.border) {
      this.border.resize();
    }
  }

  animate() {
    const delta = this.timer.getDelta();

    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.scene, this.camera);
    if (this.controls) this.controls.update();

    if (this.tree) this.tree.update(delta, this.camera.quaternion);
    if (this.portrait) this.portrait.animate(this.camera.quaternion);
    if (this.animate) requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    window.removeEventListener("resize", this.onResize.bind(this));
    this.renderer.dispose();
    if (this.cssRenderer.domElement.parentElement) {
      this.cssRenderer.domElement.parentElement.removeChild(
        this.cssRenderer.domElement,
      );
    }
  }
}
