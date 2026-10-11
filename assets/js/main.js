/**
 * SimpleVoiceChatWeb Documentation - Main JavaScript
 * Handles: TOC generation, mobile navigation, theme toggle, smooth scroll
 */

(function() {
  'use strict';

  // ==========================================================================
  // Theme Management
  // ==========================================================================
  const THEME_KEY = 'svcw-docs-theme';
  const THEME_ATTR = 'data-theme';

  function getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute(THEME_ATTR, theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggle(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute(THEME_ATTR) || getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function updateThemeToggle(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln');
    });
  }

  // Initialize theme
  setTheme(getTheme());

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ==========================================================================
  // Mobile Navigation Toggle
  // ==========================================================================
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-main');
    const links = document.querySelectorAll('.nav-link');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav when clicking a link
    links.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close nav on escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });

    // Close nav when clicking outside
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') &&
          !nav.contains(e.target) &&
          !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================================================
  // Table of Contents Generation
  // ==========================================================================
  function generateTOC() {
    const content = document.querySelector('.content');
    const tocList = document.getElementById('toc');

    if (!content || !tocList) return;

    // Card titles (h3 inside .card-grid) are teaser links, not document
    // structure - they would drown the real sections in noise.
    const headings = Array.from(content.querySelectorAll('h2, h3'))
      .filter(heading => !heading.closest('.card-grid'));
    if (headings.length === 0) {
      tocList.parentElement.style.display = 'none';
      return;
    }

    // Ensure headings have IDs
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }
    });

    // Build TOC structure
    const tocItems = [];
    let currentH2 = null;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      const text = heading.textContent.trim();
      const id = heading.id;

      if (level === 2) {
        currentH2 = {
          id,
          text,
          children: []
        };
        tocItems.push(currentH2);
      } else if (level === 3 && currentH2) {
        currentH2.children.push({ id, text });
      }
    });

    // Render TOC
    tocList.innerHTML = tocItems.map(item => `
      <li>
        <a class="sidebar-link" href="#${item.id}">${escapeHtml(item.text)}</a>
        ${item.children.length > 0 ? `
          <ul class="sidebar-sublist">
            ${item.children.map(child => `
              <li><a class="sidebar-link sidebar-sublink" href="#${child.id}">${escapeHtml(child.text)}</a></li>
            `).join('')}
          </ul>
        ` : ''}
      </li>
    `).join('');

    // Add styles for sublist
    if (!document.getElementById('toc-styles')) {
      const style = document.createElement('style');
      style.id = 'toc-styles';
      style.textContent = `
        .sidebar-sublist {
          list-style: none;
          padding: 0 0 0.5rem 1rem;
          margin: 0;
          border-left: 1px solid var(--color-border-light);
        }
        .sidebar-sublist li { margin: 0.125rem 0; }
        .sidebar-sublink {
          font-size: 0.8125rem;
          padding: 0.25rem 0.5rem;
        }
        .sidebar-sublink.active {
          font-weight: 500;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // Active TOC Link Highlighting (IntersectionObserver)
  // ==========================================================================
  function initTOCHighlight() {
    const tocLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
    if (tocLinks.length === 0) return;

    const headings = Array.from(tocLinks).map(link => {
      const id = link.getAttribute('href').slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.sidebar-link[href="#${id}"]`);
        if (link) {
          link.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, {
      rootMargin: '-100px 0px -66% 0px',
      threshold: 0.1
    });

    headings.forEach(heading => observer.observe(heading));
  }

  // ==========================================================================
  // Smooth Scroll with Header Offset
  // ==========================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header')?.offsetHeight || 72;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          target.removeAttribute('tabindex');
        }
      });
    });
  }

  // ==========================================================================
  // Code Block Copy Buttons
  // ==========================================================================
  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach(block => {
      if (block.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Code kopieren');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      btn.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.375rem;
        background: var(--color-bg-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-muted);
        cursor: pointer;
        opacity: 0;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      block.style.position = 'relative';
      block.appendChild(btn);

      block.addEventListener('mouseenter', () => btn.style.opacity = '1');
      block.addEventListener('mouseleave', () => btn.style.opacity = '0');

      btn.addEventListener('click', async () => {
        const code = block.querySelector('code')?.textContent || block.textContent;
        try {
          await navigator.clipboard.writeText(code);
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          btn.style.color = 'var(--color-success)';
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
            btn.style.color = '';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
    });
  }

  // ==========================================================================
  // Theme Toggle Button Creation
  // ==========================================================================
  function createThemeToggle() {
    const header = document.querySelector('.header .container');
    if (!header || document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Thema umschalten');
    btn.innerHTML = `
      <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    btn.addEventListener('click', toggleTheme);
    header.appendChild(btn);
  }

  // ==========================================================================
  // Skip Link
  // ==========================================================================
  function createSkipLink() {
    if (document.querySelector('.skip-link')) return;

    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#main-content';
    link.textContent = 'Zum Hauptinhalt springen';
    document.body.insertBefore(link, document.body.firstChild);
  }

  // ==========================================================================
  // Initialize All
  // ==========================================================================
  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    createSkipLink();
    createThemeToggle();
    initMobileNav();
    generateTOC();
    initTOCHighlight();
    initSmoothScroll();
    initCodeCopy();

    // Add main content ID for skip link
    const mainContent = document.querySelector('.content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  init();

  // ==========================================================================
  // Export for testing
  // ==========================================================================
  window.SVCDocs = {
    setTheme,
    getTheme,
    toggleTheme,
    generateTOC,
    initTOCHighlight
  };
})();