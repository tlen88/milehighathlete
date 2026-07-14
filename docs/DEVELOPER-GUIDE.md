# Developer Handoff Guide — Mile High Athletics

Audience: you (Tara) and any future developer. Ty never needs this file — his guide is `docs/CLIENT-HANDBOOK.md` / the Help page at `/admin/help/`.

## 1. Stack & architecture

- **Framework:** none — hand-written static HTML/CSS/vanilla JS.
- **Content:** eight JSON files in `content/` (hero, about, services, reviews, recovery, booking, site, seo).
- **Template:** `templates/index.template.js` — a zero-dependency Node module that renders `index.html` from the JSON. All layout/classes/ARIA live here; all copy lives in JSON. Every interpolated value is HTML-escaped (`**bold**` is the only allowed inline mark, in About paragraphs).
- **Build:** `node build.js` → validates content (length limits, program count, Vagaro URL), renders `dist/index.html`, copies static assets + `admin/` into `dist/`. No npm dependencies at all.
- **CMS:** Decap CMS 3.x loaded from unpkg in `admin/content/index.html`; schema in `admin/content/config.yml`; backend `git-gateway`, branch `main`, `publish_mode: editorial_workflow` (drafts).
- **Auth:** Netlify Identity (invite-only) + Git Gateway. No env vars, no secrets in repo.
- **Portal:** `/admin/` (branded dashboard) → `/admin/content/` (Decap editor) → `/admin/help/` (client handbook). Shared styles: `admin/portal.css` (mirrors the public site's brand tokens).

## 2. Folder structure

```
├── build.js                  # zero-dep build (validate → render → copy)
├── package.json              # scripts only, no deps
├── templates/index.template.js
├── content/*.json            # ALL editable content
├── admin/                    # client portal (copied into dist)
│   ├── index.html            # dashboard (Identity login state)
│   ├── portal.css
│   ├── content/{index.html,config.yml}   # Decap CMS
│   └── help/index.html       # client handbook (web)
├── style.css, main.js        # public site assets (design-protected)
├── images/                   # site images; uploads/ = CMS media folder
├── netlify.toml, _headers, _redirects, robots.txt, sitemap.xml
├── docs/                     # this documentation set
├── dist/                     # build output (gitignored)
├── ty-website-netlify-deploy/  # drag-and-drop copy of dist
├── _backup-20260711/         # pre-conversion snapshot of live files
└── _backup-20260613/, milehighathlete-netlify-ready*/  # older legacy folders
```

## 3. Build & deploy

- Netlify build command: `node build.js` · publish dir: `dist` · Node 20 (set in `netlify.toml`).
- Local: `npm run build`, then `npm run serve` (or any static server on `dist/`).
- Regenerate the drag-and-drop folder: `node build.js`, then copy `dist/` → `ty-website-netlify-deploy/` (keep `README-DEPLOY.txt`).

## 4. One-time Netlify setup (REQUIRED for the portal to work)

1. Link the site to GitHub repo `tlen88/milehighathlete`, branch `main` (Site configuration → Build & deploy → Continuous deployment). Build command/publish dir auto-read from `netlify.toml`.
2. **Site configuration → Identity → Enable Identity.**
3. Identity → **Registration: Invite only.**
4. Identity → Services → **Enable Git Gateway.**
5. Identity → **Invite users** → Ty's email. He clicks "Accept the invite" (lands on `/#invite_token=…`; `main.js` forwards it to `/admin/`), sets a password, done.
6. Optional: Identity → Emails — customize invite/recovery templates with Ty's name.

Environment variables: **none** (see `.env.example`).

## 5. Editing the CMS

- **Add a field:** add it to the JSON file AND to the matching file block in `admin/content/config.yml` AND render it in `templates/index.template.js`. All three or Decap will drop it on save.
- **Add a new editable section:** create `content/<name>.json`, add a `files:` entry in config.yml, render in the template, add a dashboard card in `admin/index.html`.
- **Field UX rules used:** plain-language labels, `hint:` under every non-obvious field, `pattern:` for length limits, booleans for featured/visible toggles, `min/max` on lists.
- **Media:** uploads go to `images/uploads/` (`public_folder: /images/uploads`). The build copies the whole `images/` tree (minus legacy files listed in `SKIP_LEGACY` in build.js).

## 6. Publishing / rollback / troubleshooting

- Publish = Decap merges the draft PR to `main` → Netlify auto-builds. Typical end-to-end: a few minutes.
- **Rollback options:** (a) Netlify → Deploys → click any older deploy → "Publish deploy" (instant); (b) `git revert` the content commit; (c) edit the JSON back and push.
- **Draft stuck / publish fails:** check Netlify deploy log first — `build.js` fails loudly with a plain-English validation message if content breaks a rule (that's by design). Fix the field in the CMS and publish again.
- **Identity login loop:** confirm Git Gateway is enabled and the user was invited on THIS site (not another Netlify site).
- **Decap fails to load:** it's pinned to `decap-cms@^3.0.0` on unpkg. If a v3 minor breaks something, pin an exact version in `admin/content/index.html`.
- **If Netlify ever kills Identity:** switch `backend` in config.yml per [DecapBridge docs](https://decapbridge.com) — ~10 lines, no content changes.

## 7. Design protection

Ty's portal cannot touch: `style.css`, `main.js`, the template, layout/classes, fonts, colors, nav anchors, booking iframe markup (URL is editable but pattern-locked to `vagaro.com`), build or Netlify config. Validation limits: ≤6 programs, ≤9 reviews, 1–4 hero stats, length caps on headline/badge/button fields, title ≤70 chars, meta description ≤170.

## 8. DNS

See `docs/BLUEHOST-DNS.md`. Short version: keep registration + email (MX) at Bluehost, point `www` CNAME → `<site>.netlify.app`, apex A → `75.2.60.5` (or switch nameservers to Netlify DNS), enable HTTPS + Force HTTPS in Netlify.

## 9. Support placeholders

Before handoff, replace the `SUPPORT CONTACT` comment blocks in `admin/index.html` and `admin/help/index.html` with your real name/email/phone. (Not pre-filled on purpose — no invented contact info.)
