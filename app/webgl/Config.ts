import type { TreeOptions } from "./lib/ez-tree/types";

export interface AppConfig {
  width: number;
  height: number;
  tree: TreeOptions;
}

const config: AppConfig = {
  width: 1200,
  height: 600,

  tree: {
    seed: 1388377,
    branch: {
      levels: 2,
      angle: {
        1: 65,
        2: 60,
        3: 55,
        4: 50,
        5: 45,
      },
      length: {
        0: 14,
        1: 25,
        2: 20,
        3: 16,
        4: 12,
        5: 7,
      },
      start: {
        [1]: 1,
        [2]: 1,
        [3]: 1,
        [4]: 1,
        [5]: 1,
      },
      children: (level: number, path: number[]) => {
        if (level === 0) {
          return 1;
        }

        if (level === 1) {
          const branchIndex = path[path.length - 1];
          if (branchIndex === 0) return 2;
          if (branchIndex === 1) return 0;
        }

        return 0;
      },

      gnarliness: {
        0: 0.15,
        1: 0.25,
        2: 0.3,
        3: 0.35,
        4: 0.3,
        5: 0.2,
      },
      radius: {
        0: 2.5,
        1: 1.2,
        2: 0.8,
        3: 0.5,
        4: 0.3,
        5: 0.2,
      },
      taper: {
        0: 0.6,
        1: 0.65,
        2: 0.7,
        3: 0.7,
        4: 0.7,
        5: 0.7,
      },
      force: {
        direction: {
          x: 0,
          y: 0.3,
          z: 0,
        },
        strength: 0.02,
      },
    },
    leaves: {
      count: 0,
    },
  },
};

export default config;
