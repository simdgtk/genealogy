import { Pane } from "tweakpane";

import { Tree as TreeLib } from "~/webgl/lib/ez-tree";

export default class PaneManager {
  instance: TreeLib;

  constructor(instance: TreeLib) {
    this.instance = instance;
  }

  initPane() {
    const pane: any = new Pane({ title: "Tree Config" });

    const regenerate = () => {
      this.instance.generate();
    };

    const seedBinding = pane
      .addBinding(this.instance.options, "seed", {
        step: 1,
      })
      .on("change", regenerate);

    pane.addButton({ title: "Randomize Seed" }).on("click", () => {
      this.instance.options.seed = Math.floor(Math.random() * 100000);
      seedBinding.refresh();
      regenerate();
    });
    pane
      .addBinding(this.instance.options, "type", {
        options: { Deciduous: "deciduous", Evergreen: "evergreen" },
      })
      .on("change", regenerate);

    const branchFolder = pane.addFolder({ title: "Branch" });
    branchFolder
      .addBinding(this.instance.options.branch, "levels", {
        min: 0,
        max: 4,
        step: 1,
      })
      .on("change", regenerate);

    // Helper to bind array/object properties per level
    const bindLevelProps = (
      obj: any,
      propName: string,
      label: string,
      params: any = {},
    ) => {
      const folder = branchFolder.addFolder({ title: label, expanded: false });
      for (let i = 0; i <= 4; i++) {
        if (obj[i] !== undefined) {
          folder
            .addBinding(obj, i.toString(), { label: `Level ${i}`, ...params })
            .on("change", regenerate);
        }
      }
    };

    // bindLevelProps(this.instance.options.branch.length, "length", "Length");
    // bindLevelProps(
    //   this.instance.options.branch.children,
    //   "children",
    //   "Children",
    //   { step: 1 },
    // );
    bindLevelProps(this.instance.options.branch.radius, "radius", "Radius");
    bindLevelProps(
      this.instance.options.branch.sections,
      "sections",
      "Sections",
      { step: 1 },
    );
    bindLevelProps(
      this.instance.options.branch.segments,
      "segments",
      "Segments",
      { step: 1 },
    );
    bindLevelProps(this.instance.options.branch.start, "start", "Start", {
      min: 0,
      max: 1,
    });
    bindLevelProps(this.instance.options.branch.taper, "taper", "Taper", {
      min: 0,
      max: 1,
    });
    bindLevelProps(
      this.instance.options.branch.gnarliness,
      "gnarliness",
      "Gnarliness",
    );
    bindLevelProps(this.instance.options.branch.twist, "twist", "Twist");
    bindLevelProps(this.instance.options.branch.angle, "angle", "Angle");

    branchFolder
      .addBinding(this.instance.options.branch.force, "strength", {
        label: "Force Strength",
      })
      .on("change", regenerate);

    // Bind Force Direction specially since it's a Vector3-like object
    const forceDirFolder = branchFolder.addFolder({ title: "Force Direction" });
    forceDirFolder
      .addBinding(this.instance.options.branch.force.direction, "x")
      .on("change", regenerate);
    forceDirFolder
      .addBinding(this.instance.options.branch.force.direction, "y")
      .on("change", regenerate);
    forceDirFolder
      .addBinding(this.instance.options.branch.force.direction, "z")
      .on("change", regenerate);

    const leavesFolder = pane.addFolder({ title: "Leaves" });
    leavesFolder
      .addBinding(this.instance.options.leaves, "count", {
        min: 0,
        max: 50,
        step: 1,
      })
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "size")
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "sizeVariance")
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "start", { min: 0, max: 1 })
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "angle")
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "alphaTest", { min: 0, max: 1 })
      .on("change", regenerate);
    leavesFolder
      .addBinding(this.instance.options.leaves, "billboard", {
        options: { Single: "single", Double: "double" },
      })
      .on("change", regenerate);

    const barkFolder = pane.addFolder({ title: "Bark" });
    barkFolder
      .addBinding(this.instance.options.bark, "tint", { view: "color" })
      .on("change", regenerate);
    barkFolder
      .addBinding(this.instance.options.bark, "flatShading")
      .on("change", regenerate);
    barkFolder
      .addBinding(this.instance.options.bark, "textured")
      .on("change", regenerate);
  }
}
