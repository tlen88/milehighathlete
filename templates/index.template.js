/**
 * Mile High Athletics — index.template.js
 * Renders the public homepage from CMS content (content/*.json).
 *
 * DESIGN IS PROTECTED HERE: all layout, classes, and structure live in this
 * template + style.css. The CMS can only change the text/images/links that
 * are explicitly interpolated below. Every value is HTML-escaped.
 *
 * Zero dependencies. Used by build.js.
 */
'use strict';

/* ── helpers ─────────────────────────────────────────── */

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Escape, then allow the single safe inline mark: **bold** → <strong> */
function rich(str) {
  return esc(str).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/* Join a site-relative path onto the canonical origin for og: tags */
function absUrl(canonical, path) {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = canonical.replace(/\/+$/, '');
  return origin + (path.startsWith('/') ? path : '/' + path);
}

/* slugify a program name into a stable aria/id-safe token */
function slug(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── render ──────────────────────────────────────────── */

function render(c) {
  const { site, seo, hero, about, services, reviews, recovery, booking } = c;

  const ogImage = absUrl(seo.canonical_url, seo.og_image);

  /* Content-Security-Policy lives here (meta) so the admin portal can have
     its own policy. frame-ancestors/X-Frame-Options remain in netlify.toml. */
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://milehighathlete.netlify.app https://milehighathletics.netlify.app",
    "frame-src https://www.vagaro.com https://coachtysonaty.setmore.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.netlify.com",
    "upgrade-insecure-requests"
  ].join('; ');

  /* Schema.org local-business signals, built only from real CMS content */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: site.business_name,
    url: seo.canonical_url,
    image: ogImage,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    founder: { '@type': 'Person', name: site.owner_name },
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address_locality,
      addressRegion: site.address_region,
      addressCountry: 'US'
    },
    sameAs: (site.social || []).map(s => s.url)
  };
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

  /* ── repeatable blocks ─────────────────────────────── */

  const statsHtml = (hero.stats || []).map(s =>
    `            <li><span class="stat-num"${s.aria ? ` aria-label="${esc(s.aria)}"` : ''}>${esc(s.number)}</span><span class="stat-label">${esc(s.label)}</span></li>`
  ).join('\n');

  const badgesHtml = (about.badges || []).map(b =>
    `              <span class="badge">${esc(b)}</span>`
  ).join('\n');

  const paras = arr => (arr || []).map(p => `            <p>${rich(p)}</p>`).join('\n');

  const programsHtml = (services.programs || [])
    .filter(p => p.visible !== false)
    .map((p, i) => {
      const id = `card-${slug(p.name) || i}`;
      const featured = !!p.featured;
      const badge = featured && p.featured_badge
        ? `\n            <p class="card-badge" aria-label="${esc(p.featured_badge)} Program">${esc(p.featured_badge)}</p>`
        : '';
      const items = (p.features || []).map(f => `              <li>${esc(f)}</li>`).join('\n');
      return `          <article class="card${featured ? ' card-featured' : ''}" role="listitem" aria-labelledby="${id}-heading">${badge}
            <h3 id="${id}-heading">${esc(p.name)}</h3>
            <ul aria-label="Features of ${esc(p.name)}">
${items}
            </ul>
            <a href="#booking" class="btn ${featured ? 'btn-card-featured' : 'btn-card'}" aria-label="${esc(p.button_label)} — ${esc(p.name)}">${esc(p.button_label)}</a>
          </article>`;
    }).join('\n\n');

  const reviewsHtml = (reviews.reviews || [])
    .filter(r => r.visible !== false)
    .map((r, i) => {
      const id = `rev-${i + 1}-author`;
      return `          <article class="review-card" role="listitem" aria-labelledby="${id}">
            <p class="review-stars" aria-label="5 out of 5 stars">★★★★★</p>
            <blockquote><p>"${esc(r.quote)}"</p></blockquote>
            <footer><p id="${id}" class="reviewer-name">${esc(r.name)}</p><p class="review-source">${esc(r.source)}</p></footer>
          </article>`;
    }).join('\n\n');

  const socialHtml = (site.social || []).map(s =>
    `          <li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="Follow ${esc(site.owner_name)} on ${esc(s.label)} (opens in new tab)">${esc(s.label)}</a></li>`
  ).join('\n');

  /* ── page ──────────────────────────────────────────── */

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <title>${esc(seo.page_title)}</title>
  <meta name="description" content="${esc(seo.meta_description)}" />
  <meta name="author" content="${esc(site.owner_name)}, ${esc(site.business_name)}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${esc(seo.og_title)}" />
  <meta property="og:description" content="${esc(seo.og_description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(seo.canonical_url)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:image:width" content="${esc(seo.og_image_width)}" />
  <meta property="og:image:height" content="${esc(seo.og_image_height)}" />
  <meta property="og:image:alt" content="${esc(seo.og_image_alt)}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(seo.og_title)}" />
  <meta name="twitter:description" content="${esc(seo.og_description)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />

  <link rel="canonical" href="${esc(seo.canonical_url)}" />
  <link rel="icon" href="/logo-color.png" type="image/png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css" />

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <!-- HEADER -->
  <header class="site-header" role="banner">
    <div class="header-inner">
      <a href="#main-content" class="logo-link" aria-label="Mile High Athlete — return to top">
        <img src="/logo-white-transparent.png" alt="Mile High Athlete logo" width="52" height="52" class="logo-img" />
      </a>

      <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation menu" type="button">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>

      <nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">
        <ul role="list">
          <li><a href="#about">${esc(site.nav.about_label)}</a></li>
          <li><a href="#services">${esc(site.nav.services_label)}</a></li>
          <li><a href="#results">${esc(site.nav.reviews_label)}</a></li>
          <li><a href="#booking" class="nav-cta">${esc(site.nav.cta_label)}</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main-content">

    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-inner container">

        <div class="hero-content">
          <p class="hero-eyebrow">${esc(hero.eyebrow)}</p>

          <h1 id="hero-heading">
            ${esc(hero.heading_before)}
            <em class="hero-accent">${esc(hero.heading_accent)}</em>
            ${esc(hero.heading_after)}
          </h1>

          <p class="hero-subtext">
            ${esc(hero.subtext)}
          </p>

          <div class="hero-ctas">
            <a href="#booking" class="btn btn-primary">${esc(hero.primary_cta_label)}</a>
            <a href="#services" class="btn btn-secondary">${esc(hero.secondary_cta_label)}</a>
          </div>

          <ul class="hero-stats" role="list" aria-label="Coach Ty credentials">
