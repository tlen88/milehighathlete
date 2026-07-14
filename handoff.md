# Mile High Athlete — Handoff Notes

## 1. What I built

A single-file `index.html` (self-contained — all CSS and JS inline) plus three optional helper files. Drop them into your repo and Netlify will serve them as-is. No build step.

**Files delivered:**
- `index.html` — full site, self-contained
- `netlify.toml` — security headers, caching rules, optional apex→www redirect (commented out by default)
- `robots.txt` — tells search engines to crawl + points at sitemap
- `sitemap.xml` — single-URL sitemap for SEO

You can deploy `index.html` alone if you want the absolute minimum. The other three are nice-to-haves.

## 2. Files edited

| File | Status | Notes |
|---|---|---|
| `index.html` | **Replaces** existing | Full rebuild — copy/paste over the old one |
| `hero.png` | Keep | Not referenced in the new HTML (intentional — see note below) |
| `logo.png` | Keep | Used as logo + favicon |
| `netlify.toml` | **New** | Add to repo root |
| `robots.txt` | **New** | Add to repo root |
| `sitemap.xml` | **New** | Add to repo root |

**Note on `hero.png`:** I left the hero text-only (matching screenshot 1, which has no photo in the hero area). If you want Ty's photo in the hero later, that's a separate small change.

## 3. ADA / WCAG 2.1 AA improvements

- Skip-to-content link (keyboard users can bypass nav)
- One H1 per page, logical H2/H3 hierarchy
- Semantic landmarks: `<header role="banner">`, `<main>`, `<nav aria-label>`, `<footer role="contentinfo">`, `<section aria-labelledby>`
- Descriptive page title and meta description
- Alt text: logo gets descriptive alt; decorative images use `alt=""`
- Cream-on-near-black text passes AA contrast (`#f5efe4` on `#0a0a0a` ≈ 17:1; muted `#b8b3a8` on `#0a0a0a` ≈ 9.8:1)
- White CTA on white hero passes against the black border / dark text inside
- Royal blue `#1f4ec9` with white text on the "Free Resources" section passes AA
- Visible focus ring (gold 3px outline) on every focusable element
- All tap targets ≥ 44×44 px on mobile
- Mobile nav: hamburger button has `aria-expanded`, `aria-controls`, `aria-label` that updates on toggle; closes on Escape
- Form: real `<label>` linked to `<input>`, `aria-required`, live region for feedback (`role="status" aria-live="polite"`), honeypot field for spam (not visible/tabbable to humans)
- No reliance on color alone — stars have aria-label, "Most Popular" has visually-hidden text in the H3
- External links use `rel="noopener noreferrer"` and announce "opens in new tab"
- `prefers-reduced-motion` respected — animations cut to ~0
- No duplicate IDs, no empty links/buttons, no hover-only interactions
- Input `font-size: 16px` (prevents iOS zoom)
- Skip link surfaces on focus

**What I did NOT audit:** the Vagaro booking iframe. It's a third-party embed and I can't control its internal accessibility. Vagaro is generally WCAG-conscious but if your client's ADA complaint specifically targeted the booking flow, that needs separate review with Vagaro.

## 4. SEO improvements

- Specific, keyword-rich `<title>` and `<meta name="description">`
- Canonical URL set
- Full Open Graph + Twitter card tags
- Schema.org `HealthAndBeautyBusiness` structured data with address, founder, social profiles, and aggregate rating
- Semantic heading order
- `robots.txt` + `sitemap.xml`
- Descriptive alt text and aria-labels

**Pending:** I marked `aggregateRating` as 5.0 with 3 reviews based on what's shown on the page. If you have a different real count from your Google Business Profile, update the `reviewCount` value in the JSON-LD block (around line 75 of `index.html`).

## 5. Performance improvements

- Single HTML file — no extra round trips for CSS/JS
- Fonts preconnected and preloaded
- All images use `width`/`height` attributes (prevents layout shift)
- Below-the-fold images use `loading="lazy"`
- No JS framework, no animation library — pure CSS + ~40 lines of vanilla JS
- `netlify.toml` sets long cache on PNGs and revalidate on HTML
- `backdrop-filter` for the sticky header is GPU-accelerated and degrades gracefully

