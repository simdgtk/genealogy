import type { TreeOptions } from "./lib/ez-tree/types";

export interface AppConfig {
  width: number;
  height: number;
  tree: TreeOptions;
}

// Helpers pour faire correspondre le chemin de l'arbre à la base de données
export const getChildren = (persons: any[], parentId: string | null) =>
  persons
    .filter((p: any) => p.parent1Id === parentId)
    .sort((a: any, b: any) => a._id.localeCompare(b._id));

export const getPersonByPath = (persons: any[], path: number[]) => {
  const roots = getChildren(persons, null);
  if (roots.length === 0) return null;

  let currentPerson = roots[0];
  for (const step of path) {
    if (step === -1) continue;
    const childrenList = getChildren(persons, currentPerson._id);
    if (step < childrenList.length) {
      currentPerson = childrenList[step];
    } else {
      return null;
    }
  }
  return currentPerson;
};

export const getMaxDepth = (
  persons: any[],
  personId: string | null,
  depth: number,
): number => {
  const childrenList = getChildren(persons, personId);
  if (childrenList.length === 0) return depth - 1;
  return Math.max(
    ...childrenList.map((child: any) =>
      getMaxDepth(persons, child._id, depth + 1),
    ),
  );
};

export const getTreeConfig = (persons: any[]): TreeOptions => {
  const maxDepth = getMaxDepth(persons, null, 0);

  return {
    seed: 1388377,
    branch: {
      levels: Math.max(1, maxDepth),
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
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
      },
      children: (level: number, path: number[]) => {
        // On évite de rajouter des enfants sur ces prolongements pour ne pas les dupliquer.
        if (path.length > 0 && path[path.length - 1] === -1) return 0;

        const person = getPersonByPath(persons, path);
        if (!person) return 0;

        const childrenList = getChildren(persons, person._id);
        return childrenList.length;
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
        2: 1.73,
        3: 1.41,
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
      getMetadata: (path: number[]) => {
        const person = getPersonByPath(persons, path);
        if (!person) return null;
        return {
          name: person.name,
          surname: person.surname,
          gender: person.gender,
          image: person.mediaUrl,
        };
      },

      force: {
        direction: {
          x: 0,
          y: 0.3,
          z: 0,
        },
        strength: 0.02,
      },
      terminal: false,
    },
    leaves: {
      count: 0,
    },
  };
};

const config: AppConfig = {
  width: 1200,
  height: 600,
  tree: getTreeConfig([]), // Default empty config
};

export default config;
