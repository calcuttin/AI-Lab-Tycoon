import * as THREE from 'three';

type Surface = {
  asset: string;
  repeat: [number, number];
  tint?: string;
  useColor?: boolean;
  normal?: number;
  roughness?: number;
};
const propSurfaces: Record<string, Surface> = {
  'Honey oak': { asset: 'wood_table_worn', repeat: [0.9, 0.9], normal: 0.18, roughness: 0.68 },
  'Woven sage upholstery': { asset: 'fabric_pattern_07', repeat: [3, 3], useColor: false, tint: '#879c8b', normal: 0.3, roughness: 1 },
};
for (const color of ['#b9a17f', '#b99562', '#b29b79', '#918d7c', '#a48a64']) {
  propSurfaces[color] = propSurfaces['Honey oak'];
}
for (const color of ['#b16d45', '#c28a5c']) {
  propSurfaces[color] = { asset: 'brown_leather', repeat: [2, 2], normal: 0.24, roughness: 0.72 };
}
for (const color of ['#536b69', '#62664f', '#4c6062', '#d3cbaa']) {
  propSurfaces[color] = propSurfaces['Woven sage upholstery'];
}

/** Shared, scene-owned scan maps. Physical UVs keep grain and weave at real scale. */
export function createOfficeMaterials(onReady: () => void) {
  let disposed = false;
  const textures = new Set<THREE.Texture>();
  const materials = new Set<THREE.Material>();
  const originals = new Set<THREE.Material>();
  const loader = new THREE.TextureLoader();
  const maps = new Map<string, Promise<{ color: THREE.Texture | null; normal: THREE.Texture; rough: THREE.Texture } | null>>();
  const variants = new Map<string, Promise<THREE.MeshStandardMaterial | null>>();

  function load(asset: string, useColor: boolean) {
    const key = `${asset}/${useColor}`;
    const kinds = useColor ? ['diff', 'nor_gl', 'rough'] : ['nor_gl', 'rough'];
    if (!maps.has(key)) {
      maps.set(key, Promise.allSettled(kinds.map((kind) =>
        loader.loadAsync(`/textures/office/${asset}-${kind}.jpg`),
      )).then((results) => {
        const loaded = results.flatMap((r) => r.status === 'fulfilled' ? [r.value] : []);
        if (disposed || loaded.length !== kinds.length) { loaded.forEach((t) => t.dispose()); return null; }
        if (useColor) loaded[0].colorSpace = THREE.SRGBColorSpace;
        loaded.forEach((t) => textures.add(t));
        return { color: useColor ? loaded[0] : null, normal: loaded[useColor ? 1 : 0], rough: loaded[useColor ? 2 : 1] };
      }));
    }
    return maps.get(key)!;
  }
  function variant(source: THREE.MeshStandardMaterial, spec: Surface) {
    const key = `${source.uuid}/${JSON.stringify(spec)}`;
    if (!variants.has(key)) variants.set(key, load(spec.asset, spec.useColor !== false).then((base) => {
      if (!base || disposed) return null;
      const copy = (map: THREE.Texture) => {
        const t = map.clone(); t.needsUpdate = true;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...spec.repeat); t.anisotropy = 8;
        textures.add(t); return t;
      };
      const material = source.clone();
      material.name = `Scan: ${spec.asset}`;
      material.map = base.color ? copy(base.color) : null;
      material.normalMap = copy(base.normal);
      material.roughnessMap = copy(base.rough);
      material.normalScale.setScalar(spec.normal ?? 0.3);
      material.roughness = spec.roughness ?? 0.95;
      material.color.set(spec.tint ?? '#ffffff');
      material.needsUpdate = true;
      materials.add(material); originals.add(source);
      return material;
    }));
    return variants.get(key)!;
  }
  async function apply(mesh: THREE.Mesh, spec: Surface) {
    const old = mesh.material;
    if (!(old instanceof THREE.MeshStandardMaterial)) return;
    const material = await variant(old, spec);
    if (disposed || !material) return;
    mesh.material = material; onReady();
  }
  function applyProps(root: THREE.Object3D) {
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach((source, index) => {
        const spec = propSurfaces[source.name];
        if (!(source instanceof THREE.MeshStandardMaterial) || !spec) return;
        void variant(source, spec).then((material) => {
          if (!material || disposed) return;
          if (Array.isArray(object.material)) {
            object.material = [...object.material]; object.material[index] = material;
          } else object.material = material;
          onReady();
        });
      });
    });
  }
  return {
    apply,
    applyProps,
    dispose() {
      disposed = true;
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      originals.forEach((m) => {
        for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
        m.dispose();
      });
    },
  };
}
