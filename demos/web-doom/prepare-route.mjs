// Usage: node demos/web-doom/prepare-route.mjs /path/to/pinned/web-doom
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.argv[2];
if (!root) throw Error('Pass the upstream checkout pinned in UPSTREAM_COMMIT.');
const moduleAt = name => import(pathToFileURL(resolve(root, 'mcp', name)));
const { GeometryWorkspace } = await moduleAt('geometry.js');
const { installThingAuthoring } = await moduleAt('thing_authoring.js');
const { buildNavigationGraph, findExitProgression } = await moduleAt('navigation_graph.js');
installThingAuthoring(GeometryWorkspace);
const workspace = new GeometryWorkspace(await readFile(resolve(root, 'doom1.wad')), 'E1M1');
const graph = buildNavigationGraph(workspace);
const start = graph.things.starts.find(thing => thing.doomEdNum === 1);
const progression = findExitProgression(graph, start.sector, { includeSecret: false });
if (!progression.found) throw Error('No route to the exit.');
// Upstream makes geometry non-enumerable. Include it explicitly so the
// browser can plan around walls instead of following straight portal lines.
await writeFile(new URL('../../website/cool-demo/doom/vendor/e1m1.json', import.meta.url),
  JSON.stringify({ map: 'E1M1', graph: { ...graph, geometry: graph.geometry }, start, progression }));
