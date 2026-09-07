import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function release(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    geometries.add(o.geometry);
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      materials.add(m);
      for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose());
}

/** A shared scanned shrub, positioned outside the shell's usable floor area. */
export function createOfficeGarden(parent: THREE.Object3D, points: { x: number; z: number }[], onReady: () => void) {
  let disposed = false;
  const group = new THREE.Group(); group.name = 'Native garden'; parent.add(group);
  void new GLTFLoader().loadAsync('/models/office-garden.glb').then(({ scene: source }) => {
    if (disposed) { release(source); return; }
    const bounds = new THREE.Box3().setFromObject(source);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    for (const [i, point] of points.entries()) {
      const shrub = source.clone(true);
      const scale = (1.15 + (i % 3) * 0.13) / Math.max(0.1, size.y);
      shrub.scale.multiplyScalar(scale);
      shrub.position.set(point.x - center.x * scale, 0.27 - bounds.min.y * scale, point.z - center.z * scale);
      shrub.traverse((o) => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; } });
      group.add(shrub);
    }
    onReady();
  }).catch(() => { /* Architecture and landscaping beds remain usable offline. */ });
  return { dispose() { disposed = true; release(group); group.removeFromParent(); } };
}
