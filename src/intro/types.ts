export interface CameraState {
  x: number;
  zoom: number;
}

export interface CameraKeyframe {
  time: number;
  x: number;
  zoom: number;
}

export interface EraBeat {
  time: number;
  duration: number;
  label: string;
  subtitle: string;
  highlight?: boolean;
}

export interface WorldBuilding {
  id: string;
  name: string;
  x: number;
  width: number;
  height: number;
  color: string;
  accent: string;
  collapses?: boolean;
  isPlayer?: boolean;
  rooftop?: 'antenna' | 'dish' | 'helipad' | 'server' | 'crane';
}

export interface WorldBillboard {
  text: string;
  x: number;
  color: string;
  width: number;
  height: number;
}

export interface WorldTree {
  x: number;
  height: number;
  type: 'pine' | 'round';
}

export interface IntroRenderState {
  time: number;
  progress: number;
  camera: CameraState;
  era: EraBeat | null;
}