${statsHtml}
          </ul>
        </div>

        <!-- Ty's photo -->
        <div class="hero-photo-wrap" aria-hidden="true">
          <img src="${esc(hero.photo)}" alt="${esc(hero.photo_alt)}" class="hero-photo" width="1350" height="1688" fetchpriority="high" />
          <div class="hero-groundline" aria-hidden="true"></div>
        </div>

      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="section section-about" aria-labelledby="about-heading">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">${esc(about.eyebrow)}</p>
          <h2 id="about-heading">${esc(about.heading)}</h2>
        </div>

        <div class="about-grid">
          <div class="about-text">
${paras(about.paragraphs_top)}

            <div class="about-badges" aria-label="Certifications">
${badgesHtml}
            </div>

            <blockquote>
              <p>"${esc(about.quote)}"</p>
              <footer>${esc(about.quote_attribution)}</footer>
            </blockquote>

${paras(about.paragraphs_bottom)}
          </div>

          <div class="about-logo-wrap" aria-hidden="true">
            <img src="/logo-dark.png" alt="" class="about-logo" width="400" height="394" loading="lazy" />
          </div>
        </div>
      </div>
    </section>


    <!-- SERVICES -->
    <section id="services" class="section section-services" aria-labelledby="services-heading">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">${esc(services.eyebrow)}</p>
          <h2 id="services-heading">${esc(services.heading)}</h2>
          <p class="section-subhead">${esc(services.subhead)}</p>
        </div>

        <div class="cards-grid" role="list">
${programsHtml}
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section id="results" class="section section-results" aria-labelledby="results-heading">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">${esc(reviews.eyebrow)}</p>
          <h2 id="results-heading">${esc(reviews.heading)}</h2>
          <p class="section-subhead">${esc(reviews.subhead)}</p>
        </div>

        <div class="reviews-grid" role="list">
