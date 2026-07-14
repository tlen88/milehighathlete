# Deployment Checklist — Mile High Athletics

## A. First deploy of the new build (either path)

**Path 1 — Git (recommended, required for the portal):**
- [ ] Commit & push everything except `dist/` (gitignored) to `tlen88/milehighathlete`, branch `main`
- [ ] Netlify → confirm repo is linked, branch `main`
- [ ] Confirm build settings auto-read from netlify.toml: command `node build.js`, publish `dist`
- [ ] Deploy runs green; site loads at `<site>.netlify.app`

**Path 2 — Drag-and-drop (preview / stopgap; portal editing will NOT work yet):**
- [ ] Drag the `ty-website-netlify-deploy` folder onto Netlify → Deploys
- [ ] Site loads; note that CMS login/publish requires Path 1 + Identity setup

## B. Enable the client portal (one time)

- [ ] Site configuration → Identity → **Enable Identity**
- [ ] Identity → Registration → **Invite only**
- [ ] Identity → Services → **Enable Git Gateway**
- [ ] Identity → Invite users → Ty's email
- [ ] Ty accepts invite, sets password, logs in at `/admin/`

## C. Verify after deploy

- [ ] Homepage renders identically to the approved design (desktop, tablet ~768px, phone ~390px)
- [ ] All nav + footer anchors scroll to the right sections
- [ ] Vagaro scheduler loads in the booking section
- [ ] `/admin/` loads; refresh on `/admin/` and `/admin/help/` does NOT 404
- [ ] Log in → open editor → all 8 sections load with real content
- [ ] Make a trivial edit → Save (draft) → live site unchanged
- [ ] Publish the draft → Netlify deploy triggers → change appears on the live site
- [ ] Upload a test image in the editor → appears in `images/uploads/` and renders
- [ ] Delete the test changes (or publish the revert)
- [ ] No browser console errors on `/` and `/admin/`
- [ ] robots.txt, sitemap.xml reachable; `/admin` blocked by robots + X-Robots-Tag

## D. Domain cutover (see docs/BLUEHOST-DNS.md)

- [ ] Custom domains added in Netlify; primary host chosen (align canonical/sitemap/robots to it)
- [ ] Bluehost: `www` CNAME → `<site>.netlify.app`; apex A → `75.2.60.5`
- [ ] MX / email records untouched; test email delivery afterwards
- [ ] HTTPS certificate issued; **Force HTTPS** on
- [ ] `milehighathlete.netlify.app` and the custom domain serve identical content

## E. Handoff

- [ ] Replace SUPPORT CONTACT placeholders in `admin/index.html`, `admin/help/index.html`, `docs/CLIENT-HANDBOOK.md`
- [ ] Send Ty the welcome message (end of FINAL-REPORT.md) + his invite
- [ ] Walk Ty through one edit→publish cycle on a call
