import * as THREE from 'three'

export default class Border {
  camera: THREE.OrthographicCamera
  meshTop!: THREE.Mesh
  meshBottom!: THREE.Mesh
  smallMeshTopTop!: THREE.Mesh
  smallMeshTopBottom!: THREE.Mesh
  smallMeshBottomTop!: THREE.Mesh
  smallMeshBottomBottom!: THREE.Mesh
  geometry!: THREE.PlaneGeometry
  material!: THREE.MeshBasicMaterial
  smallMaterial!: THREE.MeshBasicMaterial
  zOffset: number

  constructor(camera: THREE.OrthographicCamera, zOffset: number = -5) {
    this.camera = camera
    this.zOffset = zOffset
    this.init()
  }

  init() {
    this.geometry = new THREE.PlaneGeometry(2, 0.90) 
    this.material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide, depthTest: false, transparent: true })

    this.smallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, depthTest: false, transparent: true })
    
    this.meshTop = new THREE.Mesh(this.geometry, this.material)
    this.meshTop.position.z = this.zOffset
    this.meshTop.renderOrder = 1000
    this.camera.add(this.meshTop)

    this.meshBottom = new THREE.Mesh(this.geometry, this.material)
    this.meshBottom.position.z = this.zOffset
    this.meshBottom.renderOrder = 1000
    this.camera.add(this.meshBottom)


    // small borders
    this.smallMeshTopTop = new THREE.Mesh(this.geometry, this.smallMaterial)
    this.smallMeshTopTop.position.z = this.zOffset
    this.camera.add(this.smallMeshTopTop)

    this.smallMeshTopBottom = new THREE.Mesh(this.geometry, this.smallMaterial)
    this.smallMeshTopBottom.position.z = this.zOffset
    this.camera.add(this.smallMeshTopBottom)

    this.smallMeshBottomTop = new THREE.Mesh(this.geometry, this.smallMaterial)
    this.smallMeshBottomTop.position.z = this.zOffset
    this.camera.add(this.smallMeshBottomTop)

    this.smallMeshBottomBottom = new THREE.Mesh(this.geometry, this.smallMaterial)
    this.smallMeshBottomBottom.position.z = this.zOffset
    this.camera.add(this.smallMeshBottomBottom)
    
    this.resize()
  }

  resize() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10
      
    const worldWidth = frustumSize * aspect
    const scaleX = worldWidth / 2 // div par 2 car la géométrie est de base de largeur 2
    
    this.meshTop.scale.set(scaleX, 1, 1)
    this.meshBottom.scale.set(scaleX, 1, 1)

    const cameraTop = frustumSize / 2           // 5
    const cameraBottom = -frustumSize / 2       // -5
    
    const actualHeight = 0.9 

    this.meshTop.position.y = cameraTop - (actualHeight / 2)
    this.meshBottom.position.y = cameraBottom + (actualHeight / 2)
  }
}