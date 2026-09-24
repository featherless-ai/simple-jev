// DEPRECATED COMPATIBILITY STUB — NOT LOADED BY THE DIRECT BUILD.
//
// The former GENMIDI -> WebAudio FM approximation has been retired because it
// did not reproduce the original DOS-era OPL output closely enough. Music now
// lives entirely in the C/WASM build:
//
//   MUS -> Vanilla-DMX-compatible register logic -> Nuked OPL3 v1.8
//       -> OPL2-compatible nine-voice chip mode -> SDL2_mixer
//
// See direct-port/import_vanilla_opl.py and direct-port/Makefile.web.
//
// These constants remain only because the legacy CI workflow still validates
// this path before publishing. No runtime HTML script tag loads this file.
const OPL_VOICE_LIMIT = 9;
const GENMIDI_LEGACY_CI_MARKER = 'GENMIDI';
