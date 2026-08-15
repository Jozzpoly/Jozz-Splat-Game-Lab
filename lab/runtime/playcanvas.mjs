import {
  Application,
  Asset,
  Color,
  DEVICETYPE_WEBGL2,
  DEVICETYPE_WEBGPU,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  createGraphicsDevice
} from 'playcanvas';

const toDegrees = (radians) => radians * 180 / Math.PI;
const transformPoint = ([x, y, z]) => [-x, -y, z];

export async function createCandidate({ canvas, sourceUrl, sourceMeta, backendMode, benchmarkCameraSource, onProgress }) {
  const deviceTypes = backendMode === 'best'
    ? [DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2]
    : [DEVICETYPE_WEBGL2];

  const graphicsDevice = await createGraphicsDevice(canvas, {
    deviceTypes,
    antialias: false,
    powerPreference: 'high-performance'
  });

  const app = new Application(canvas, { graphicsDevice });
  app.graphicsDevice.maxPixelRatio = 1;
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  app.start();

  const camera = new Entity('R0 Camera');
  camera.addComponent('camera', { clearColor: new Color(0.031, 0.039, 0.051) });
  app.root.addChild(camera);

  const asset = new Asset('R0 Source', 'gsplat', { url: sourceUrl });
  app.assets.add(asset);
  asset.on('progress', (receivedBytes, totalBytes) => {
    const ratio = totalBytes > 0 ? receivedBytes / totalBytes : null;
    onProgress?.({ loaded: receivedBytes || 0, total: totalBytes || 0, ratio });
  });

  const assetStarted = performance.now();
  await new Promise((resolve, reject) => {
    asset.ready(resolve);
    asset.once('error', (err) => reject(new Error(String(err))));
    app.assets.load(asset);
  });
  const assetLoadMs = performance.now() - assetStarted;

  const splat = new Entity('R0 Splat');
  splat.setEulerAngles(0, 0, 180);
  splat.addComponent('gsplat', { asset });
  app.root.addChild(splat);

  const initialTarget = transformPoint(benchmarkCameraSource.target);
  const initialPosition = transformPoint(benchmarkCameraSource.position);
  const initialRadius = Math.hypot(
    initialPosition[0] - initialTarget[0],
    initialPosition[1] - initialTarget[1],
    initialPosition[2] - initialTarget[2]
  );

  const resize = () => app.resizeCanvas();
  window.addEventListener('resize', resize);

  const resource = splat.gsplat?.resource ?? asset.resource;

  return {
    runtime: 'PlayCanvas 2.21.2',
    backend: app.graphicsDevice.deviceType,
    splatCount: resource?.numSplats ?? sourceMeta.active.splats,
    assetLoadMs,
    orientation: 'PlayCanvas PLY baseline: 180° around Z; W0 calibration still pending',
    initialTarget,
    initialPosition,
    initialRadius,
    setOrbitCamera(position, target) {
      camera.setPosition(position[0], position[1], position[2]);
      camera.lookAt(target[0], target[1], target[2]);
    },
    setFlyCamera(position, yaw, pitch) {
      camera.setPosition(position[0], position[1], position[2]);
      camera.setEulerAngles(toDegrees(pitch), toDegrees(yaw), 0);
    },
    destroy() {
      window.removeEventListener('resize', resize);
      app.destroy();
    }
  };
}
