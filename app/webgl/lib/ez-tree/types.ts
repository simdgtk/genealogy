export interface TreeOptions {
  seed?: number;
  type?: string;
  bark?: {
    type?: string;
    tint?: number;
    flatShading?: boolean;
    textured?: boolean;
    textureScale?: { x: number; y: number };
  };
  branch?: {
    levels?: number;
    angle?: Record<number, number>;
    children?:
      | number
      | any[]
      | ((level: number, path: number[]) => number)
      | Record<number, number>;
    force?: {
      direction?: { x: number; y: number; z: number };
      strength?: number;
    };
    gnarliness?: Record<number, number>;
    length?: Record<number, number>;
    radius?: Record<number, number>;
    sections?: Record<number, number>;
    segments?: Record<number, number>;
    start?: Record<number, number>;
    taper?: Record<number, number>;
    twist?: Record<number, number>;
  };
  leaves?: {
    type?: string;
    billboard?: string;
    angle?: number;
    count?: number;
    start?: number;
    size?: number;
    sizeVariance?: number;
    tint?: number;
    alphaTest?: number;
  };
  trellis?: {
    enabled?: boolean;
    position?: { x: number; y: number; z: number };
    width?: number;
    height?: number;
    spacing?: number;
    force?: {
      strength?: number;
      maxDistance?: number;
      falloff?: number;
    };
    cylinderRadius?: number;
    visible?: boolean;
    color?: number;
  };
}
