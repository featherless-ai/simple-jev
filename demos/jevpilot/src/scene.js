import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { signalState } from "./world.js";
import { RoadVectors } from "./road-vectors.js";
import { CrashEffects } from "./crash-effects.js";
import { dist } from "./math.js";
import {
  materials as M,
  material as mat,
  pbr,
  physical,
  metricUV,
} from "./materials.js";
import { CameraInput } from "./camera-input.js";
import { SceneryAssets } from "./scenery-assets.js";
import { Vegetation } from "./vegetation.js";
import { loadHeroCar, updateHeroWheels } from "./model-assets.js";
import { detailedCar } from "./vehicle-model.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { assetManager, assetsReady } from "./asset-loading.js";
import { renderProfile } from "./render-profile.js";
let daylight;
function daylightEnvironment() {
  return (daylight ||= new HDRLoader(assetManager)
    .loadAsync("textures/daylight.hdr")
    .then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    }));
}
function box(parent, w, h, d, x, y, z, color, rotation = 0) {
  const m = new THREE.Mesh(
    metricUV(new THREE.BoxGeometry(w, h, d), mat(color)),
    mat(color),
  );
  m.position.set(x, y, z);
  m.rotation.y = rotation;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function cone(parent, r, h, x, y, z, color, segments = 5) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, segments), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
