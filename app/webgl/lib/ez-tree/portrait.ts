import * as THREE from "three";
import { Text } from "troika-three-text";

export class Portrait extends THREE.Mesh {
  textName!: Text;
  textSurname!: Text;
  textAge!: Text;
  textGender!: Text;

  constructor(
    name: string = "test",
    surname: string = "",
    age: number | string | null = null,
    gender: string = "",
  ) {
    const shape = new THREE.Shape();
    const smallShape = new THREE.Shape();
    const smallShape1 = new THREE.Shape();
    // const smallShape
    const segments = 64;
    const rayonX = 1.9;
    const rayonY = 2.2;
    shape.ellipse(0, 0, rayonX, rayonY, 0, Math.PI * 2, false, 0);
    const geometry = new THREE.ShapeGeometry(shape, segments);
    smallShape.ellipse(0, 0, rayonX, rayonY, 0, Math.PI * 2, false, 0);
    const smallGeometry = new THREE.ShapeGeometry(smallShape, segments);
    smallShape1.ellipse(0, 0, rayonX, rayonY, 0, Math.PI * 2, false, 0);
    const smallGeometry1 = new THREE.ShapeGeometry(smallShape1, segments);
    const smallGeometry2 = new THREE.ShapeGeometry(smallShape1, segments);
    const material = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const materialSmall = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const smallCircle = new THREE.Mesh(smallGeometry, materialSmall);
    smallCircle.position.set(0, 0, 0.1);
    smallCircle.scale.set(0.98, 0.98, 0.98);

    const smallCircle1 = new THREE.Mesh(smallGeometry1, material);
    smallCircle1.position.set(0, 0, 0.2);
    smallCircle1.scale.set(0.92, 0.92, 0.92);

    const base = new THREE.Mesh(geometry, baseMaterial);
    base.position.set(0, 0, 0.3);
    base.scale.set(0.75, 0.75, 0.75);

    super(geometry, material);
    this.add(smallCircle);
    this.add(smallCircle1);
    this.add(base);

    this.textName = this.createText(`${name} ${surname}`, 0.8, "#000000", 0.8);
    this.textAge = this.createText(
      age !== null && age !== undefined ? age.toString() : "",
      0.25,
      "#000000",
      0.0,
    );
    // this.textGender = this.createText(gender, 0.25, "#666666", -0.3);

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
    text.position.set(0, y, 1);
    text.font = "/fonts/Aktura-Regular.ttf";
    text.anchorX = "center";
    text.material.transparent = true;
    text.renderOrder = 1;
    text.sync();
    return text;
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

    this.remove(this.textName);
    this.remove(this.textSurname);
    this.remove(this.textAge);
    this.remove(this.textGender);

    this.textName.dispose();
    this.textSurname.dispose();
    this.textAge.dispose();
    this.textGender.dispose();

    this.parent?.remove(this);
  }
}
