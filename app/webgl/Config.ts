import type { TreeOptions } from "./lib/ez-tree/types";

export interface AppConfig {
  width: number;
  height: number;
  tree: TreeOptions;
}

const allPersons = async () => {
  const res = await fetch("/api/persons");
  const data = await res.json();
  return data;
};

const persons = await allPersons();

// Helpers pour faire correspondre le chemin de l'arbre à la base de données
const getChildren = (parentId: string | null) =>
  persons
    .filter((p: any) => p.parent1Id === parentId)
    .sort((a: any, b: any) => a._id.localeCompare(b._id));

const getPersonByPath = (path: number[]) => {
  const roots = getChildren(null);
  if (roots.length === 0) return null;

  let currentPerson = roots[0];
  for (const step of path) {
    if (step === -1) continue;
    const childrenList = getChildren(currentPerson._id);
    if (step < childrenList.length) {
      currentPerson = childrenList[step];
    } else {
      return null;
    }
  }
  return currentPerson;
};

const getMaxDepth = (personId: string | null, depth: number): number => {
  const childrenList = getChildren(personId);
  if (childrenList.length === 0) return depth - 1;
  return Math.max(
    ...childrenList.map((child: any) => getMaxDepth(child._id, depth + 1)),
  );
};

const maxDepth = getMaxDepth(null, 0);

const config: AppConfig = {
  width: 1200,
  height: 600,

  tree: {
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

        const person = getPersonByPath(path);
        if (!person) return 0;

        const childrenList = getChildren(person._id);
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
        const person = getPersonByPath(path);
        if (!person) return null;
        return {
          name: person.name,
          surname: person.surname,
          gender: person.gender,
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
  },
};

export default config;