function sphere(parent, r, x, y, z, color) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
function cyl(parent, r, h, x, y, z, color, segments = 8) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, segments),
    mat(color),
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
function label(text, bg = "#f2eee4", fg = "#304c46", w = 128, h = 64) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = `bold ${h * 0.49}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(c);
}
function interstateGuide({ text, detail, direction = "straight" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#126b48";
  ctx.fillRect(0, 0, 768, 384);
  ctx.strokeStyle = "#fffef3";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(13, 13, 742, 358, 14);
  ctx.stroke();
  // A red-and-blue interstate shield, separate from the destination legend.
  const shield = new Path2D();
  shield.moveTo(52, 78);
  shield.quadraticCurveTo(133, 53, 214, 78);
  shield.lineTo(209, 184);
  shield.bezierCurveTo(203, 218, 159, 247, 133, 257);
  shield.bezierCurveTo(107, 247, 63, 218, 57, 184);
  shield.closePath();
  ctx.fillStyle = "#17468c";
  ctx.fill(shield);
  ctx.save();
  ctx.clip(shield);
  ctx.fillStyle = "#bd2637";
  ctx.fillRect(40, 50, 190, 68);
  ctx.restore();
  ctx.stroke(shield);
  ctx.beginPath();
  ctx.moveTo(54, 118);
  ctx.lineTo(212, 118);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#fffef3";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("INTERSTATE", 133, 96);
  ctx.font = "bold 86px sans-serif";
  ctx.fillText("08", 133, 179);
  ctx.textAlign = "left";
  ctx.font = "bold 37px sans-serif";
  ctx.fillText("NORTH", 263, 88);
  ctx.font = "bold 39px sans-serif";
  ctx.fillText(text || "Cedar Town", 263, 151, 348);
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(detail || "INTERSTATE 08", 52, 319, 660);
  ctx.save();
  ctx.translate(668, 168);
  ctx.rotate(
    direction === "left"
      ? -Math.PI / 2
      : direction === "right"
        ? Math.PI / 2
        : 0,
  );
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.lineTo(-34, -12);
  ctx.lineTo(-13, -12);
  ctx.lineTo(-13, 44);
  ctx.lineTo(13, 44);
  ctx.lineTo(13, -12);
  ctx.lineTo(34, -12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function mergeModel(group) {
  group.updateMatrixWorld(true);
  const batches = new Map();
  group.traverse((o) => {
    if (!o.isMesh) return;
    const a = batches.get(o.material) || [];
    a.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
    batches.set(o.material, a);
    o.geometry.dispose();
  });
  group.clear();
  for (const [material, geoms] of batches) {
    const mesh = new THREE.Mesh(mergeGeometries(geoms), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    geoms.forEach((g) => g.dispose());
  }
  return group;
}
function keepCameraOutsideBuildings(position, anchor, buildings) {
  const direction = position.clone().sub(anchor),
    length = direction.length();
  if (length < 0.01) return;
  direction.divideScalar(length);
  let distance = length;
  const ray = new THREE.Ray(),
    box = new THREE.Box3(),
    hit = new THREE.Vector3();
  for (const building of buildings) {
    if (
      building.type !== "building" ||
      Math.hypot(building.x - anchor.x, building.z - anchor.z) >
        length + Math.hypot(building.width, building.depth)
    )
      continue;
    const rotation = -(building.rotation || 0);
    ray.origin
      .set(anchor.x - building.x, anchor.y, anchor.z - building.z)
      .applyAxisAngle(THREE.Object3D.DEFAULT_UP, rotation);
    ray.direction
      .copy(direction)
      .applyAxisAngle(THREE.Object3D.DEFAULT_UP, rotation);
    box.min.set(-building.width / 2 - 0.25, 0, -building.depth / 2 - 0.25);
    box.max.set(
      building.width / 2 + 0.25,
      building.height + 2,
      building.depth / 2 + 0.25,
    );
    if (!box.containsPoint(ray.origin) && ray.intersectBox(box, hit))
      distance = Math.min(
        distance,
        Math.max(0.5, hit.distanceTo(ray.origin) - 0.45),
      );
  }
  position.copy(anchor).addScaledVector(direction, distance);
}
export const carModel = detailedCar;
export function personModel(o) {
  const g = new THREE.Group(),
    body = new THREE.Group();
  const color = ["#c27d55", "#8d9cab", "#dec060", "#548975"][
    Number(o.id.split("-").at(-1)) % 4
  ];
  const capsule = (parent, radius, length, x, y, z, color) => {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, 4, 8),
      mat(color),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const torso = capsule(body, 0.21, 0.28, 0, 1.09, 0, color);
  torso.scale.z = 0.62;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    mat("#be9578"),
  );
  head.position.set(0, 1.57, -0.015);
  head.scale.set(0.9, 1.1, 0.95);
  head.castShadow = true;
  body.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.181, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mat("#3b2c23"),
  );
  hair.position.set(0, 1.61, 0);
  body.add(hair);
  capsule(body, 0.065, 0.08, 0, 1.38, 0, "#be9578");
  for (const x of [-0.058, 0.058])
    box(body, 0.025, 0.019, 0.018, x, 1.6, -0.17, "#28201e");
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 6, 6),
    mat("#b8886d"),
  );
  nose.position.set(0, 1.55, -0.182);
  body.add(nose);
  g.add(mergeModel(body));
  const legs = [],
    arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.12, 0.77, 0);
    capsule(leg, 0.08, 0.48, 0, -0.3, 0, "#323c4c");
    box(leg, 0.17, 0.12, 0.28, 0, -0.61, -0.055, "#293936");
    g.add(leg);
    legs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(side * 0.3, 1.31, 0);
    capsule(arm, 0.071, 0.37, 0, -0.24, 0, color);
    capsule(arm, 0.055, 0.07, 0, -0.51, 0, "#be9578");
    g.add(arm);
    arms.push(arm);
  }
  g.userData.limbs = { legs, arms };
  return g;
}
export class DriveScene {
  constructor(canvas, sim, vectorLayer) {
    this.vectorLayer = vectorLayer;
    this.canvas = canvas;
    this.sim = sim;
    this.mode = "chase";
    this.cameraInput = new CameraInput(canvas, () => this.mode);
    this.showSensors = false;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: renderProfile.antialias,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, renderProfile.pixelRatio),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1200);
    this.viewport = { width: canvas.clientWidth, height: canvas.clientHeight };
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.viewport = entry.contentRect;
    });
    this.resizeObserver.observe(canvas);
    this.build();
  }
  build() {
    if (this.scenery) this.scenery.active = false;
    if (this.scene)
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.isInstancedMesh) o.dispose();
        o.customDepthMaterial?.dispose();
        if (o.material && ![...M.values()].includes(o.material)) {
          o.material.map?.dispose();
          o.material.dispose();
        }
        o.shadow?.dispose();
      });
    this.scene = new THREE.Scene();
    const builtScene = this.scene;
    const environmentReady = daylightEnvironment()
      .then((texture) => {
        if (this.scene !== builtScene) return;
        builtScene.environment = builtScene.background = texture;
        builtScene.environmentIntensity = 0.6;
        builtScene.backgroundIntensity = 0.8;
        builtScene.backgroundBlurriness = 0.015;
      })
      .catch((error) =>
        console.warn("Daylight environment unavailable", error),
      );
    this.scene.background = new THREE.Color("#b7c9db");
    this.scene.fog = new THREE.Fog("#b7c6d0", 230, 1050);
    this.scene.add(new THREE.HemisphereLight("#d5e4f8", "#4e503a", 0.4));
    this.sun = new THREE.DirectionalLight("#fff0d9", 3.4);
    this.sun.position.set(-60, 110, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(
      renderProfile.shadowSize,
      renderProfile.shadowSize,
    );
    Object.assign(this.sun.shadow.camera, {
      left: -65,
      right: 65,
      top: 65,
      bottom: -65,
      near: 1,
      far: 240,
    });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 2;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    const world = this.sim.world;
    this.vegetation = new Vegetation(this.scene, world);
    this.static = new THREE.Group();
    const s = this.static;
    box(s, 3000, 0.8, 3000, 0, -0.7, 0, "#b2c5a0");
    // Roads, sidewalks, broken center lines, crossings.
    if (world.type === "highway") this.buildHighway(s, world);
    for (const e of world.type === "highway" ? [] : world.edges) {
      const a = world.byId[e.a],
        b = world.byId[e.b],
        vertical = a.x === b.x,
        len = dist(a, b),
        x = (a.x + b.x) / 2,
        z = (a.z + b.z) / 2;
      box(
        s,
        vertical ? 16 : len + 0.2,
        0.26,
        vertical ? len + 0.2 : 16,
        x,
        -0.12,
        z,
        "#d8d6c9",
      );
      box(
        s,
        vertical ? 12 : len + 0.3,
        0.1,
        vertical ? len + 0.3 : 12,
        x,
        0.015,
        z,
        "#73817e",
      );
      for (let k = 12; k < len - 10; k += 8)
        box(
          s,
          vertical ? 0.13 : 3.2,
          0.02,
          vertical ? 3.2 : 0.13,
          vertical ? x : a.x + k,
          0.081,
          vertical ? a.z + k : z,
          "#d5d7b4",
        );
      for (const dir of [-1, 1])
        box(
          s,
          vertical ? 0.1 : len - 18,
          0.015,
          vertical ? len - 18 : 0.1,
          vertical ? x + dir * 5.5 : x,
          0.077,
          vertical ? z : z + dir * 5.5,
          "#b6c0b0",
        );
    }
    for (const n of world.nodes.filter(
      (node) => world.type !== "highway" || node.townJunction,
    )) {
      box(s, 12.1, 0.1, 12.1, n.x, 0.018, n.z, "#73817e");
      for (const id of n.neighbors) {
        const b = world.byId[id],
          dx = Math.sign(b.x - n.x),
          dz = Math.sign(b.z - n.z);
        for (let k = -4.5; k <= 4.5; k += 1.5)
          box(
            s,
            dx ? 1.8 : 0.7,
            0.021,
            dx ? 0.7 : 1.8,
            n.x + dx * 7 + (dz ? k : 0),
            0.081,
            n.z + dz * 7 + (dx ? k : 0),
            "#ecebd9",
          );
        box(
          s,
          dx ? 0.22 : 5,
          0.025,
          dx ? 5 : 0.22,
          n.x + dx * 10 + (dz ? dz * 3 : 0),
          0.083,
          n.z + dz * 10 + (dx ? -dx * 3 : 0),
          "#ecebd9",
        );
      }
    }
    for (const o of world.objects) {
      if (o.type === "hill") {
        const hill = cone(
          s,
          o.width / 2,
          o.height,
          o.x,
          o.height / 2 - 5,
          o.z,
          "#94ad85",
          7,
        );
        hill.scale.z = 1.3;
        continue;
      }
      if (o.type === "overpass") {
        box(s, o.width, 0.8, o.depth, o.x, o.height, o.z, "#a9b8aa");
        box(s, o.width, 0.12, o.depth - 2, o.x, o.height + 0.5, o.z, "#6d7e79");
        for (const side of [-1, 1]) {
          box(
            s,
            o.width,
            0.8,
            0.3,
            o.x,
            o.height + 0.75,
            o.z + side * (o.depth / 2),
            "#c6cec0",
          );
          for (const x of [-20, 20])
            box(
              s,
              1.6,
              o.height,
              2.5,
              o.x + x,
              o.height / 2,
              o.z + side * 4,
              "#bac5b5",
            );
        }
        continue;
      }
      if (o.type === "highway_sign") {
        for (const x of [-14, 14]) cyl(s, 0.14, 8, o.x + x, 4, o.z, "#8e9f95");
        box(s, 28, 0.25, 0.25, o.x, 8, o.z, "#8e9f95");
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(9, 4.5),
          new THREE.MeshBasicMaterial({
            map: interstateGuide(o),
            side: THREE.FrontSide,
          }),
        );
        sign.position.set(o.x + 6, 7.2, o.z);
        s.add(sign);
        continue;
      }
      if (o.type === "interstate_guide") {
        const sign = new THREE.Group();
        sign.position.set(o.x, 0, o.z);
        sign.rotation.y = -o.approach;
        for (const x of [-2.1, 2.1])
          cyl(sign, 0.09, 4.5, x, 2.25, 0, "#8e9f95");
        box(sign, 6.4, 3.2, 0.13, 0, 4.3, 0, "#8e9f95");
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(6.4, 3.2),
          new THREE.MeshBasicMaterial({ map: interstateGuide(o) }),
        );
        face.position.set(0, 4.3, 0.075);
        sign.add(face);
        s.add(sign);
        continue;
      }
      if (o.type === "town_sign") {
        cyl(s, 0.08, 3, o.x, 1.5, o.z, "#8e9f95");
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(5, 1.4),
          new THREE.MeshBasicMaterial({
            map: label(o.text, "#3a755d", "#eef7e3", 512, 128),
          }),
        );
        sign.position.set(o.x, 2.7, o.z);
        s.add(sign);
        continue;
      }
      if (o.type === "streetlight") {
        cyl(s, 0.075, o.height, o.x, o.height / 2, o.z, "#596b61");
        box(s, 1.3, 0.12, 0.6, o.x - 0.5, o.height, o.z, "#e4e5d7");
        continue;
      }
      if (o.type === "parcel") {
        box(
          s,
          o.width,
          0.18,
          o.depth,
          o.x,
          -0.035,
          o.z,
          o.park ? "#9eb890" : "#adbf9d",
        );
        if (o.park) {
          box(s, 2, 0.03, o.depth, o.x, 0.1, o.z, "#d2c9a7");
          box(s, o.width, 0.03, 2, o.x, 0.11, o.z, "#d2c9a7");
        }
        continue;
      }
      if (o.type === "tree") {
        this.vegetation.tree(s, o);
        continue;
      }
      if (o.type === "bench") {
        box(s, 3, 0.15, 0.8, o.x, 0.7, o.z, "#a78760");
        box(s, 3, 0.75, 0.12, o.x, 1.1, o.z + 0.4, "#a78760");
        for (const d of [-1, 1])
          box(s, 0.15, 0.7, 0.8, o.x + d, 0.35, o.z, "#52645a");
        continue;
      }
      if (o.type === "building") {
        const g = new THREE.Group();
        g.position.set(o.x, 0, o.z);
        g.rotation.y = o.rotation;
        const { width: w, depth: d, height: h } = o;
        box(g, w + 0.6, 0.35, d + 0.6, 0, 0.16, 0, "#e1ddca");
        const tower = o.style === "skyscraper";
        const facade = tower
          ? physical(`facade:${o.color}`, {
              color: new THREE.Color(o.color).lerp(
                new THREE.Color("#31465b"),
                0.72,
              ),
              metalness: 0.48,
              roughness: 0.23,
              clearcoat: 0.55,
            })
          : o.style === "cottage" || o.style === "townhouse"
            ? pbr("brick", "#c5b5a5", 2.8)
            : pbr("pavement", "#c9c7c2", 3.5);
        box(g, w, h, d, 0, h / 2 + 0.3, 0, facade);
        if (tower) {
          for (let floor = 3.8; floor < h; floor += 3.8) {
            box(g, w + 0.07, 0.08, d + 0.07, 0, floor, 0, "#6b727b");
          }
          for (const side of [-1, 1]) {
            for (let col = -w / 2 + 1.6; col < w / 2; col += 1.6)
              box(
                g,
                0.055,
                h,
                0.07,
                col,
                h / 2 + 0.3,
                side * (d / 2 + 0.04),
                "#818a92",
              );
            for (let col = -d / 2 + 1.6; col < d / 2; col += 1.6)
              box(
                g,
                0.07,
                h,
                0.055,
                side * (w / 2 + 0.04),
                h / 2 + 0.3,
                col,
                "#818a92",
              );
          }
          box(
            g,
            w + 0.18,
            0.75,
            d + 0.18,
            0,
            0.6,
            0,
            pbr("pavement", "#898b88", 3),
          );
        }
        if (o.style === "cottage" || o.style === "townhouse") {
          const roof = cone(g, w * 0.77, 3, 0, h + 1.8, 0, o.roof, 4);
          roof.rotation.y = Math.PI / 4;
          roof.scale.z = d / w;
          box(g, 1.1, 2.6, 1.1, w * 0.25, h + 1.5, 0.6, "#b78d72");
        } else {
          box(g, w + 0.5, 0.35, d + 0.5, 0, h + 0.48, 0, o.roof);
          box(g, 2, 0.7, 2, -w * 0.2, h + 1.0, 0, "#a9b2a3");
        }
        for (
          let floor = 0;
          !tower &&
          floor <
            Math.max(1, Math.floor(h / (o.style === "skyscraper" ? 4.5 : 3)));
          floor++
        )
          for (let col = -1; col <= 1; col++) {
            for (const side of [-1, 1]) {
              box(
                g,
                1.5,
                1.65,
                0.1,
                col * w * 0.27,
                2.3 + floor * (o.style === "skyscraper" ? 4.5 : 3),
                side * (d / 2 + 0.04),
                "#f1ead8",
              );
              box(
                g,
                1.2,
                1.35,
                0.12,
                col * w * 0.27,
                2.3 + floor * (o.style === "skyscraper" ? 4.5 : 3),
                side * (d / 2 + 0.09),
                physical("architecture-glass", {
                  color: "#40566b",
                  metalness: 0.4,
                  roughness: 0.14,
                  clearcoat: 0.8,
                }),
              );
              box(
                g,
                0.08,
                1.4,
                0.14,
                col * w * 0.27,
                2.3 + floor * (o.style === "skyscraper" ? 4.5 : 3),
                side * (d / 2 + 0.12),
                "#d9dfca",
              );
            }
            for (const side of [-1, 1])
              box(
                g,
                0.1,
                1.4,
                1.3,
                side * (w / 2 + 0.05),
                2.3 + floor * (o.style === "skyscraper" ? 4.5 : 3),
                col * d * 0.26,
                physical("architecture-glass", {
                  color: "#40566b",
                  metalness: 0.4,
                  roughness: 0.14,
                  clearcoat: 0.8,
                }),
              );
          }
        box(g, 1.3, 2.2, 0.2, 0, 1.4, d / 2 + 0.15, "#776d57");
        box(g, 3, 0.12, 2, 0, 0.35, d / 2 + 1, "#d7d1b8");
        if (o.style === "skyscraper") {
          box(g, w * 0.7, 3, d * 0.7, 0, h + 1.9, 0, "#607d87");
          cyl(g, 0.09, 9, 0, h + 6, 0, "#bdd0cd");
          for (const x of [-w * 0.39, 0, w * 0.39])
            for (const z of [-d / 2 - 0.08, d / 2 + 0.08])
              box(g, 0.13, h, 0.12, x, h / 2 + 0.3, z, "#b5d0d1");
        }
        if (o.style === "shop") {
          box(g, w * 0.9, 0.14, 1.9, 0, 3, d / 2 + 0.75, "#648c80");
          const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(w * 0.7, 1.2),
            new THREE.MeshBasicMaterial({ map: label("MARKET") }),
          );
          sign.position.set(0, h - 0.6, d / 2 + 0.12);
          g.add(sign);
        }
        this.static.add(g);
        continue;
      }
    }
    // Batch by material and city block so offscreen geometry is culled,
    // including buildings outside the moving shadow camera.
    s.updateMatrixWorld(true);
    const batches = new Map(),
      special = [];
    s.traverse((o) => {
      if (!o.isMesh) return;
      if (o.material.map && !o.material.userData.metersPerTile) {
        const copy = o.clone();
        o.matrixWorld.decompose(copy.position, copy.quaternion, copy.scale);
        special.push(copy);
        return;
      }
      const position = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
      const key = `${o.material.uuid}:${Math.floor(position.x / 80)}:${Math.floor(position.z / 80)}`;
      const batch = batches.get(key) || { material: o.material, geoms: [] };
      batch.geoms.push(o.geometry.clone().applyMatrix4(o.matrixWorld));
      batches.set(key, batch);
    });
    for (const { material, geoms } of batches.values()) {
      const mesh = new THREE.Mesh(mergeGeometries(geoms), material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      geoms.forEach((g) => g.dispose());
    }
    special.forEach((o) => this.scene.add(o));
    // Source geometries have been copied into batches.
    s.traverse((o) => o.geometry?.dispose());
    s.clear();
    this.vegetation.finish();
    this.scenery = new SceneryAssets(this.scene, world, this.vegetation);
    this.lights = [];
    for (const o of world.objects.filter(
      (o) => o.type === "traffic_light" || o.type === "stop_sign",
    )) {
      const g = new THREE.Group();
      g.position.set(o.x, 0, o.z);
      g.rotation.y = -o.approach;
      cyl(g, 0.08, o.height, 0, o.height / 2, 0, "#566861", 8);
      if (o.type === "stop_sign") {
        const sign = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.65, 0.1, 8),
          mat("#c4715b"),
        );
        sign.rotation.x = Math.PI / 2;
        sign.position.set(0, 2.45, 0);
        g.add(sign);
        const text = new THREE.Mesh(
          new THREE.PlaneGeometry(0.95, 0.43),
          new THREE.MeshBasicMaterial({
            map: label("STOP", "#c4715b", "#fff4df"),
            side: THREE.DoubleSide,
          }),
        );
        text.position.set(0, 2.45, 0.065);
        g.add(text);
      } else {
        box(g, 0.65, 1.65, 0.38, 0, 4.2, 0, "#344e47");
        for (let i = 0; i < 3; i++) {
          const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.17, 10, 8),
            new THREE.MeshStandardMaterial({
              color: "#394d43",
              emissive: "#000000",
            }),
          );
          lamp.position.set(0, 4.73 - i * 0.5, 0.22);
          g.add(lamp);
          this.lights.push({ mesh: lamp, obj: o, index: i });
        }
      }
      g.userData.control = true;
      this.scene.add(g);
    }
    const route = this.sim.world.route.points;
    this.destination = new THREE.Group();
    const end = route.at(-1);
    this.destination.position.set(end.x, 0.2, end.z);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.13, 8, 48),
      mat("#edfda2"),
    );
    ring.rotation.x = Math.PI / 2;
    this.destination.add(ring);
    const pole = cyl(this.destination, 0.055, 5, 0, 2.5, 0, "#e4f6b3");
    const flag = box(this.destination, 1.8, 1.1, 0.06, 0.85, 4.5, 0, "#dff293");
    this.scene.add(this.destination);
    this.player = carModel("#e2e5e9");
    this.heroCar = null;
    this.wheelDistance = this.sim.distance;
    this.wheelDirection = Math.sign(this.sim.player.speed) || 1;
    this.scene.add(this.player);
    const playerGroup = this.player;
    const carReady = loadHeroCar()
      .then((model) => {
        if (this.player !== playerGroup || this.sim.crash) {
          model.traverse((mesh) => mesh.geometry?.dispose());
          return;
        }
        playerGroup.traverse((mesh) => mesh.geometry?.dispose());
        playerGroup.clear();
        playerGroup.add(model);
        this.heroCar = model;
        playerGroup.userData.sourcedModel = true;
        playerGroup.userData.eyeHeight = model.userData.eyeHeight;
        playerGroup.userData.eyeForward = model.userData.eyeForward;
      })
      .catch((error) => console.warn("Detailed vehicle unavailable", error));
    this.vehicles = new Map();
    this.people = new Map();
    for (const v of this.sim.traffic) {
      const m = carModel(v.color, v.type === "motorcycle");
      this.vehicles.set(v.id, m);
      this.scene.add(m);
    }
    for (const p of this.sim.pedestrians) {
      const m = personModel(p);
      this.people.set(p.id, m);
      this.scene.add(m);
    }
    const vertices = [0, 0.18, 0];
    for (let k = 0; k <= 40; k++) {
      const a = ((-65 + (k * 130) / 40) * Math.PI) / 180;
      vertices.push(Math.sin(a) * 65, 0.18, -Math.cos(a) * 65);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    const idx = [];
    for (let i = 1; i <= 40; i++) idx.push(0, i, i + 1);
    geo.setIndex(idx);
    this.sensorCone = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: "#dbfba0",
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.scene.add(this.sensorCone);
    this.impacts = new CrashEffects(this.scene);
    this.vectors = new RoadVectors(this.scene, this.vectorLayer);
    this.renderer.shadowMap.needsUpdate = true;
    this.snap = true;
    this.ready = Promise.all([environmentReady, carReady, this.scenery.ready]);
  }
  async prepare() {
    await this.ready;
    await assetsReady();
    this.render(0, false);
    // Prepare shaders and upload assets behind the loader, before driving starts.
    await this.renderer.compileAsync(this.scene, this.camera);
    this.render(0);
  }
  dispose() {
    this.resizeObserver.disconnect();
    this.scenery.active = false;
    this.renderer.dispose();
  }
  buildHighway(group, world) {
    const pts = world.roadSamples;
    const strip = (offset, width, color, y, path = pts, skip = null) => {
      const positions = [],
        indices = [];
      for (let i = 0; i < path.length; i++) {
        const a = path[Math.max(0, i - 1)],
          b = path[Math.min(path.length - 1, i + 1)],
          dx = b.x - a.x,
          dz = b.z - a.z,
          len = Math.hypot(dx, dz) || 1;
        for (const side of [-1, 1])
          positions.push(
            path[i].x - (dz / len) * (offset + (side * width) / 2),
            y,
            path[i].z + (dx / len) * (offset + (side * width) / 2),
          );
        if (i < path.length - 1 && !skip?.(path[i])) {
          const k = i * 2;
          indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(metricUV(geo, mat(color)), mat(color));
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    };
    strip(0, 30, "#bbc5b4", 0.01);
    strip(0, 25, "#70817c", 0.045);
    strip(0, 2.1, "#a8b89c", 0.09);
    for (const offset of [-11.7, 11.7])
      strip(
        offset,
        0.14,
        "#e5e9d8",
        0.08,
        pts,
        offset > 0
          ? (p) =>
              world.shoulderOpenings?.some(
                ([start, end]) => p.s >= start && p.s <= end,
              )
          : null,
      );
    for (let i = 0; i < pts.length - 1; i += 4) {
      const p = pts[i],
        q = pts[i + 1],
        h = Math.atan2(q.x - p.x, p.z - q.z);
      for (const side of [-1, 1]) {
        const off = side * 7;
        box(
          group,
          0.13,
          0.018,
          3.2,
          p.x + Math.cos(h) * off,
          0.085,
          p.z + Math.sin(h) * off,
          "#dce2d0",
          -h,
        );
      }
      if (i % 12 === 0)
        box(group, 0.18, 0.75, 1, p.x, 0.45, p.z, "#bac5b7", -h);
    }
    strip(0, 0.25, "#bac5b7", 0.8);
    for (const road of world.connectorRoads || []) {
      const path = road.points;
      const inJunction = (p) =>
        world.nodes.some((n) => n.townJunction && dist(n, p) < 11);
      if (road.twoWay) strip(0, road.width + 3.6, "#d8d6c9", 0.012, path);
      strip(0, road.width, "#70817c", 0.05, path);
      for (const side of [-1, 1]) {
        // Paint a broken boundary where an acceleration/deceleration lane
        // overlaps the carriageway, rather than a solid line across the merge.
        strip(
          side * (road.width / 2 - 0.3),
          0.12,
          "#e5e9d8",
          0.085,
          path,
          (p) =>
            inJunction(p) ||
            (["merge", "exit"].includes(road.kind) &&
              Math.floor(p.s / 4) % 2 === 1),
        );
      }
      if (road.twoWay)
        strip(
          0,
          0.13,
          "#d5d7b4",
          0.087,
          path,
          (p) => inJunction(p) || Math.floor(p.s / 4) % 2 === 1,
        );
    }
    if (world.destinationStopLine) {
      const line = world.destinationStopLine;
      box(
        group,
        4.8,
        0.025,
        0.25,
        line.x,
        0.088,
        line.z,
        "#ecebd9",
        -line.heading,
      );
    }
  }
  render(dt, draw = true) {
    const { width, height } = this.viewport;
    if (!width || !height) return;
    if (
      this.canvas.width !== Math.floor(width * this.renderer.getPixelRatio()) ||
      this.canvas.height !== Math.floor(height * this.renderer.getPixelRatio())
    ) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    const v = this.sim.player;
    this.vegetation.update(this.sim.time);
    this.scenery.update(v, this.sim.time);
    for (const o of this.scene.children)
      if (o.userData.control)
        o.visible = Math.hypot(o.position.x - v.x, o.position.z - v.z) < 170;
    this.player.position.set(v.x, 0, v.z);
    this.player.rotation.y = -v.heading;
    this.wheelDirection = Math.sign(v.speed) || this.wheelDirection;
    if (this.heroCar && !this.sim.paused && !this.sim.crash)
      updateHeroWheels(
        this.heroCar,
        Math.max(0, this.sim.distance - this.wheelDistance) *
          this.wheelDirection,
        v.wheelSteering ?? v.steering,
        v.speed,
      );
    this.wheelDistance = this.sim.distance;
    const insideCar = this.mode === "hood" && !this.sim.crash;
    this.player.traverse((mesh) => {
      if (mesh.isMesh && mesh.material.name === "Glass")
        mesh.visible = !insideCar;
    });
    for (const p of this.sim.traffic) {
      const m = this.vehicles.get(p.id);
      if (m) {
        m.position.set(p.x, 0, p.z);
        m.rotation.y = -p.heading;
      }
    }
    for (const p of this.sim.pedestrians) {
      const m = this.people.get(p.id);
      if (m) {
        m.position.set(
          p.x,
          p.walking ? Math.sin(this.sim.time * 8) * 0.035 : 0,
          p.z,
        );
        m.rotation.y = -(p.heading || 0);
        const stride = p.walking
          ? Math.sin(
              this.sim.time * (p.crossing ? 10 : 5) +
                Number(p.id.split("-").at(-1)),
            ) * 0.42
          : 0;
        m.userData.limbs.legs.forEach(
          (leg, i) => (leg.rotation.x = stride * (i ? -1 : 1)),
        );
        m.userData.limbs.arms.forEach(
          (arm, i) => (arm.rotation.x = stride * (i ? 1 : -1)),
        );
      }
    }
    if (this.sim.crash && !this.impacts.crash) {
      const crash = this.sim.crash;
      const target =
        this.vehicles.get(crash.object_id) || this.people.get(crash.object_id);
      this.impacts.start(
        crash,
        this.player,
        target,
        this.sim.world.objects.find((o) => o.id === crash.object_id),
      );
    }
    this.impacts.update(Math.min(dt, 0.05));
    for (const l of this.lights) {
      const c = signalState(
          this.sim.world.byId[l.obj.nodeId],
          this.sim.time,
          l.obj.approach,
        ).color,
        on = ["red", "amber", "green"][l.index] === c;
      l.mesh.material.color.set(
        on ? ["#f0836b", "#f4cb69", "#afdf92"][l.index] : "#34483e",
      );
      l.mesh.material.emissive.set(
        on ? ["#98301d", "#ad770e", "#508e38"][l.index] : "#000000",
      );
      l.mesh.material.emissiveIntensity = on ? 0.9 : 0;
    }
    this.sensorCone.visible = this.showSensors;
    this.sensorCone.position.set(v.x, 0, v.z);
    this.sensorCone.rotation.y = -v.heading;
    this.destination.children[2].position.y =
      4.5 + Math.sin(this.sim.time * 2) * 0.18;
    let pos, look;
    if (this.sim.crash) {
      const side = this.sim.crash.type === "building" ? -1 : 1;
      pos = new THREE.Vector3(
        v.x - Math.sin(v.heading) * 12 + Math.cos(v.heading) * 8 * side,
        8,
        v.z + Math.cos(v.heading) * 12 + Math.sin(v.heading) * 8 * side,
      );
      look = new THREE.Vector3(v.x, 0.7, v.z);
    } else if (this.mode === "hood") {
      const view = this.cameraInput.current();
      const forward = this.player.userData.eyeForward ?? 0.15;
      pos = new THREE.Vector3(
        v.x + Math.sin(v.heading) * forward - Math.cos(v.heading) * 0.3,
        this.player.userData.eyeHeight || 1.27,
        v.z - Math.cos(v.heading) * forward - Math.sin(v.heading) * 0.3,
      );
      const yaw = v.heading + view.yaw;
      look = pos
        .clone()
        .add(
          new THREE.Vector3(
            Math.sin(yaw) * Math.cos(view.pitch),
            Math.sin(view.pitch),
            -Math.cos(yaw) * Math.cos(view.pitch),
          ).multiplyScalar(25),
        );
    } else {
      const view = this.cameraInput.current(),
        yaw = v.heading + view.yaw;
      const horizontal = Math.cos(view.pitch) * view.distance;
      pos = new THREE.Vector3(
        v.x - Math.sin(yaw) * horizontal,
        Math.sin(view.pitch) * view.distance + 0.7,
        v.z + Math.cos(yaw) * horizontal,
      );
      const ahead = this.mode === "map" ? 0 : 5;
      look = new THREE.Vector3(
        v.x + Math.sin(v.heading) * ahead,
        0.7,
        v.z - Math.cos(v.heading) * ahead,
      );
    }
    this.camera.position.lerp(
      pos,
      this.snap || insideCar ? 1 : 1 - Math.exp(-dt * 4),
    );
    if (!insideCar)
      keepCameraOutsideBuildings(
        this.camera.position,
        new THREE.Vector3(v.x, 1, v.z),
        this.sim.world.objects,
      );
    this.look = this.look || look.clone();
    this.look.lerp(look, this.snap || insideCar ? 1 : 1 - Math.exp(-dt * 6));
    this.camera.lookAt(this.look);
    this.snap = false;
    this.sun.position.set(v.x - 55, 85, v.z + 50);
    this.sun.target.position.set(v.x, 0, v.z);
    this.vectors.render(
      v,
      this.camera,
      width,
      height,
      dt,
      this.sim.autopilot,
      this.sim.paused,
    );

    if (draw) this.renderer.render(this.scene, this.camera);
  }
}
