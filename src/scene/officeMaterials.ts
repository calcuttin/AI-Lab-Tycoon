import * as THREE from 'three';

/** Optional scan maps load after the office is usable; owned by one scene only. */
export function loadOfficeSurfaces(
  floor: THREE.Mesh,
  walls: THREE.Mesh[],
  width: number,
  depth: number,
  onReady: () => void,
) {
  let disposed = false;
  const owned: THREE.Texture[] = [];
  const retired: THREE.Material[] = [];
  const loader = new THREE.TextureLoader();
  async function surface(asset: string, mesh: THREE.Mesh, repeat: [number, number]) {
    const results = await Promise.allSettled(
      ['diff', 'nor_gl', 'rough'].map((kind) => loader.loadAsync(`/textures/office/${asset}-${kind}.jpg`)),
    );
    const textures = results.flatMap((r) => r.status === 'fulfilled' ? [r.value] : []);
    if (disposed || results.some((r) => r.status === 'rejected')) {
      textures.forEach((t) => t.dispose());
      return;
    }
    owned.push(...textures);
    textures.forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...repeat);
      t.anisotropy = 4;
    });
    const [map, normalMap, roughnessMap] = textures;
    map.colorSpace = THREE.SRGBColorSpace;
    // Clone cached materials so adding a wall scan never alters a furniture part.
    retired.push(mesh.material as THREE.Material);
    const material = (mesh.material as THREE.MeshStandardMaterial).clone();
    material.map = map;
    material.normalMap = normalMap;
    material.normalScale.set(0.38, 0.38);
    material.roughnessMap = roughnessMap;
    material.color.set('#ffffff');
    material.needsUpdate = true;
    mesh.material = material;
    onReady();
  }
  void surface('garage_floor', floor, [width / 3, depth / 3]);
  walls.forEach((wall, i) => void surface('painted_plaster_wall', wall, [(i ? depth : width) / 3, 1]));
  return () => {
    disposed = true;
    owned.forEach((t) => t.dispose());
    retired.forEach((material) => {
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    });
  };
}
