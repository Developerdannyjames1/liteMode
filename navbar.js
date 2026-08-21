/**
 * ============================================================
 * LightMode Ministries - Centralized Navbar & Theme Script
 * ============================================================
 */

(function() {
  'use strict';

  // ===== 1. THEME TOGGLE SYSTEM =====
  function setTheme(mode) {
    const html = document.documentElement;
    const body = document.body;
    const btnDay = document.getElementById('btn-day');
    const btnNight = document.getElementById('btn-night');

    if (mode === 'day') {
      html.setAttribute('data-theme', 'day');
      html.classList.remove('night-theme', 'dark-theme');
      html.classList.add('day-theme', 'light-theme');
      if (body) {
        body.classList.remove('night-theme', 'dark-theme');
        body.classList.add('day-theme', 'light-theme');
      }
      if (btnDay) btnDay.classList.add('active');
      if (btnNight) btnNight.classList.remove('active');
      localStorage.setItem('theme', 'day');
    } else {
      html.setAttribute('data-theme', 'night');
      html.classList.remove('day-theme', 'light-theme');
      html.classList.add('night-theme', 'dark-theme');
      if (body) {
        body.classList.remove('day-theme', 'light-theme');
        body.classList.add('night-theme', 'dark-theme');
      }
      if (btnNight) btnNight.classList.add('active');
      if (btnDay) btnDay.classList.remove('active');
      localStorage.setItem('theme', 'night');
    }
  }

  // Expose setTheme globally so inline onclick="setTheme('day')" works
  window.setTheme = setTheme;

  // Immediate Theme Load (prevents flash of wrong theme)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'day') {
    setTheme('day');
  } else {
    setTheme('night');
  }

  // ===== 2. NAVBAR INITIALIZATION & ANIMATIONS =====
  function initNavbar() {
    // Re-apply theme buttons state on DOMContentLoaded
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'day') {
      setTheme('day');
    } else {
      setTheme('night');
    }

    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.getElementById('navbar-menu');
    const navbar = document.querySelector('.navbar');

    if (!toggle || !menu) return;

    function isMobileView() {
      return window.innerWidth <= 1024 || window.getComputedStyle(toggle).display !== 'none';
    }

    // Toggle menu on hamburger click
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;

      this.setAttribute('aria-expanded', String(nextState));
      this.classList.toggle('active', nextState);
      menu.classList.toggle('active', nextState);

      if (nextState) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
        // Close all submenus when closing main menu
        document.querySelectorAll('.dropdown-submenu.active').forEach(sub => {
          sub.classList.remove('active');
        });
      }
    });

    // Close menu function
    function closeMobileMenu() {
      if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        
        // Reset open dropdowns and submenus
        document.querySelectorAll('.nav-dropdown.active, .dropdown-submenu.active').forEach(item => {
          item.classList.remove('active');
        });
      }
    }

    // ===== MAIN DROPDOWN TOGGLES (Teaching Library, LumenQuest, Rest, Teens) =====
    const dropdownToggles = menu.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggleBtn => {
      toggleBtn.addEventListener('click', function(e) {
        if (isMobileView()) {
          e.preventDefault();
          e.stopPropagation();
          const parent = this.closest('.nav-dropdown');
          if (!parent) return;

          const isAlreadyActive = parent.classList.contains('active');

          // Close other open dropdowns for clean accordion effect
          document.querySelectorAll('.nav-dropdown').forEach(d => {
            if (d !== parent) d.classList.remove('active');
          });

          // Toggle current
          parent.classList.toggle('active', !isAlreadyActive);
        }
      });
    });

    // ===== SUBMENU TOGGLES (BedTime Fables) =====
    const submenuToggles = menu.querySelectorAll('.submenu-toggle');
    submenuToggles.forEach(toggleBtn => {
      toggleBtn.addEventListener('click', function(e) {
        if (isMobileView()) {
          e.preventDefault();
          e.stopPropagation();
          const parent = this.closest('.dropdown-submenu');
          if (!parent) return;

          // Close other open submenus (optional: remove if you want multiple open)
          document.querySelectorAll('.dropdown-submenu').forEach(sub => {
            if (sub !== parent) sub.classList.remove('active');
          });

          // Toggle current
          parent.classList.toggle('active');
        }
      });
    });

    // Close menu when clicking standard links inside menu
    // Exclude dropdown-toggle and submenu-toggle so they don't close the menu
    menu.querySelectorAll('a:not(.dropdown-toggle):not(.submenu-toggle)').forEach(link => {
      link.addEventListener('click', function() {
        if (isMobileView()) {
          closeMobileMenu();
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (isMobileView() && menu.classList.contains('active')) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Reset when resizing back to desktop
    window.addEventListener('resize', function() {
      if (!isMobileView()) {
        closeMobileMenu();
      }
    });

    // Subtle navbar scroll effect
    window.addEventListener('scroll', function() {
      if (navbar) {
        if (window.scrollY > 20) {
          navbar.classList.add('navbar--scrolled');
        } else {
          navbar.classList.remove('navbar--scrolled');
        }
      }
    }, { passive: true });
  }

  // Expose initNavbar globally
  window.initNavbar = initNavbar;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();