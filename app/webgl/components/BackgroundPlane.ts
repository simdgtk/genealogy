import * as THREE from 'three'

export default class BackgroundPlane {
  scene: THREE.Scene
  mesh!: THREE.Mesh
  geometry!: THREE.PlaneGeometry
  material!: THREE.MeshBasicMaterial

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.init()
  }

  init() {
    // Base geometry with 2:1 aspect ratio
    this.geometry = new THREE.PlaneGeometry(2, 1) 
    this.material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    
    // Position it behind the cube
    this.mesh.position.z = -5
    
    this.scene.add(this.mesh)
    this.resize()
  }


  resize() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10 // Must match Camera frustum size in SceneManager
      
    const worldWidth = frustumSize * aspect
      
    // Scale to match the width of the screen in world units
    // Since geometry width is 2, we scale by worldWidth / 2
    const scale = worldWidth / 2
    this.mesh.scale.set(scale, scale, 1)
  }
}
