import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

const transformPoint = ([x, y, z]) => [x, -y, -z];

export async function createCandidate({ canvas, sourceUrl, sourceMeta, benchmarkCameraSource, onProgress }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080a0d);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000);
  camera.rotation.order = 'YXZ';

  const spark = new SparkRenderer({ renderer });
  scene.add(spark);

  const assetStarted = performance.now();
  const splat = new SplatMesh({
    url: sourceUrl,
    editable: false,
    onProgress: (event) => {
      const total = event.total || 0;
      const ratio = total > 0 ? event.loaded / total : null;
      onProgress?.({ loaded: event.loaded || 0, total, ratio });
    }
  });
  splat.quaternion.set(1, 0, 0, 0);
  scene.add(splat);
  await splat.initialized;
  const assetLoadMs = performance.now() - assetStarted;

  let running = true;
  renderer.setAnimationLoop(() => {
    if (running) renderer.render(scene, camera);
  });

  const initialTarget = transformPoint(benchmarkCameraSource.target);
  const initialPosition = transformPoint(benchmarkCameraSource.position);
  const initialRadius = Math.hypot(
    initialPosition[0] - initialTarget[0],
    initialPosition[1] - initialTarget[1],
    initialPosition[2] - initialTarget[2]
  );

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', resize);

  return {
    runtime: 'Spark 2.1.0 + Three 0.185.1',
    backend: 'webgl2',
    splatCount: splat.numSplats,
    assetLoadMs,
    orientation: 'Spark baseline: 180° around X; W0 calibration still pending',
    initialTarget,
    initialPosition,
    initialRadius,
    setOrbitCamera(position, target) {
      camera.position.fromArray(position);
      camera.up.set(0, 1, 0);
      camera.lookAt(new THREE.Vector3(...target));
    },
    setFlyCamera(position, yaw, pitch) {
      camera.position.fromArray(position);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    },
    destroy() {
      running = false;
      window.removeEventListener('resize', resize);
      renderer.setAnimationLoop(null);
      splat.dispose?.();
      renderer.dispose();
    }
  };
}
