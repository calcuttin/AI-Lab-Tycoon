import * as THREE from "three";
import { createValleyWorld } from "./valleyWorld";
import { FILM_DURATION, getFilmFrame } from "./shots";

interface FilmOptions {
  onComplete: () => void;
  onTick: (time: number) => void;
}

export class ValleyIntroEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(42, 1, 0.3, 1100);
  private readonly world: ReturnType<typeof createValleyWorld>;
  private readonly environment: THREE.WebGLRenderTarget;
  private readonly sky: THREE.CanvasTexture;
  private readonly observer: ResizeObserver;
  private raf = 0;
  private elapsed = 0;
  private playing = false;
  private lastTime = 0;
  private lastRender = 0;
  private lastTick = -1;
  private destroyed = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly options: FilmOptions;

  constructor(canvas: HTMLCanvasElement, options: FilmOptions) {
    this.canvas = canvas;
    this.options = options;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#6c97b0");
    gradient.addColorStop(0.35, "#a2b8b6");
    gradient.addColorStop(0.49, "#f0d7aa");
    gradient.addColorStop(0.58, "#b8b291");
    gradient.addColorStop(1, "#777e67");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    const glow = ctx.createRadialGradient(760, 209, 3, 760, 209, 145);
    glow.addColorStop(0, "#fff4d8");
    glow.addColorStop(0.1, "rgba(255,232,180,0.8)");
    glow.addColorStop(1, "rgba(255,220,171,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1024, 512);
    this.sky = new THREE.CanvasTexture(skyCanvas);
    this.sky.colorSpace = THREE.SRGBColorSpace;
    this.sky.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = this.sky;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromEquirectangular(this.sky);
    pmrem.dispose();
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.55;
    this.scene.fog = new THREE.FogExp2("#c9c7ad", 0.0026);
    this.scene.add(new THREE.HemisphereLight("#d3e4ed", "#857954", 1.5));
    const sun = new THREE.DirectionalLight("#ffe1a7", 3.6);
    sun.position.set(-80, 100, 70);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -170,
      right: 170,
      top: 140,
      bottom: -130,
      near: 1,
      far: 380,
    });
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.12;
    this.scene.add(sun);
    this.world = createValleyWorld(this.scene);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
  }

  resize() {
    if (this.destroyed) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    this.camera.aspect = width / Math.max(1, height);
    this.render();
  }
  start(fromTime = this.elapsed) {
    if (this.destroyed) return;
    cancelAnimationFrame(this.raf);
    this.elapsed = Math.max(0, Math.min(FILM_DURATION, fromTime));
    this.playing = true;
    this.lastTime = performance.now();
    this.lastRender = 0;
    this.raf = requestAnimationFrame(this.loop);
  }
  pauseAt(time = this.elapsed) {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.elapsed = Math.max(0, Math.min(FILM_DURATION, time));
    this.render();
    this.options.onTick(this.elapsed);
  }
  skipToEnd() {
    this.pauseAt(FILM_DURATION);
    this.options.onComplete();
  }
  private onVisibility = () => {
    this.lastTime = performance.now();
  };
  private loop = (now: number) => {
    if (!this.playing || this.destroyed) return;
    const delta = Math.min((now - this.lastTime) / 1000, 0.15);
    this.lastTime = now;
    if (!document.hidden) {
      this.elapsed = Math.min(FILM_DURATION, this.elapsed + delta);
      if (now - this.lastRender > 1000 / 30) {
        this.render();
        this.lastRender = now;
      }
      if (this.elapsed - this.lastTick > 0.1) {
        this.options.onTick(this.elapsed);
        this.lastTick = this.elapsed;
      }
      if (this.elapsed >= FILM_DURATION) {
        this.skipToEnd();
        return;
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  };
  private render() {
    if (this.destroyed) return;
    const frame = getFilmFrame(this.elapsed);
    this.camera.position.set(...frame.position);
    this.camera.lookAt(...frame.target);
    // Preserve the set on portrait displays instead of cropping the garage.
    this.camera.fov =
      frame.shot.lens + Math.max(0, 1.5 - this.camera.aspect) * 17;
    this.camera.updateProjectionMatrix();
    this.world.update(this.elapsed);
    this.renderer.render(this.scene, this.camera);
  }
  destroy() {
    this.destroyed = true;
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.world.dispose();
    this.environment.dispose();
    this.sky.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Light && "shadow" in obj)
        (obj as THREE.DirectionalLight).shadow.dispose();
    });
    this.renderer.dispose();
    // The canvas may be reused by React during hot reload. Disposing the
    // renderer releases its resources without invalidating that live canvas.
  }
}
