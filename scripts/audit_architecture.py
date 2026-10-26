#!/usr/bin/env python3
"""Audit the build graph and growth budget without executing the application.

This does NOT label unlisted files safe to delete. Some are history, tests or
reference material. It distinguishes real bundle inputs from repository bulk.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src/build.json"
BUDGET = ROOT / "docs/architecture-budget.json"


def file_info(path: Path) -> dict:
    rel = path.relative_to(ROOT).as_posix()
    return {"path": rel, "bytes": path.stat().st_size}


def inventory() -> dict:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    budget = json.loads(BUDGET.read_text(encoding="utf-8"))
    js = manifest["browser_modules"]
    css = manifest["style_modules"]
    assets = list(manifest["assets"])
    sources = js + css + assets + [
        manifest["browser_template"], manifest["scriptable_template"]
    ]
    issues = []
    for name, paths in (("browser_modules", js), ("style_modules", css),
                        ("assets", assets)):
        if len(paths) != len(set(paths)):
            issues.append(f"duplicate entries in {name}")
    for p in sources:
        path = (ROOT / p).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            issues.append(f"invalid or missing input: {p}")
    if len(js) > budget["max_browser_modules"]:
        issues.append("browser module count exceeds reviewed growth budget")
    if len(css) > budget["max_style_modules"]:
        issues.append("stylesheet count exceeds reviewed growth budget")

    browser_files = sorted((ROOT / "src/browser").glob("*.js"))
    style_files = sorted((ROOT / "src/styles").glob("*.css"))
    dormant_js = [p for p in browser_files if p.relative_to(ROOT).as_posix() not in js]
    dormant_css = [p for p in style_files if p.relative_to(ROOT).as_posix() not in css]
    in_bundle = [ROOT / p for p in sources if (ROOT / p).is_file()]
    dist_files = [p for p in (ROOT / "dist").rglob("*") if p.is_file()]
    root_release = [p for p in ROOT.glob("NERV_COMMAND_v*_SCRIPTABLE.js") if p.is_file()]
    families = {}
    for path in js:
        name = Path(path).name
        match = re.match(r"v(\d+)(?:\d+)?[-_]", name)
        family = "v" + match[1] if match else ("vendor" if "/vendor/" in path else "core")
        families[family] = families.get(family, 0) + 1
    # SHA groups point to exact byte duplicates, not merely similar functionality.
    digest_to_paths = {}
    for p in browser_files + style_files:
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        digest_to_paths.setdefault(h, []).append(p.relative_to(ROOT).as_posix())
    exact_duplicates = [v for v in digest_to_paths.values() if len(v) > 1]

    return {
        "version": manifest["version"],
        "growth_budget": budget,
        "loaded": {
            "browser_modules": len(js),
            "style_modules": len(css),
            "artwork_assets": len(assets),
            "js_bytes": sum((ROOT / p).stat().st_size for p in js if (ROOT / p).is_file()),
            "css_bytes": sum((ROOT / p).stat().st_size for p in css if (ROOT / p).is_file()),
            "artwork_bytes": sum((ROOT / p).stat().st_size for p in assets if (ROOT / p).is_file()),
            "families": dict(sorted(families.items())),
        },
        "not_in_build_manifest": {
            "browser": [file_info(p) for p in dormant_js],
            "styles": [file_info(p) for p in dormant_css],
            "warning": "NOT proof of dead code; do not remove without dependency, save and browser tests",
        },
        "repository_bulk": {
            "dist_file_count": len(dist_files),
            "dist_bytes": sum(p.stat().st_size for p in dist_files),
            "historical_full_runtime_count": len(root_release),
            "historical_full_runtime_bytes": sum(p.stat().st_size for p in root_release),
        },
        "exact_duplicate_source_groups": exact_duplicates,
        "issues": issues,
    }


def markdown(report: dict) -> str:
    loaded = report["loaded"]
    unused = report["not_in_build_manifest"]
    bulk = report["repository_bulk"]
    out = [
        "# NERV-COMMAND architecture audit",
        "",
        f"Version: {report['version']}. This is a source inventory, not a deletion plan.",
        "",
        f"- Manifest: {loaded['browser_modules']} JS modules, {loaded['style_modules']} CSS modules, "
        f"{loaded['artwork_assets']} artwork assets.",
        f"- Selected source bytes (before packaging): {loaded['js_bytes']:,} JS, "
        f"{loaded['css_bytes']:,} CSS, {loaded['artwork_bytes']:,} artwork.",
        f"- Not included in build: {len(unused['browser'])} browser JS, "
        f"{len(unused['styles'])} stylesheets; inspect references before removal.",
        f"- Checked-in dist: {bulk['dist_file_count']} files / {bulk['dist_bytes']:,} bytes. "
        "These are archival/generated content; Git history remains even if HEAD files are deleted.",
        f"- Complete runtime copies at repository root: {bulk['historical_full_runtime_count']}.",
        "",
        "## Files excluded from the production manifest",
        "",
    ]
    out.extend("- " + f["path"] for f in unused["browser"] + unused["styles"])
    out.extend(["", "## Exact-byte duplicate groups", ""])
    for group in report["exact_duplicate_source_groups"]:
        out.append("- " + ", ".join(group))
    if not report["exact_duplicate_source_groups"]:
        out.append("No exact-byte duplicates in src/browser and src/styles.")
    out.extend(["", "## Guardrail findings", ""])
    out.extend("- " + issue for issue in report["issues"])
    if not report["issues"]:
        out.append("All build inputs exist, entries are unique, and reviewed module budgets hold.")
    out.extend(["", "## Scope disclaimer", "",
                "This audit cannot identify runtime ownership, save migration safety, CSS selector "
                "overrides, or hidden global coupling. Prove those with targeted tests before deleting.",
                ""])
    return "\n".join(out)


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--check", action="store_true", help="fail on missing/duplicate inputs or budget overrun")
    p.add_argument("--out-dir", default="test-results", help="generated report output directory")
    args = p.parse_args()
    result = inventory()
    target = ROOT / args.out_dir
    target.mkdir(parents=True, exist_ok=True)
    (target / "architecture-audit.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (target / "architecture-audit.md").write_text(markdown(result), encoding="utf-8")
    print(f"Architecture: {result['loaded']['browser_modules']} JS / "
          f"{result['loaded']['style_modules']} CSS; "
          f"{len(result['not_in_build_manifest']['browser'])} excluded JS / "
          f"{len(result['not_in_build_manifest']['styles'])} excluded CSS; "
          f"{result['repository_bulk']['dist_bytes']:,} checked-in dist bytes")
    for issue in result["issues"]:
        print("ISSUE:", issue)
    return 1 if args.check and result["issues"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
