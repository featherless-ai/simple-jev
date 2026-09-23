import * as THREE from "three";
import { assetManager } from "./asset-loading.js";
import { renderProfile } from "./render-profile.js";

export const materials = new Map();
const loader = new THREE.TextureLoader(assetManager);
const maps = new Map();
function texture(name, kind) {
  const key = `${name}-${kind}`;
  if (!maps.has(key)) {
    const value = loader.load(`textures/${key}.jpg`);
    value.wrapS = value.wrapT = THREE.RepeatWrapping;
    value.anisotropy = renderProfile.anisotropy;
    if (kind === "color") value.colorSpace = THREE.SRGBColorSpace;
    maps.set(key, value);
  }
  return maps.get(key);
}

export function pbr(name, tint = "#ffffff", scale = 3) {
  const key = `${name}:${tint}`;
  if (!materials.has(key)) {
    const material = new THREE.MeshStandardMaterial({
      color: tint,
      map: texture(name, "color"),
      normalMap: texture(name, "normal"),
      roughnessMap: texture(name, "roughness"),
      normalScale: new THREE.Vector2(
        name === "grass" ? 0.5 : 0.65,
        name === "grass" ? 0.5 : 0.65,
      ),
      roughness: 0.95,
      metalness: 0,
    });
    material.userData.metersPerTile = scale;
    materials.set(key, material);
  }
  return materials.get(key);
}

export function material(color) {
  if (color?.isMaterial) return color;
  if (materials.has(color)) return materials.get(color);
  const family = {
    "#73817e": ["asphalt", "#d2d5d9", 5],
    "#70817c": ["asphalt", "#c6cbd2", 5],
    "#6d7e79": ["asphalt", "#d2d5d9", 5],
    "#d8d6c9": ["pavement", "#d7d4ca", 2.5],
    "#d2c9a7": ["pavement", "#d1c7af", 2.5],
    "#b2c5a0": ["grass", "#b4bf91", 8],
    "#9eb890": ["grass", "#a5b781", 8],
    "#adbf9d": ["grass", "#bec598", 8],
    "#94ad85": ["grass", "#99ad83", 8],
    "#a8b89c": ["grass", "#afbb8a", 8],
    "#86755c": ["bark", "#b8b0a0", 1.6],
  }[color];
  const value = family
    ? pbr(...family)
    : new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0 });
  materials.set(color, value);
  return value;
}

export function physical(name, options) {
  if (!materials.has(name))
    materials.set(name, new THREE.MeshPhysicalMaterial(options));
  return materials.get(name);
}

// UVs are measured in meters, so maps keep the same grain size on every block.
export function metricUV(geometry, material) {
  const scale = material.userData.metersPerTile;
  if (!scale) return geometry;
  const position = geometry.attributes.position,
    normal = geometry.attributes.normal;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const x = Math.abs(normal.getX(i)),
      y = Math.abs(normal.getY(i)),
      z = Math.abs(normal.getZ(i));
    uv[i * 2] = (x > y && x > z ? position.getZ(i) : position.getX(i)) / scale;
    uv[i * 2 + 1] =
      (y >= x && y >= z ? position.getZ(i) : position.getY(i)) / scale;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}
