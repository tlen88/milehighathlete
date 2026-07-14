/**
 * Mile High Athletics — main.js
 * Accessible, dependency-free vanilla JS.
 */

(function () {
  'use strict';

  /* ── SITE MANAGER (Netlify Identity) TOKEN REDIRECT ──
     Invitation / recovery emails land on the homepage with
     a token in the URL hash. Send them to the client portal,
     where the Identity widget is loaded to handle them.
  ──────────────────────────────────────────────────── */
  if (
    /(invite_token|recovery_token|confirmation_token|email_change_token)=/.test(window.location.hash) &&
    window.location.pathname.indexOf('/admin') !== 0
  ) {
    window.location.replace('/admin/' + window.location.hash);
    return;
  }

  /* ── NAV TOGGLE (hamburger) ─────────────────────────
     Keyboard accessible: Enter/Space to open,
     Escape to close. Focus returns to toggle on close.
  ──────────────────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('#primary-nav');

  if (navToggle && primaryNav) {

    function openNav() {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');
      primaryNav.classList.add('is-open');
    }

    function closeNav() {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      primaryNav.classList.remove('is-open');
      navToggle.focus(); // Return focus to toggle
    }

    navToggle.addEventListener('click', function () {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      isExpanded ? closeNav() : openNav();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
      }
    });

    // Close when a nav link is clicked (single-page anchor navigation)
    const navLinks = primaryNav.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (primaryNav.classList.contains('is-open')) {
          closeNav();
        }
      });
    });

    // Close nav if user clicks/taps outside it on mobile
    document.addEventListener('click', function (e) {
      if (
        primaryNav.classList.contains('is-open') &&
        !primaryNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav();
      }
    });
  }

  /* ── SMOOTH SCROLL with focus management ─────────────
     After scrolling to an anchor, move focus to the
     section heading so screen readers announce it.
  ──────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      // Find the first heading or focusable element within the section
      const firstHeading = target.querySelector('h1, h2, h3, [tabindex]');
      if (firstHeading) {
        // Make heading temporarily focusable if it isn't already
        if (!firstHeading.hasAttribute('tabindex')) {
          firstHeading.setAttribute('tabindex', '-1');
        }
        // Delay so scroll completes first
        setTimeout(function () {
          firstHeading.focus({ preventScroll: false });
        }, 350);
      }
    });
  });

  /* ── EXTERNAL LINKS ──────────────────────────────────
     Ensure all target="_blank" links have rel safety.
     Belt-and-suspenders check in case HTML is edited.
  ──────────────────────────────────────────────────── */
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    const rel = link.getAttribute('rel') || '';
    if (!rel.includes('noopener')) {
      link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
    }
  });

})();
