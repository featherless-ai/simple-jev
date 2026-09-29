import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { materials } from "./materials.js";
import { rng } from "./math.js";
import { assetManager } from "./asset-loading.js";
import { renderProfile } from "./render-profile.js";

const assets = new Map();
function loadAsset(name, file) {
  if (!assets.has(name))
    assets.set(
      name,
      new GLTFLoader(assetManager)
        .loadAsync(`models/${name}/${file}.glb`)
        .then(({ scene }) => {
          scene.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(scene),
            center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const normalize = new THREE.Matrix4()
            .makeScale(1 / size.y, 1 / size.y, 1 / size.y)
            .multiply(
              new THREE.Matrix4().makeTranslation(
                -center.x,
                -bounds.min.y,
                -center.z,
              ),
            );
          const parts = [];
          scene.traverse((mesh) => {
            if (!mesh.isMesh) return;
            const material = mesh.material;
            for (const value of Object.values(material))
              if (value?.isTexture)
                value.anisotropy = Math.min(4, renderProfile.anisotropy);
            material.envMapIntensity = 0.5;
            materials.set(`scenery:${material.uuid}`, material);
            parts.push({
              geometry: mesh.geometry
                .clone()
                .applyMatrix4(normalize.clone().multiply(mesh.matrixWorld)),
              material,
            });
          });
          scene.traverse((mesh) => mesh.geometry?.dispose());
          return parts;
        }),
    );
  return assets.get(name);
}

export class SceneryAssets {
  constructor(scene, world, vegetation) {
    this.scene = scene;
    this.world = world;
    this.vegetation = vegetation;
    this.active = true;
    this.nextUpdate = 0;
    this.treeMeshes = [];
    this.treeObjects = world.objects.filter((o) => o.type === "tree");
    this.ready = Promise.allSettled([
      renderProfile.detailedFoliage && this.trees(),
      this.streetlights(),
      renderProfile.detailedFoliage && this.shrubs(),
    ]).then((results) => {
      for (const result of results)
        if (result.status === "rejected")
          console.warn("Scenery model unavailable", result.reason);
    });
  }
  instances(parts, locations, name) {
    const dummy = new THREE.Object3D(),
      meshes = [];
    for (const part of parts) {
      // Each world owns its GPU geometry; cached templates survive a restart.
      const mesh = new THREE.InstancedMesh(
        part.geometry.clone(),
        part.material,
        locations.length,
      );
      mesh.name = name;
      locations.forEach((p, i) => {
        dummy.position.set(p.x, p.y || 0, p.z);
        dummy.rotation.set(0, p.rotation || 0, 0);
        dummy.scale.setScalar(p.height);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      this.scene.add(mesh);
      meshes.push(mesh);
    }
    return meshes;
  }
  async trees() {
    const parts = await loadAsset("tree_small_02", "tree");
    if (!this.active) return;
    this.treeMeshes = this.instances(
      parts,
      Array.from({ length: 36 }, () => ({ x: 0, z: 0, height: 0 })),
      "detailed-tree",
    );
    for (const mesh of this.treeMeshes) mesh.count = 0;
  }
  async streetlights() {
    if (this.world.type === "highway") return;
    const parts = await loadAsset("street_lamp_01", "lamp");
    if (!this.active) return;
    const locations = [];
    for (const edge of this.world.edges) {
      const a = this.world.byId[edge.a],
        b = this.world.byId[edge.b];
      const h = Math.atan2(b.x - a.x, a.z - b.z);
      for (let distance = 26; distance < edge.length - 20; distance += 42) {
        const side = Math.round(distance / 42) % 2 ? -1 : 1;
        locations.push({
          x: a.x + Math.sin(h) * distance + Math.cos(h) * 7.25 * side,
          z: a.z - Math.cos(h) * distance + Math.sin(h) * 7.25 * side,
          height: 6.8,
          rotation: -h + (side * Math.PI) / 2,
        });
      }
    }
    const chunks = new Map();
    for (const location of locations) {
      const key = `${Math.floor(location.x / 70)}:${Math.floor(location.z / 70)}`;
      const chunk = chunks.get(key) || [];
      chunk.push(location);
      chunks.set(key, chunk);
    }
    for (const chunk of chunks.values())
      this.instances(parts, chunk, "streetlight");
  }
  async shrubs() {
    const parts = await loadAsset("shrub_01", "shrub");
    if (!this.active) return;
    const random = rng(this.world.seed + 510);
    const locations = this.treeObjects
      .filter((o, i) => i % 3 === 0)
      .map((o) => ({
        x: o.x + 1.5,
        z: o.z - 1.2,
        height: 0.75 + random() * 0.65,
        rotation: random() * Math.PI * 2,
      }));
    // Spatial batches keep distant shrubs out of the camera and shadow passes.
    const chunks = new Map();
    for (const location of locations) {
      const key = `${Math.floor(location.x / 80)}:${Math.floor(location.z / 80)}`;
      const chunk = chunks.get(key) || [];
      chunk.push(location);
      chunks.set(key, chunk);
    }
    for (const chunk of chunks.values())
      this.instances(parts, chunk, "landscape-shrub");
  }
  update(player, time) {
    if (!this.treeMeshes.length || time < this.nextUpdate) return;
    this.nextUpdate = time + 0.4;
    const nearby = this.treeObjects
      .map((o) => ({
        object: o,
        distance: Math.hypot(o.x - player.x, o.z - player.z),
      }))
      .filter((o) => o.distance < 130)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 36);
    const dummy = new THREE.Object3D();
    for (const mesh of this.treeMeshes) {
      mesh.count = nearby.length;
      nearby.forEach(({ object: tree }, i) => {
        dummy.position.set(tree.x, 0, tree.z);
        dummy.rotation.set(0, tree.x * 0.81 + tree.z * 0.37, 0);
        dummy.scale.setScalar(tree.height * 1.25);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    this.vegetation.hideTrees(new Set(nearby.map((o) => o.object.id)));
  }
}
