import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { materials, physical } from "./materials.js";
import { steeringCurvature } from "./planning.js";
import { assetManager } from "./asset-loading.js";

let carAsset;
const WHEEL_NAMES = ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"];

export function updateHeroWheels(model, signedDistance, steering, speed) {
  const wheelbase = model.userData.wheelbase;
  const curvature = steeringCurvature(steering, speed);
  for (const name of WHEEL_NAMES) {
    const wheel = model.getObjectByName(name);
    const rotor = wheel.children[0];
    // Local -Z is forward. Calipers steer with the axle but do not roll.
    rotor.rotation.x =
      (rotor.rotation.x - signedDistance / wheel.userData.radius) %
      (Math.PI * 2);
    wheel.rotation.y = wheel.userData.front
      ? -Math.atan((wheelbase * curvature) / (1 - wheel.position.x * curvature))
      : 0;
  }
}

export async function loadHeroCar() {
  carAsset ||= (async () => {
    const decoder = new DRACOLoader(assetManager).setDecoderPath("draco/");
    const loader = new GLTFLoader(assetManager).setDRACOLoader(decoder);
    const { scene } = await loader.loadAsync("models/model-y/model-y.glb");
    decoder.dispose();
    const paint = physical("model-y-paint", {
      color: "#e1e4e8",
      metalness: 0.35,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const alloy = physical("model-y-alloy", {
      color: "#5c626a",
      metalness: 0.9,
      roughness: 0.28,
    });
    const glass = physical("model-y-glass", {
      color: "#192530",
      metalness: 0.25,
      roughness: 0.08,
      clearcoat: 1,
    });
    glass.name = "Glass";
    const lenses = physical("model-y-light-lenses", {
      color: "#eef4ff",
      metalness: 0.05,
      roughness: 0.1,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const leather = physical("model-y-leather", {
      color: "#24282c",
      roughness: 0.85,
    });
    // This source faces -X. Normalize it to the simulation's -Z forward.
    scene.rotation.y = -Math.PI / 2;
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3());
    const scale = 4.75 / size.z;
    const transform = new THREE.Matrix4()
      .makeScale(scale, scale, scale)
      .multiply(
        new THREE.Matrix4().makeTranslation(
          -center.x,
          -bounds.min.y,
          -center.z,
        ),
      );
    const model = new THREE.Group();
    const batches = new Map([[model, new Map()]]);
    const wheels = new Map();
    const meshBounds = (mesh) =>
      new THREE.Box3().setFromObject(mesh).applyMatrix4(transform);
    const panes = [];
    scene.traverse((mesh) => {
      if (!mesh.isMesh) return;
      if (mesh.material.name === "glass_body") panes.push(meshBounds(mesh));
      if (mesh.material.name !== "tires") return;
      const box = meshBounds(mesh),
        wheelSize = box.getSize(new THREE.Vector3());
      // The four complete tire shells define exact axle centers and radii;
      // the separate sidewall lettering meshes are attached below.
      if (wheelSize.y < 0.72) return;
      const position = box.getCenter(new THREE.Vector3());
      const front = position.z < 0;
      const name = `wheel_${front ? "f" : "r"}${position.x < 0 ? "l" : "r"}`;
      const pivot = new THREE.Group();
      pivot.name = name;
      pivot.position.copy(position);
      pivot.userData.front = front;
      pivot.userData.radius = wheelSize.y / 2;
      const rotor = new THREE.Group();
      rotor.name = `${name}_spin`;
      pivot.add(rotor);
      model.add(pivot);
      wheels.set(name, { pivot, rotor });
      batches.set(rotor, new Map());
      batches.set(pivot, new Map());
    });
    if (wheels.size !== 4) throw new Error("Model Y asset is missing an axle");
    const rolling = new Set([
      "tires",
      "wheels",
      "brakedsk",
      "metal",
      "alum",
      "chrome",
    ]);
    const calipers = new Set(["calipers", "calipers2"]);
    scene.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const sourceMaterial = mesh.material.name;
      const box = meshBounds(mesh),
        center = box.getCenter(new THREE.Vector3()),
        extent = box.getSize(new THREE.Vector3());
      const wheelName = `wheel_${center.z < 0 ? "f" : "r"}${center.x < 0 ? "l" : "r"}`;
      const candidate = wheels.get(wheelName);
      const atAxle =
        Math.abs(center.z - candidate.pivot.position.z) < 0.3 &&
        Math.abs(center.x - candidate.pivot.position.x) < 0.25 &&
        box.max.y < 0.8 &&
        extent.z < 0.8;
      const wheel =
        atAxle && (rolling.has(sourceMaterial) || calipers.has(sourceMaterial))
          ? candidate
          : null;
      // Interior glass backfaces in the source must also clear the driver's view.
      const paneLiner =
        sourceMaterial === "interior" &&
        panes.some(
          (pane) =>
            pane.min.distanceTo(box.min) < 0.025 &&
            pane.max.distanceTo(box.max) < 0.025,
        );
      if (paneLiner) return;
      let material = mesh.material;
      if (sourceMaterial === "body") material = paint;
      else if (sourceMaterial === "wheels") material = alloy;
      else if (sourceMaterial === "glass_body") material = glass;
      else if (["glass_lights", "glass_front_lights"].includes(sourceMaterial))
        material = lenses;
      else if (sourceMaterial === "interior") material = leather;
      const geometry = (
        mesh.geometry.index
          ? mesh.geometry.toNonIndexed()
          : mesh.geometry.clone()
      ).applyMatrix4(transform.clone().multiply(mesh.matrixWorld));
      if (wheel)
        geometry.translate(
          -wheel.pivot.position.x,
          -wheel.pivot.position.y,
          -wheel.pivot.position.z,
        );
      for (const name of Object.keys(geometry.attributes))
        if (!["position", "normal", "uv"].includes(name))
          geometry.deleteAttribute(name);
      if (!geometry.attributes.uv)
        geometry.setAttribute(
          "uv",
          new THREE.BufferAttribute(
            new Float32Array(geometry.attributes.position.count * 2),
            2,
          ),
        );
      const parent = wheel
        ? calipers.has(sourceMaterial)
          ? wheel.pivot
          : wheel.rotor
        : model;
      const materialBatches = batches.get(parent);
      const geometries = materialBatches.get(material) || [];
      geometries.push(geometry);
      materialBatches.set(material, geometries);
    });
    for (const [parent, materialBatches] of batches)
      for (const [material, geometries] of materialBatches) {
        materials.set(`asset-car:${material.uuid}`, material);
        const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
        mesh.castShadow = material !== lenses;
        mesh.receiveShadow = true;
        parent.add(mesh);
        geometries.forEach((g) => g.dispose());
      }
    scene.traverse((mesh) => mesh.geometry?.dispose());
    model.name = "tesla-model-y";
    model.userData.eyeHeight = 1.28;
    model.userData.eyeForward = 0.45;
    model.userData.wheelbase = Math.abs(
      wheels.get("wheel_fl").pivot.position.z -
        wheels.get("wheel_rl").pivot.position.z,
    );
    return model;
  })();
  const template = await carAsset,
    model = template.clone(true);
  model.traverse((mesh) => {
    if (mesh.isMesh) mesh.geometry = mesh.geometry.clone();
  });
  return model;
}
