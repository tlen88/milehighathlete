# CMS Architecture Decision — Mile High Athletics

**Date:** July 11, 2026

## Selected: Decap CMS (Git-based) + Netlify Identity + Git Gateway

The site is a single static page (HTML/CSS/vanilla JS, no framework) already deployed on Netlify from the GitHub repo `tlen88/milehighathlete`. That profile makes a Git-backed CMS the natural fit: content lives as JSON files in the repo, the CMS edits those files through Netlify's Git Gateway, and every publish triggers Netlify's normal build-and-deploy.

## Why Decap over the alternatives

| Option | Verdict |
|---|---|
| **Decap CMS** ✅ | Free, open source, purpose-built for exactly this Netlify + Git setup. Editors log in with **email + password** (Netlify Identity invite) — Ty never sees GitHub. Drafts via editorial workflow. Version history and rollback come free from Git. Zero servers, zero database, ~zero monthly cost. |
| CloudCannon | Excellent client UX, but **$45+/month** — unjustified for a one-page site. |
| TinaCMS | Free tier works, but requires the TinaCloud service, a React-oriented build toolchain, and a heavier restructuring. Overkill here. |
| Sanity / Supabase / Firebase / Payload | All introduce a hosted database or server layer for content that is eight small JSON files. More cost, more accounts, more failure modes, no benefit. |
| WordPress | Full platform migration, hosting costs, plugin/security maintenance. Explicitly rejected. |
| Custom admin dashboard | Bespoke auth + editor + Git plumbing = large build and permanent maintenance burden vs. a mature open-source tool. |

## Authentication note (2026)

Netlify announced, then **reversed**, the deprecation of Netlify Identity — as of February 2026 Identity continues as a supported product ([Netlify blog](https://www.netlify.com/blog/auth0-extension-identity-changes/)). Should that ever change, **[DecapBridge](https://decapbridge.com)** is a free drop-in replacement auth service built for Decap CMS; migration is a ~10-line change in `admin/content/config.yml`. This risk is documented, not blocking.

## Costs & accounts

- **Monthly cost: $0** (Netlify free tier + open-source CMS; Identity free tier covers invite-only editors).
- **Accounts needed:** existing Netlify account, existing GitHub repo, Ty's email (invited via Identity). Ty needs **no** GitHub/Netlify account.

## How it works end-to-end

1. Ty logs in at `/admin/` with email + password (Netlify Identity).
2. Decap CMS (at `/admin/content/`) loads the eight JSON files in `content/` through Git Gateway.
3. Saving creates a **draft** (editorial workflow — a PR under the hood, never shown to Ty).
4. **Publish** merges to `main` → Netlify runs `node build.js` → `templates/index.template.js` re-renders `dist/index.html` from the JSON → the site is live.
5. Every published version is a Git commit — full history, one-command rollback.
