import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB";
import RNG from "./rng";
import { Branch } from "./branch";
import { Billboard, TreeType } from "./enums";
import TreeOptions from "./options";
import { loadPreset } from "./presets/index";
import { getBarkTexture, getLeafTexture } from "./textures";
import { Trellis } from "./trellis";
// import { Portrait } from "./Portrait.ts";
import { Portrait } from "./portrait";

export class Tree extends THREE.Group {
  /**
   * @type {RNG}
   */
  rng;

  /**
   * @type {TreeOptions}
   */
  options;

  /**
   * @type {Branch[]}
   */
  branchQueue = [];

  /**
   * Helper to create a simple gradient texture for Toon shading
   */
  getGradientTexture() {
    // 3 tones: Shadow, Midtone, Highlight
    const colors = new Uint8Array([
      64,
      64,
      64,
      255, // Dark
      128,
      128,
      128,
      255, // Mid
      255,
      255,
      255,
      255, // Light
    ]);

    const gradientMap = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
    return gradientMap;
  }

  /**
   * @param {TreeOptions} params
   */
  constructor(options = new TreeOptions()) {
    super();
    // this.portrait = new Portrait();
    this.name = "Tree";
    this.branchesMesh = new THREE.Mesh();
    this.leavesMesh = new THREE.Mesh();
    this.trellisMesh = null;
    this.add(this.branchesMesh);
    this.add(this.leavesMesh);
    this.options = options;
    this.portraits = [];
  }

  // ... (existing update, loadPreset, loadFromJson methods)

  /**
   * Generate a new tree
   */
  generate() {
    // Clean up old geometry
    this.branches = {
      verts: [],
      normals: [],
      indices: [],
      uvs: [],
      windFactor: [],
    };

    this.leaves = {
      verts: [],
      normals: [],
      indices: [],
      uvs: [],
    };

    this.allBranches = [];

    // Clean up old portraits
    if (this.portraits) {
      this.portraits.forEach((p) => {
        if (p.dispose) {
          p.dispose();
        } else {
          this.remove(p);
          p.geometry.dispose();
          p.material.dispose();
        }
      });
    }
    this.portraits = [];

    this.rng = new RNG(this.options.seed);

    this.branchQueue = [];

    // Create the trunk of the tree first
    this.branchQueue.push(
      new Branch(
        new THREE.Vector3(),
        new THREE.Euler(),
        this.options.branch.length[0],
        this.options.branch.radius[0],
        0,
        this.options.branch.sections[0],
        this.options.branch.segments[0],
        [],
      ),
    );

    while (this.branchQueue.length > 0) {
      const branch = this.branchQueue.shift();
      this.generateBranch(branch);
    }

    this.createBranchesGeometry();
    this.createLeavesGeometry();
    this.createTrellis();
    this.createBoxModels();
  }

