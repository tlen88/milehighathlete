# Testing Report — CMS Conversion (July 11, 2026)

## Environment
Static analysis + build execution in a sandboxed Linux environment (Node 22). The design layer (`style.css`, `main.js` behavior) was **not modified** except for the additive invite-token redirect, so visual/responsive behavior is inherited unchanged from the approved live site.

## Automated tests run — all PASSED

| Test | Result |
|---|---|
| `node build.js` completes | ✅ renders + copies, exits 0 |
| JS syntax (`node --check`) on main.js, build.js, template | ✅ |
| `admin/content/config.yml` parses as valid YAML | ✅ 8 sections |
| Schema ↔ JSON parity (every JSON key in schema, every schema field in JSON — protects against Decap dropping data on save) | ✅ no drift |
| Generated HTML vs. approved live HTML diff | ✅ only intentional changes (see below) |
| Duplicate IDs in generated page | ✅ none |
| Every internal `#anchor` has a target | ✅ about, services, results, booking, main-content |
| Every referenced local asset exists in dist | ✅ |
| `href="#"` placeholders / dead links | ✅ zero |
| Exactly one `<h1>` | ✅ |
| Sticky-header offset (`scroll-margin-top`) still present | ✅ |
| Content validation rules fire (oversize title, >6 programs, non-Vagaro URL) | ✅ build fails with plain-English error |

## Intentional differences from the previous live HTML
1. CSP moved from netlify.toml into a `<meta>` tag (so the portal isn't blocked by the public policy).
2. Asset paths made root-absolute (`/style.css` …) — required for CMS-uploaded image paths.
3. Schema.org `HealthAndBeautyBusiness` JSON-LD restored (was in the original handoff spec, missing from the v2 rebuild).
4. Apostrophes rendered as `&#39;` (visually identical — output escaping).
5. Stable slug-based card/review IDs instead of `card1/rev1`.
6. Discreet "Site Manager" link added to the footer.
7. `robots.txt` now disallows `/admin/`; `/admin/*` also gets an `X-Robots-Tag: noindex` header.

## NOT tested here (requires the live, Git-connected Netlify site) — see DEPLOYMENT-CHECKLIST.md section C
- Netlify Identity login / logout / password reset (needs Identity enabled on the real site)
- Git Gateway draft save → publish → auto-deploy loop
- Image upload through the CMS UI
- Vagaro iframe load from the production domain
- Real-device mobile/tablet rendering (inherited CSS is unchanged, but verify per checklist)

These are covered step-by-step in `docs/DEPLOYMENT-CHECKLIST.md` § C, and none of them can be truthfully verified from a local environment. **No feature above is claimed as "working" until that checklist is run on the live site.**

## Known limitations / honest notes
- The drag-and-drop folder deploys a fully working public site, but portal **editing** requires the Git-connected setup (documented in the folder's README-DEPLOY.txt).
- Local quirk only: four legacy image files in `images/` are iCloud-offloaded and unreadable on this machine; the build intentionally skips them (`SKIP_LEGACY`) — they are superseded duplicates retained for reference.
- Canonical URL (`milehighathlete.com`) vs. sitemap/robots (`www.`) host mismatch pre-dates this work — flagged in BLUEHOST-DNS.md to resolve at domain cutover.