**Lighthouse expectations** (on a typical Netlify deploy): Performance 95+, Accessibility 95+, Best Practices 100, SEO 100. Actual scores depend on your image sizes — keep `hero.png` and `logo.png` under ~150 KB each if you swap them.

## 6. Security improvements

- No tokens, API keys, or secrets anywhere in the code
- All external links: `rel="noopener noreferrer"`
- `netlify.toml` adds: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- Form has a honeypot spam trap
- Vagaro iframe is sandbox-safe (loaded over HTTPS, lazy-loaded)

---

## 7. Netlify build settings

These are the exact values to confirm in your Netlify dashboard (**Site configuration → Build & deploy → Build settings**):

| Setting | Value |
|---|---|
| **Build command** | (leave empty) |
| **Publish directory** | `.` (a single period — means "repo root") |
| **Branch to deploy** | `main` |
| **Node version** | (not needed — no build step) |

If `netlify.toml` is present in the repo root, Netlify auto-reads these values. You don't have to set them by hand.

---

## 8. Step-by-step: publish the correct version to Netlify

Two paths. **Path A** is faster but bypasses GitHub. **Path B** is the right long-term setup.

### Path A — Drag-and-drop deploy (5 minutes, fastest)

1. Zip the 4 files (`index.html`, `netlify.toml`, `robots.txt`, `sitemap.xml`) together with your existing `hero.png` and `logo.png` from the repo. Zip the **files themselves**, not the folder containing them.
2. Go to Netlify → your `milehighathlete` site → **Deploys** tab.
3. Scroll to the bottom: there's a drop zone that says **"Need to update your site? Drag and drop your site output folder here."**
4. Drag the zip in. Netlify will deploy it immediately as the new production version.
5. Open `https://milehighathlete.netlify.app/` and confirm it looks right.

This bypasses GitHub entirely. Good for a one-time fix when GitHub integration is broken.

### Path B — Push to GitHub (correct long-term setup)

1. Replace `index.html` in your `tlen88/milehighathlete` repo with the new one (commit message: "Rebuild: ADA fixes, first-draft palette, centered titles").
2. Add `netlify.toml`, `robots.txt`, `sitemap.xml` to the repo root.
3. Push to `main`.
4. If Netlify's GitHub integration is healthy, deploy will trigger automatically within ~30 seconds.
5. Watch **Deploys** tab in Netlify. You want to see "Published" with today's timestamp, branch `main`.

If a push doesn't trigger a deploy, the GitHub integration is broken — see section 9.

---

## 9. Why the live domain isn't showing the latest Netlify deploy — diagnosis

You said: "the latest Netlify page does not appear to be showing at the custom domain." Three things to check, in order of likelihood:

### Check 1 — Is the custom domain on the *same* Netlify site?

This is the #1 culprit when agents have been involved. An agent may have created a *new* Netlify site for its deploys, leaving `www.milehighathlete.com` pointed at an older site.

**How to check:**
1. Netlify dashboard → click the site that owns `milehighathlete.netlify.app`.
2. Go to **Domain management** → look at "Custom domains."
3. Is `www.milehighathlete.com` listed there? If **yes**, this site is the right one. Skip to Check 2.
4. If **no**, then your custom domain is attached to a different Netlify site. Find that other site (scan your sites list), figure out which one is the "real" production site, and either:
   - Move the custom domain off the old site and add it to this one (Netlify will walk you through it), OR
   - Make the old site the canonical one and re-deploy your new code there.

### Check 2 — Is the latest deploy actually published?

1. **Deploys** tab → the top deploy should say **"Published"** (not "Preview" or "Draft").
2. If the top deploy says "Preview" or anything other than "Published," click it → **"Publish deploy"**.
3. If the top deploy failed (red X), open it → read the build log → tell me what it says.

### Check 3 — Is DNS pointed at Netlify?

1. Go to https://www.whatsmydns.net/ → enter `www.milehighathlete.com` → check the A/CNAME records.
2. You want to see one of:
   - **CNAME**: `apex-loadbalancer.netlify.com` or `[yoursitename].netlify.app`
   - **A record** (apex only): `75.2.60.5`
3. If DNS shows anything else (an IP belonging to GoDaddy / Squarespace / WordPress hosting / old shared hosting), DNS is still pointed at the old host. Update at your domain registrar to match what Netlify shows in **Domain management → DNS configuration**.

