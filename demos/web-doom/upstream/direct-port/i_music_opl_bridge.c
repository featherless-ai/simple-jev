// DEPRECATED COMPATIBILITY STUB — NOT COMPILED BY direct-port/Makefile.web.
//
// This file used to bridge LinuxDOOM music calls to direct-port/opl_music.js.
// The WebAudio approximation has been retired. The active music implementation
// is now prepared by direct-port/import_vanilla_opl.py and compiled directly
// into the WebAssembly binary using Vanilla-DMX-compatible OPL register logic
// and Nuked OPL3 v1.8 in OPL2-compatible mode.
//
// The legacy GitHub Actions workflow still copies this path into its temporary
// source tree, so the file remains as an explicit tombstone rather than being
// deleted. It contains no functions and is absent from the Makefile source list.
