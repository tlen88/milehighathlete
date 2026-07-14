# Bluehost Domain → Netlify Hosting

Domain `milehighathlete.com` is registered at Bluehost; the site is hosted on Netlify. **Do not transfer the domain.** Only DNS records change.

## Recommended: keep Bluehost DNS, point records at Netlify

Simplest and safest — email and registration stay exactly where they are.

In Bluehost → Domains → DNS for `milehighathlete.com`:

| Type | Host | Points to | Why |
|---|---|---|---|
| CNAME | `www` | `<your-site>.netlify.app` | Routes www traffic to Netlify |
| A | `@` (apex) | `75.2.60.5` | Netlify's apex load balancer |

Then in Netlify → Domain management: add both `milehighathlete.com` and `www.milehighathlete.com` as custom domains, choose the primary (the canonical URL in the site is currently `https://milehighathlete.com/` — set the **non-www** as primary, and Netlify will redirect www → apex automatically; if you prefer www as primary, also update `canonical_url` in the SEO section and `sitemap.xml`/`robots.txt`, which currently reference `www`).

> ⚠️ **Consistency note found during audit:** the canonical tag uses `https://milehighathlete.com/` but robots.txt/sitemap.xml use `https://www.milehighathlete.com/`. Pick ONE primary host in Netlify and align the other references. Google treats them as different URLs.

## Alternative: Netlify DNS (nameserver switch)

Netlify → Domain management → "Use Netlify DNS" gives you four nameservers to enter at Bluehost. Easier long-term management, **but you must re-create the MX/email records inside Netlify DNS before switching** or email breaks.

## Email — critical

If Ty's email runs through Bluehost: **do not touch MX records** (and any `mail.*` A record or SPF/TXT records). The CNAME/A changes above don't affect them. If switching to Netlify DNS, copy every MX/TXT record into Netlify DNS first.

## SSL

After DNS propagates (minutes to ~24h), Netlify auto-issues a Let's Encrypt certificate: Domain management → HTTPS → verify "Your site has HTTPS enabled" → turn on **Force HTTPS**. If the cert stalls, wait 15 minutes and click "Renew certificate".

## Zero-downtime order of operations

1. Deploy the new site to Netlify and confirm it works at `<site>.netlify.app`.
2. Add the custom domains in Netlify (it will show "Awaiting external DNS").
3. Change the two records at Bluehost.
4. Verify with https://www.whatsmydns.net — old host keeps serving until propagation completes, so there's no gap.
5. Confirm HTTPS, then Force HTTPS.
6. Send a test email to Ty's address to confirm mail still flows.