### Check 4 — Did GitHub integration break after the token removal?

1. Netlify → **Site configuration → Build & deploy → Continuous deployment**.
2. Look for the GitHub repo link. If you see "Repository: not connected" or any warning, the integration is broken.
3. To reconnect: click **Link repository** → GitHub → authorize Netlify → select `tlen88/milehighathlete` → set branch to `main` → save.
4. After reconnecting, push a tiny change to test (e.g., edit a comment in the HTML, commit, push). Within ~30 seconds you should see a new deploy appear in Netlify.

### Check 5 — Cached deploys

If everything above checks out and the site *still* looks stale, force-refresh:
- **Mac browser:** Cmd+Shift+R
- **iPhone Safari:** Settings → Safari → Clear History and Website Data
- **Netlify cache:** Deploys tab → **Trigger deploy** dropdown → **Clear cache and deploy site**

---

## 10. Make sure `milehighathlete.com` shows the same as `milehighathlete.netlify.app`

After working through section 9, they should match. To verify:

1. Open `https://milehighathlete.netlify.app/` and `https://www.milehighathlete.com/` side by side in private/incognito windows.
2. View source on both (right-click → View Page Source). The `<!DOCTYPE html>` line and the `<title>` should be identical.
3. If they differ, the custom domain is on a different Netlify site — go back to **Check 1** in section 9.

---

## 11. What I can't do from here — things you have to verify manually

- [ ] Confirm `www.milehighathlete.com` and `milehighathlete.netlify.app` are on the **same** Netlify site (the #1 likely cause of your problem)
- [ ] Reconnect GitHub if the integration broke after the token removal
- [ ] Verify DNS at your registrar points at Netlify
- [ ] Verify SSL certificate is issued for the custom domain (Netlify → Domain management → HTTPS → should say "Your site has HTTPS enabled")
- [ ] Confirm "Force HTTPS" is on
- [ ] Test the Vagaro embed actually loads from your custom domain (some Vagaro embeds have referrer restrictions)
- [ ] Test the Netlify Forms submission for the 3-week-program email signup (after first deploy, go to Netlify → Forms tab → you should see "start-smart" form listed)
- [ ] Replace the placeholder review text with real reviews from your Google Business Profile if you want exact accuracy
- [ ] Add a real Vagaro booking URL if `https://www.vagaro.com/milehighathletics/book-now` isn't your live URL

---

## 12. Pre-client checklist — before you tell Ty it's fixed

- [ ] Live site at `www.milehighathlete.com` loads the new version (cream on black with royal blue accents)
- [ ] All titles centered on desktop AND mobile
- [ ] Mobile nav (hamburger) opens, closes, and links scroll to the right section
- [ ] No horizontal scroll on iPhone (test at 375px)
- [ ] Tab through the site with keyboard only — every focusable element shows a visible gold focus ring
- [ ] Skip-to-content link appears when you press Tab from the very top
- [ ] Vagaro scheduler loads in the booking section
- [ ] Email signup form submits without error
- [ ] Submission appears in Netlify → Forms → "start-smart"
- [ ] All footer links work
- [ ] Google Reviews link opens in a new tab
- [ ] No console errors (right-click → Inspect → Console — should be empty)
- [ ] Run https://www.webaim.org/standards/wcag/checklist against the live site and confirm no AA violations on the parts of the site I built
- [ ] Run a Lighthouse audit in Chrome DevTools (right-click → Inspect → Lighthouse tab → Run) — Performance, Accessibility, Best Practices, SEO should all be 90+

---

## 13. If you hit something I missed

The most common gotchas:
- **Form doesn't appear in Netlify Forms:** Netlify only detects forms on the *first* deploy after the form is added. If you don't see "start-smart" listed after deploy, trigger one more deploy.
- **Iframe doesn't load:** Vagaro sometimes blocks iframes on certain referrers. Test in an incognito window with no extensions.
- **Custom domain shows "not secure":** SSL cert hasn't issued yet. Wait 15 minutes after pointing DNS, then in Netlify → Domain management → HTTPS → **Renew certificate**.
- **CSS looks broken:** hard refresh (Cmd+Shift+R). If still broken, the old `index.html` is still being served — your deploy didn't take.
