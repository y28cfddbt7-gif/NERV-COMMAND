# Anime.js 4.5.0

Official unmodified UMD bundle from https://raw.githubusercontent.com/juliangarnier/anime/v4.5.0/dist/bundles/anime.umd.min.js

MIT license: ANIMEJS_LICENSE.txt, fetched at the same tag. SHA-256 values are recorded in tests/fixtures/v2_15_additions.json. No runtime CDN request is used. The neighboring small wrappers skip the vendor in the historical minimal Node DOM mock, and disable Anime.js's default RAF loop. src/browser/v215-motion.js uses NERV_FX.registerHook so bounded transitions share the existing scheduler, quality budget and visibility/reduced-motion controls.
