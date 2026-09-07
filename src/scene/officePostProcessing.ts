import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/** Soft contact shading, with reduced resolution for the expensive depth pass. */
export function createOfficePostProcessing(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  const supported = renderer.extensions.has('EXT_color_buffer_float');
  if (!supported) return { resize() {}, render: () => renderer.render(scene, camera), dispose() {} };
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 2 });
  const composer = new EffectComposer(renderer, target);
  const beauty = new RenderPass(scene, camera);
  const contact = new GTAOPass(scene, camera, 1, 1);
  contact.blendIntensity = 0.7;
  contact.updateGtaoMaterial({ radius: 0.65, distanceExponent: 1.5, thickness: 1, distanceFallOff: 1, scale: 1, samples: 8, screenSpaceRadius: false });
  contact.updatePdMaterial({ radius: 4, samples: 8, rings: 2 });
  const output = new OutputPass();
  composer.addPass(beauty); composer.addPass(contact); composer.addPass(output);
  return {
    resize(width: number, height: number) {
      composer.setSize(width, height);
      // Small screens keep the same materials and lighting with fewer render passes.
      contact.enabled = width >= 480;
      const scale = Math.min(1, 1024 / width);
      contact.setSize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
    },
    render: () => composer.render(),
    dispose() { beauty.dispose(); contact.dispose(); output.dispose(); composer.dispose(); },
  };
}
