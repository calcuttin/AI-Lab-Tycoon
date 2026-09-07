import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createOfficeMaterials } from './officeMaterials';

afterEach(() => vi.restoreAllMocks());
const spec = { asset: 'wood_table_worn', repeat: [1, 1] as [number, number] };

describe('scene-owned physical materials', () => {
  it('shares loaded maps and material variants across repeated furniture', async () => {
    const load = vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(async () => new THREE.Texture<HTMLImageElement>());
    const manager = createOfficeMaterials(vi.fn());
    const source = new THREE.MeshStandardMaterial();
    const a = new THREE.Mesh(new THREE.BoxGeometry(), source), b = new THREE.Mesh(new THREE.BoxGeometry(), source);
    await Promise.all([manager.apply(a, spec), manager.apply(b, spec)]);
    expect(load).toHaveBeenCalledTimes(3);
    expect(a.material).toBe(b.material);
    expect(a.material).not.toBe(source);
    expect(a.material.map?.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(a.material.normalMap?.colorSpace).toBe(THREE.NoColorSpace);
    manager.dispose(); a.geometry.dispose(); b.geometry.dispose();
  });

  it('leaves the usable fallback material intact if a map fails', async () => {
    const successful: THREE.Texture[] = [];
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(async (url) => {
      if (url.includes('nor_gl')) throw new Error('offline');
      const t = new THREE.Texture<HTMLImageElement>(); vi.spyOn(t, 'dispose'); successful.push(t); return t;
    });
    const ready = vi.fn(), manager = createOfficeMaterials(ready);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const original = mesh.material;
    await manager.apply(mesh, spec);
    expect(mesh.material).toBe(original); expect(ready).not.toHaveBeenCalled();
    successful.forEach((t) => expect(t.dispose).toHaveBeenCalledOnce());
    manager.dispose(); mesh.geometry.dispose(); original.dispose();
  });

  it('disposes late downloads instead of attaching them to a closed scene', async () => {
    const pending: ((t: THREE.Texture<HTMLImageElement>) => void)[] = [];
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
    const ready = vi.fn(), manager = createOfficeMaterials(ready);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    const original = mesh.material, completion = manager.apply(mesh, spec);
    manager.dispose();
    const textures = pending.map((resolve) => { const t = new THREE.Texture<HTMLImageElement>(); vi.spyOn(t, 'dispose'); resolve(t); return t; });
    await completion;
    expect(mesh.material).toBe(original); expect(ready).not.toHaveBeenCalled();
    textures.forEach((t) => expect(t.dispose).toHaveBeenCalledOnce());
    mesh.geometry.dispose(); original.dispose();
  });

  it('uses the cloth weave maps without applying the scan’s colored pattern', async () => {
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync').mockImplementation(async () => new THREE.Texture<HTMLImageElement>());
    const manager = createOfficeMaterials(vi.fn());
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    await manager.apply(mesh, { asset: 'fabric_pattern_07', repeat: [3, 3], useColor: false, tint: '#879c8b' });
    expect(mesh.material.map).toBeNull(); expect(mesh.material.normalMap).toBeInstanceOf(THREE.Texture);
    expect(mesh.material.color.getHexString()).toBe('879c8b');
    manager.dispose(); mesh.geometry.dispose();
  });
});
