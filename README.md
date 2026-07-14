# Mile High Athletics — Website + Client Portal

Static site for milehighathlete.com with a **Decap CMS client portal** so Ty can edit content himself. Zero npm dependencies.

- **Build:** `node build.js` → outputs to `dist/` (Netlify: command `node build.js`, publish `dist`)
- **Content:** `content/*.json` — the ONLY files the CMS edits
- **Design (protected):** `templates/index.template.js`, `style.css`, `main.js`
- **Portal:** `/admin/` (dashboard) → `/admin/content/` (editor) → `/admin/help/` (client handbook)

## Docs

| File | What |
|---|---|
| `docs/DEVELOPER-GUIDE.md` | Architecture, CMS schema, how to extend, troubleshooting |
| `docs/CMS-DECISION.md` | Why Decap + Netlify Identity was chosen |
| `docs/CLIENT-HANDBOOK.md` | Ty's guide (also live at `/admin/help/`) |
| `docs/BLUEHOST-DNS.md` | Pointing the Bluehost domain at Netlify safely |
| `docs/DEPLOYMENT-CHECKLIST.md` | First deploy + Identity setup + verification |
| `docs/TESTING-REPORT.md` | What was tested and what still needs live verification |
| `docs/PHOTO-PLAN.md` | Shot list for the remodeled-gym photo shoot |
| `FINAL-REPORT.md` | Complete conversion report |

## Quick start (developer)

```bash
node build.js     # build into dist/
npx serve dist    # preview locally
```

One-time Netlify setup for the portal: Identity → Enable → Invite-only → Git Gateway → invite Ty. Details in the developer guide. No environment variables required (`.env.example`).

`ty-website-netlify-deploy/` is a drag-and-drop copy of the production build (public site only — portal editing needs the Git-connected site).