${reviewsHtml}
        </div>

        <p class="reviews-cta">
          <strong>${esc(reviews.rating_summary)}</strong> ·
          <a href="${esc(reviews.google_reviews_url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(reviews.google_reviews_link_label)} (opens in new tab)">${esc(reviews.google_reviews_link_label)}</a>
        </p>
      </div>
    </section>

    <!-- AIRVIDA HYPERBARIC WELLNESS SECTION START -->
    <section id="recovery" class="section section-recovery" aria-labelledby="recovery-heading">
      <div class="container">

        <div class="recovery-card">

          <div class="recovery-card-header">
            <h2 id="recovery-heading">${esc(recovery.heading)}</h2>
            <p class="recovery-intro">
              ${esc(recovery.intro)}
            </p>
          </div>

          <div class="hbot-chamber-image">
            <img
              src="${esc(recovery.chamber_image)}"
              alt="${esc(recovery.chamber_image_alt)}"
              width="800"
              height="600"
              loading="lazy"
            >
          </div>

          <div class="hbot-chamber-copy">
            <p>
              ${esc(recovery.body)}
            </p>
          </div>

          <div class="hbot-benefits-image">
            <img
              src="${esc(recovery.benefits_image)}"
              alt="${esc(recovery.benefits_image_alt)}"
              width="1672"
              height="941"
              loading="lazy"
            >
          </div>

          <div class="recovery-card-cta">
            <a href="#booking" class="btn recovery-card-button">
              ${esc(recovery.cta_label)}
              <span aria-hidden="true">›</span>
            </a>
          </div>

          <div class="recovery-details">
            <p>
              ${esc(recovery.disclaimer)}
            </p>
            <a
              class="recovery-research-link"
              href="${esc(recovery.research_link_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${esc(recovery.research_link_label)}
            </a>
          </div>

        </div><!-- /.recovery-card -->
      </div><!-- /.container -->
    </section>
    <!-- AIRVIDA HYPERBARIC WELLNESS SECTION END -->

    <!-- BOOKING -->
    <section id="booking" class="section section-booking" aria-labelledby="booking-heading">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">${esc(booking.eyebrow)}</p>
          <h2 id="booking-heading">${esc(booking.heading)}</h2>
          <p class="section-subhead">${esc(booking.subhead)}</p>
        </div>

        <div class="booking-embed-wrap">
          <p class="booking-note">
            <strong>${esc(booking.note_lead)}</strong> — ${esc(booking.note_availability)} If the scheduler doesn't load, <a href="mailto:${esc(site.email)}?subject=Free%20Consultation%20Request" aria-label="Book by email — opens your email app">${esc(booking.fallback_email_label)}</a>.
          </p>
          <iframe
            src="${esc(booking.scheduler_url)}"
            title="${esc(booking.scheduler_title)}"
            class="booking-iframe"
            width="100%"
            height="${esc(booking.scheduler_height)}"
            frameborder="0"
            loading="lazy"
            allowfullscreen
            aria-label="Vagaro booking scheduler for Mile High Athletics"
          ></iframe>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="site-footer" role="contentinfo">
    <div class="footer-inner container">
      <div class="footer-logo-wrap">
        <a href="#main-content" aria-label="Mile High Athlete — back to top">
          <img src="/logo-white-transparent.png" alt="Mile High Athlete logo" width="120" height="118" loading="lazy" class="footer-logo-img" />
        </a>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <ul role="list">
          <li><a href="#about">${esc(site.footer_nav.about_label)}</a></li>
          <li><a href="#services">${esc(site.footer_nav.services_label)}</a></li>
          <li><a href="#results">${esc(site.footer_nav.reviews_label)}</a></li>
          <li><a href="#booking">${esc(site.footer_nav.booking_label)}</a></li>
        </ul>
      </nav>

      <nav class="footer-social" aria-label="Social media profiles">
        <ul role="list">
${socialHtml}
        </ul>
      </nav>

      <p class="footer-legal">${esc(site.footer_legal)} · <a href="/admin/" class="footer-admin-link">Site Manager</a></p>
    </div>
  </footer>

  <script src="/main.js"></script>
</body>
</html>
`;
}

module.exports = { render };
