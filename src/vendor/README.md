# Anime.js 4.5.0

Official unmodified UMD bundle from https://raw.githubusercontent.com/juliangarnier/anime/v4.5.0/dist/bundles/anime.umd.min.js

MIT license: ANIMEJS_LICENSE.txt, fetched at the same tag. SHA-256 values are recorded in tests/fixtures/v2_15_additions.json. No runtime CDN request is used. The neighboring small wrappers skip the vendor in the historical minimal Node DOM mock, and disable Anime.js's default RAF loop. src/browser/v215-motion.js uses NERV_FX.registerHook so bounded transitions share the existing scheduler, quality budget and visibility/reduced-motion controls.

## Three.js r160 and numeric instance subset (v2.16)

Unmodified UMD: https://raw.githubusercontent.com/mrdoob/three.js/r160/build/three.min.js
MIT: https://raw.githubusercontent.com/mrdoob/three.js/r160/LICENSE (THREE_LICENSE.txt).
The wrapper embeds the complete license and skips the historical minimal Node DOM.
SHA-256 is pinned by tests/fixtures/v2_16_vendor.json. No runtime CDN is used.

src/browser/v216-three-instances.js adapts only numeric position/scale caching and
dirty matrix flushing from https://github.com/juliangarnier/anime/blob/v4.5.0/src/adapters/three/instance.js .
It uses Anime's ordinary getter/setter object path with the existing engine.
This is not the full three adapter: no material/TSL/BatchedMesh/color/rotation support.
See docs/V2_16_RESEARCH.md for exact references, docs access failures and integration.