  /**
   * Generates a new branch
   * @param {Branch} branch
   * @returns
   */
  generateBranch(branch) {
    // Used later for geometry index generation
    const indexOffset = this.branches.verts.length / 3;

    let sectionOrientation = branch.orientation.clone();
    let sectionOrigin = branch.origin.clone();

    // créer un cube à l'origine de la branche
    // const portrait = new Portrait();

    // portrait.userData.obb = new OBB();
    let color = 0xffffff;
    switch (branch.level) {
      case 0:
        color = 0xff0000;
        break;
      case 1:
        color = 0x00ff00;
        break;
      case 2:
        color = 0x0000ff;
        break;
      case 3:
        color = 0xffff00;
        break;
      case 4:
        color = 0xff00ff;
        break;
      case 5:
        color = 0x00ffff;
        break;
    }
    // portrait.material.color.setHex(color);
    // portrait.position.copy(sectionOrigin);
    // this.add(portrait);
    // this.portraits.push(portrait);

    let sectionLength =
      branch.length /
      branch.sectionCount /
      (this.options.type === TreeType.Deciduous
        ? this.options.branch.levels - 1
        : 1);

    // This information is used for generating child branches after the branch
    // geometry has been constructed
    let sections = [];

    for (let i = 0; i <= branch.sectionCount; i++) {
      let sectionRadius = branch.radius;

      // If final section of final level, set radius to effecively zero
      if (
        i === branch.sectionCount &&
        branch.level === this.options.branch.levels
      ) {
        sectionRadius = 0.001;
      } else if (this.options.type === TreeType.Deciduous) {
        sectionRadius *=
          1 -
          this.options.branch.taper[branch.level] * (i / branch.sectionCount);
      } else if (this.options.type === TreeType.Evergreen) {
        // Evergreens do not have a terminal branch so they have a taper of 1
        sectionRadius *= 1 - i / branch.sectionCount;
      }

      // Clamp sectionRadius to avoid Infinity/NaN errors in quaternion rotations
      sectionRadius = Math.max(0.0001, sectionRadius);

      // Create the segments that make up this section.
      let first;
      // window.console.log(branch.segmentCount);
      for (let j = 0; j < branch.segmentCount; j++) {
        let angle = (2.0 * Math.PI * j) / branch.segmentCount;
        // let angle = 0;

        // Create the segment vertex
        const vertex = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))
          .multiplyScalar(sectionRadius)
          .applyEuler(sectionOrientation)
          .add(sectionOrigin);

        const normal = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))
          .applyEuler(sectionOrientation)
          .normalize();

        const uv = new THREE.Vector2(
          j / branch.segmentCount,
          i % 2 === 0 ? 0 : 1,
        );

        this.branches.verts.push(...Object.values(vertex));
        this.branches.normals.push(...Object.values(normal));
        this.branches.uvs.push(...Object.values(uv));

        if (j === 0) {
          first = { vertex, normal, uv };
        }
      }

      // Duplicate the first vertex so there is continuity in the UV mapping
      this.branches.verts.push(...Object.values(first.vertex));
      this.branches.normals.push(...Object.values(first.normal));
      this.branches.uvs.push(1, first.uv.y);

      // Use this information later on when generating child branches
      sections.push({
        origin: sectionOrigin.clone(),
        orientation: sectionOrientation.clone(),
        radius: sectionRadius,
      });

      sectionOrigin.add(
        new THREE.Vector3(0, sectionLength, 0).applyEuler(sectionOrientation),
      );

      // Perturb the orientation of the next section randomly. The higher the
      // gnarliness, the larger potential perturbation
      const gnarliness =
        Math.max(1, 1 / Math.sqrt(1)) *
        this.options.branch.gnarliness[branch.level];

      sectionOrientation.x += this.rng.random(gnarliness, -gnarliness);
      // sectionOrientation.x += this.rng.random(gnarliness);

      // Apply growth force to the branch
      const qSection = new THREE.Quaternion().setFromEuler(sectionOrientation);

      const qTwist = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.options.branch.twist[branch.level],
      );

      const qForce = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().copy(this.options.branch.force.direction),
      );

      qSection.multiply(qTwist);
      qSection.rotateTowards(
        qForce,
        this.options.branch.force.strength / sectionRadius,
      );

      // Apply trellis force if enabled
      if (this.options.trellis.enabled) {
        const trellisResult = this.calculateTrellisForce(
          sectionOrigin,
          sectionRadius,
        );
        if (trellisResult) {
          const qTrellis = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            trellisResult.direction,
          );
          qSection.rotateTowards(qTrellis, trellisResult.strength);
        }
      }

      sectionOrientation.setFromQuaternion(qSection);
    }

    this.generateBranchIndices(indexOffset, branch);

    // Portrait à la fin de la section de la branche.
    // On ne crée le portrait que pour le premier segment d'une personne (pas les prolongements -1)
    const isContinuation =
      branch.path.length > 0 && branch.path[branch.path.length - 1] === -1;
    const metadataFetcher = this.options.branch.getMetadata;
    const metadata =
      metadataFetcher && !isContinuation ? metadataFetcher(branch.path) : null;

    if (metadata) {
      const portrait = new Portrait(
        metadata.name,
        metadata.surname,
        null,
        metadata.gender,
      );

      const positionOrigin =
        sections.length > 0
          ? sections[sections.length - 1].origin
          : sectionOrigin;
      portrait.position.copy(positionOrigin);

      this.add(portrait);
      this.portraits.push(portrait);
    }

    // Deciduous trees have a terminal branch that grows out of the
    // end of the parent branch
    if (
      this.options.type === TreeType.Deciduous &&
      this.options.branch.terminal !== false
    ) {
      const lastSection = sections[sections.length - 1];

      if (branch.level < this.options.branch.levels) {
        this.branchQueue.push(
          new Branch(
            lastSection.origin,
            lastSection.orientation,
            this.options.branch.length[branch.level + 1],
            lastSection.radius,
            branch.level + 1,
            // Section count and segment count must be same as parent branch
            // since the child branch is growing from the end of the parent branch
            branch.sectionCount,
            branch.segmentCount,
            [...branch.path, -1],
          ),
        );
      } else {
        // this.generateLeaf(lastSection.origin, lastSection.orientation);
      }
    }

    // If we are on the last branch level, generate leaves
    if (branch.level === this.options.branch.levels) {
      this.generateLeaves(sections);
    } else if (branch.level < this.options.branch.levels) {
      let childCount = 0;
      const childrenConfig = this.options.branch.children;
      if (typeof childrenConfig === "function") {
        childCount = childrenConfig(branch.level, branch.path);
      } else if (Array.isArray(childrenConfig)) {
        let configNode = childrenConfig;
        for (let i = 0; i < branch.path.length; i++) {
          const pathIndex = branch.path[i];
          if (pathIndex === -1) {
            configNode = 0;
            break;
          }
          if (Array.isArray(configNode) && pathIndex + 1 < configNode.length) {
            configNode = configNode[pathIndex + 1];
          } else {
            configNode = 0;
            break;
          }
        }
        childCount = Array.isArray(configNode)
          ? typeof configNode[0] === "number"
            ? configNode[0]
            : 0
          : typeof configNode === "number"
            ? configNode
            : 0;
      } else if (
        childrenConfig !== null &&
        typeof childrenConfig === "object"
      ) {
        childCount = childrenConfig[branch.level] || 0;
      } else {
        childCount = childrenConfig || 0;
      }

      this.generateChildBranches(
        childCount,
        branch.level + 1,
        sections,
        branch.path,
      );
    }

    // box models
  }

  /**
   * Generate branches from a parent branch
   * @param {number} count The number of child branches to generate
   * @param {number} level The level of the child branches
   * @param {{
   *  origin: THREE.Vector3,
   *  orientation: THREE.Euler,
   *  radius: number
   * }[]} sections The parent branch's sections
   * @param {number[]} parentPath The path of the parent branch
   * @returns
   */
  generateChildBranches(count, level, sections, parentPath = []) {
    const radialOffset = this.rng.random();

    for (let i = 0; i < count; i++) {
      const childPath = [...parentPath, i];

      // Determine how far along the length of the parent branch the child
      // branch should originate from (0 to 1)
      let childBranchStart = this.rng.random(
        1.0,
        this.options.branch.start[level],
      );

      // Find which sections are on either side of the child branch origin point
      // so we can determine the origin, orientation and radius of the branch
      const sectionIndex = Math.floor(childBranchStart * (sections.length - 1));
      let sectionA, sectionB;
      sectionA = sections[sectionIndex];
      if (sectionIndex === sections.length - 1) {
        sectionB = sectionA;
      } else {
        sectionB = sections[sectionIndex + 1];
      }

      // Find normalized distance from section A to section B (0 to 1)
      const alpha =
        (childBranchStart - sectionIndex / (sections.length - 1)) /
        (1 / (sections.length - 1));

      // Linearly interpolate origin from section A to section B
      const childBranchOrigin = new THREE.Vector3().lerpVectors(
        sectionA.origin,
        sectionB.origin,
        alpha,
      );

      // Linearly interpolate radius
      const childBranchRadius =
        this.options.branch.radius[level] *
        ((1 - alpha) * sectionA.radius + alpha * sectionB.radius);

      // Linearlly interpolate the orientation
      const qA = new THREE.Quaternion().setFromEuler(sectionA.orientation);
      const qB = new THREE.Quaternion().setFromEuler(sectionB.orientation);
      const parentOrientation = new THREE.Euler().setFromQuaternion(
        qB.slerp(qA, alpha),
      );

      // Calculate the angle offset from the parent branch and the radial angle
      const radialAngle = 2.0 * Math.PI * (radialOffset + i / count);
      const q1 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        this.options.branch.angle[level] / (180 / Math.PI),
      );
      const q2 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        radialAngle,
      );
      const q3 = new THREE.Quaternion().setFromEuler(parentOrientation);

      const childBranchOrientation = new THREE.Euler().setFromQuaternion(
        q3.multiply(q2.multiply(q1)),
      );

      let childBranchLength =
        this.options.branch.length[level] *
        (this.options.type === TreeType.Evergreen
          ? 1.0 - childBranchStart
          : 1.0);

      this.branchQueue.push(
        new Branch(
          childBranchOrigin,
          childBranchOrientation,
          childBranchLength,
          childBranchRadius,
          level,
          this.options.branch.sections[level],
          this.options.branch.segments[level],
          childPath,
        ),
      );
    }
  }

  /**
   * Logic for spawning child branches from a parent branch's section
   * @param {{
   *  origin: THREE.Vector3,
   *  orientation: THREE.Euler,
   *  radius: number
   * }[]} sections The parent branch's sections
   * @returns
   */
  generateLeaves(sections) {
    const radialOffset = this.rng.random();

    for (let i = 0; i < this.options.leaves.count; i++) {
      // Determine how far along the length of the parent
      // branch the leaf should originate from (0 to 1)
      let leafStart = this.rng.random(1.0, this.options.leaves.start);

      // Find which sections are on either side of the child branch origin point
      // so we can determine the origin, orientation and radius of the branch
      const sectionIndex = Math.floor(leafStart * (sections.length - 1));
      let sectionA, sectionB;
      sectionA = sections[sectionIndex];
      if (sectionIndex === sections.length - 1) {
        sectionB = sectionA;
      } else {
        sectionB = sections[sectionIndex + 1];
      }

      // Find normalized distance from section A to section B (0 to 1)
      const alpha =
        (leafStart - sectionIndex / (sections.length - 1)) /
        (1 / (sections.length - 1));

      // Linearly interpolate origin from section A to section B
      const leafOrigin = new THREE.Vector3().lerpVectors(
        sectionA.origin,
        sectionB.origin,
        alpha,
      );

      // Linearlly interpolate the orientation
      const qA = new THREE.Quaternion().setFromEuler(sectionA.orientation);
      const qB = new THREE.Quaternion().setFromEuler(sectionB.orientation);
      const parentOrientation = new THREE.Euler().setFromQuaternion(
        qB.slerp(qA, alpha),
      );

      // Calculate the angle offset from the parent branch and the radial angle
      const radialAngle =
        2.0 * Math.PI * (radialOffset + i / this.options.leaves.count);
      const q1 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        this.options.leaves.angle / (180 / Math.PI),
      );
      const q2 = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        radialAngle,
      );
      const q3 = new THREE.Quaternion().setFromEuler(parentOrientation);

      const leafOrientation = new THREE.Euler().setFromQuaternion(
        q3.multiply(q2.multiply(q1)),
      );

      // this.generateLeaf(leafOrigin, leafOrientation);
    }
  }

  /**
   * Generates a leaves
   * @param {THREE.Vector3} origin The starting point of the branch
   * @param {THREE.Euler} orientation The starting orientation of the branch
   */
  generateLeaf(origin, orientation) {
    let i = this.leaves.verts.length / 3;

    // Width and length of the leaf quad
    let leafSize =
      this.options.leaves.size *
      (1 +
        this.rng.random(
          this.options.leaves.sizeVariance,
          -this.options.leaves.sizeVariance,
        ));

    const W = leafSize;
    const L = leafSize;

    const createLeaf = (rotation) => {
      // Create quad vertices
      const v = [
        new THREE.Vector3(-W / 2, L, 0),
        new THREE.Vector3(-W / 2, 0, 0),
        new THREE.Vector3(W / 2, 0, 0),
        new THREE.Vector3(W / 2, L, 0),
      ].map((v) =>
        v
          .applyEuler(new THREE.Euler(0, rotation, 0))
          .applyEuler(orientation)
          .add(origin),
      );

      this.leaves.verts.push(
        v[0].x,
        v[0].y,
        v[0].z,
        v[1].x,
        v[1].y,
        v[1].z,
        v[2].x,
        v[2].y,
        v[2].z,
        v[3].x,
        v[3].y,
        v[3].z,
      );

      const n = new THREE.Vector3(0, 0, 1).applyEuler(orientation);
      this.leaves.normals.push(
        n.x,
        n.y,
        n.z,
        n.x,
        n.y,
        n.z,
        n.x,
        n.y,
        n.z,
        n.x,
        n.y,
        n.z,
      );
      this.leaves.uvs.push(0, 1, 0, 0, 1, 0, 1, 1);
      this.leaves.indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
      i += 4;
    };

    createLeaf(0);
    if (this.options.leaves.billboard === Billboard.Double) {
      createLeaf(Math.PI / 2);
    }
  }

  /**
   * Generates the indices for branch geometry
   * @param {Branch} branch
   */
  generateBranchIndices(indexOffset, branch) {
    // Build geometry each section of the branch (cylinder without end caps)
    let v1, v2, v3, v4;
    const N = branch.segmentCount + 1;
    for (let i = 0; i < branch.sectionCount; i++) {
      // Build the quad for each segment of the section
      for (let j = 0; j < branch.segmentCount; j++) {
        v1 = indexOffset + i * N + j;
        // The last segment wraps around back to the starting segment, so omit j + 1 term
        v2 = indexOffset + i * N + (j + 1);
        v3 = v1 + N;
        v4 = v2 + N;
        this.branches.indices.push(v1, v3, v2, v2, v3, v4);
      }
    }
  }

  /**
   * Generates the geometry for the branches
   */
  createBranchesGeometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.branches.verts), 3),
    );
    g.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(this.branches.normals), 3),
    );
    g.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(this.branches.uvs), 2),
    );
    g.setIndex(
      new THREE.BufferAttribute(new Uint16Array(this.branches.indices), 1),
    );
    g.computeBoundingSphere();

    const mat = new THREE.MeshToonMaterial({
      name: "branches",
      color: new THREE.Color(this.options.bark.tint),
      gradientMap: this.getGradientTexture(), // Use generated gradient map
      depthTest: false,
    });

    if (this.options.bark.textured) {
      // mat.map = getBarkTexture(
      //   this.options.bark.type,
      //   "color",
      //   this.options.bark.textureScale,
      // );
      mat.normalMap = getBarkTexture(
        this.options.bark.type,
        "normal",
        this.options.bark.textureScale,
      );
    }

    this.branchesMesh.geometry.dispose();
    this.branchesMesh.geometry = g;
    this.branchesMesh.material.dispose();
    this.branchesMesh.material = mat;
    this.branchesMesh.castShadow = true;
    this.branchesMesh.receiveShadow = true;
  }

  /**
   * Generates the geometry for the leaves
   */
  createLeavesGeometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(this.leaves.verts), 3),
    );
    g.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(this.leaves.uvs), 2),
    );
    g.setIndex(
      new THREE.BufferAttribute(new Uint16Array(this.leaves.indices), 1),
    );
    g.computeVertexNormals();
    g.computeBoundingSphere();

    const mat = new THREE.MeshToonMaterial({
      name: "leaves",
      map: getLeafTexture(this.options.leaves.type), // Re-enable texture map
      color: new THREE.Color(this.options.leaves.tint),
      side: THREE.DoubleSide,
      alphaTest: this.options.leaves.alphaTest,
      gradientMap: this.getGradientTexture(), // Use generated gradient map
    });

    this.leavesMesh.geometry.dispose();
    this.leavesMesh.geometry = g;
    this.leavesMesh.material.dispose();

    this.leavesMesh.material = mat;

    this.leavesMesh.castShadow = true;
    this.leavesMesh.receiveShadow = true;
  }

  /**
   * Create or update the trellis geometry
   */
  createTrellis() {
    // Remove old trellis if exists
    if (this.trellisMesh) {
      this.remove(this.trellisMesh);
      this.trellisMesh.dispose();
      this.trellisMesh = null;
    }

    // Create new trellis if enabled and visible
    if (this.options.trellis.enabled && this.options.trellis.visible) {
      this.trellisMesh = new Trellis(this.options.trellis);
      this.trellisMesh.generate();
      this.add(this.trellisMesh);
    }
  }

  /**
   * Find the nearest point on the trellis grid to a given position
   * @param {THREE.Vector3} position
   * @returns {THREE.Vector3}
   */
  getNearestTrellisPoint(position) {
    const t = this.options.trellis;
    const trellisX = t.position.x;
    const trellisY = t.position.y;
    const trellisZ = t.position.z;

    // Trellis bounds
    const minX = trellisX - t.width / 2;
    const maxX = trellisX + t.width / 2;
    const minY = trellisY;
    const maxY = trellisY + t.height;

    // Clamp position to trellis bounds for projection
    const clampedX = Math.max(minX, Math.min(maxX, position.x));
    const clampedY = Math.max(minY, Math.min(maxY, position.y));

    // Find nearest horizontal line (Y = constant)
    const nearestHLineY =
      Math.round((clampedY - minY) / t.spacing) * t.spacing + minY;
    const finalHLineY = Math.max(minY, Math.min(maxY, nearestHLineY));

    // Find nearest vertical line (X = constant)
    const nearestVLineX =
      Math.round((clampedX - minX) / t.spacing) * t.spacing + minX;
    const finalVLineX = Math.max(minX, Math.min(maxX, nearestVLineX));

    // Point on nearest horizontal line (X can vary along the line)
    const pointOnHLine = new THREE.Vector3(clampedX, finalHLineY, trellisZ);

    // Point on nearest vertical line (Y can vary along the line)
    const pointOnVLine = new THREE.Vector3(finalVLineX, clampedY, trellisZ);

    // Return whichever is closer
    const distH = position.distanceTo(pointOnHLine);
    const distV = position.distanceTo(pointOnVLine);

    return distH < distV ? pointOnHLine : pointOnVLine;
  }

  /**
   * Calculate the force vector toward the nearest trellis point
   * @param {THREE.Vector3} position Current section position
   * @param {number} radius Current section radius
   * @returns {{ direction: THREE.Vector3, strength: number } | null}
   */
  calculateTrellisForce(position, radius) {
    const trellis = this.options.trellis;
    const nearestPoint = this.getNearestTrellisPoint(position);

    const distance = position.distanceTo(nearestPoint);

    // Only apply force within max distance
    if (distance > trellis.force.maxDistance) return null;
    if (distance < 0.001) return null; // Avoid division by zero

    // Calculate direction toward trellis
    const direction = new THREE.Vector3()
      .subVectors(nearestPoint, position)
      .normalize();

    // Calculate strength with distance falloff
    // Closer = stronger force, scaled by inverse radius (like existing force)
    const distanceFactor =
      1 - Math.pow(distance / trellis.force.maxDistance, trellis.force.falloff);
    const strength = (trellis.force.strength * distanceFactor) / radius;

    return { direction, strength };
  }

  get vertexCount() {
    return (this.branches.verts.length + this.leaves.verts.length) / 3;
  }

  get triangleCount() {
    return (this.branches.indices.length + this.leaves.indices.length) / 3;
  }

  /**
   * Update the portraits to face the camera
   * @param {THREE.Quaternion} rotation
   */
  updatePortraits(rotation) {
    if (this.portraits) {
      // Create a temporary quaternion to hold the inverse of the parent's world rotation
      const parentWorldQuat = new THREE.Quaternion();
      this.getWorldQuaternion(parentWorldQuat);
      const invParent = parentWorldQuat.invert();

      this.portraits.forEach((portrait) => {
        // We want the portrait's world rotation to match the camera's rotation.
        // If the portrait is a child of this tree, its local rotation needs to be composed properly.
        // We want: portrait.worldQuat == camera.quat
        // Since portrait.worldQuat = parent.worldQuat * portrait.localQuat
        // portrait.localQuat = inv(parent.worldQuat) * camera.quat

        portrait.quaternion.copy(invParent).multiply(rotation);
      });
    }
  }

  // créer les OBB pour les portraits
  createBoxModels() {
    this.portraits.forEach((portrait) => {
      portrait.geometry.computeBoundingBox();
      portrait.userData.obb = new OBB().fromBox3(portrait.geometry.boundingBox);
      // console.log(portrait.userData.obb);
    });
  }

  // classes ajoutées
  animate(portraits = this.portraits) {
    portraits.forEach((portrait) => {
      // // portrait.material.color.set(0x00ff00);
      // portrait.updateMatrixWorld(true);
      // const smallerBox = portrait.geometry.boundingBox.clone();
      // // scale box down by 50% for collision checks
      // smallerBox.min.multiplyScalar(0.5);
      // smallerBox.max.multiplyScalar(0.5);
      // portrait.userData.obb.fromBox3(smallerBox);
      // portrait.userData.obb.applyMatrix4(portrait.matrixWorld);
    });

    // portraits.forEach((portrait) => {
    //   portraits.forEach((otherPortrait) => {
    //     if (
    //       portrait !== otherPortrait &&
    //       portrait.userData.obb.intersectsOBB(otherPortrait.userData.obb)
    //     ) {
    //       portrait.material.color.set(0xff0000);
    //       if (typeof window !== "undefined" && !window.__debugOBB) {
    //         window.__debugOBB = true;
    //         fetch("/api/log", {
    //           method: "POST",
    //           body: JSON.stringify({
    //             p1_center: portrait.userData.obb.center,
    //             p2_center: otherPortrait.userData.obb.center,
    //             p1_half: portrait.userData.obb.halfSize,
    //             p2_half: otherPortrait.userData.obb.halfSize,
    //             p1_pos: portrait.position,
    //             p2_pos: otherPortrait.position,
    //           }),
    //           headers: { "Content-Type": "application/json" },
    //         }).catch(() => {});
    //       }
    //     }
    //   });
    // });
  }
}
