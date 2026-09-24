# Web DOOM source reference

The hosted demo is in `website/cool-demo/doom/`. Its README records behavior, provenance and modifications.

`UPSTREAM_COMMIT` pins https://github.com/pavy23/web-doom. The `upstream/direct-port/` directory retains the source and build scripts corresponding to the vendored runtime. The engine artifacts are copied from that revision's `direct/` release; they are not rebuilt by the Simple Jev website.

The original engine and audio sources are identified by the upstream build scripts. See `upstream/COPYING` and the hosted demo's `vendor/SOURCE.txt` for license and credits.
