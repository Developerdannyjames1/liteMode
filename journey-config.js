// ============================================================
// JOURNEY CONFIGURATION
// ============================================================
// Kids aur Adults ko alag alag activate karein.
// ACTIVE    = page fully accessible hai
// COMING_SOON = "Coming Soon" dikhega
//
// Kisi bhi din ko activate karne ke liye sirf us ki
// value 'COMING_SOON' se 'ACTIVE' kar dein.
// Koi aur code nahi badalna.

window.JOURNEY_CONFIG = {

    // -------------------------------------------------------
    // ADULTS JOURNEY
    // Files: WelcomeOrientation.html, journey-step-2.html ...
    // -------------------------------------------------------
    adults: {
        day0: 'ACTIVE',       // Orientation  → WelcomeOrientation.html
        day1: 'ACTIVE',       // Day 1         → journey-step-2.html
        day2: 'COMING_SOON',  // Day 2         → journey-step-3.html
        day3: 'COMING_SOON',  // Day 3         → journey-step-4.html
        day4: 'COMING_SOON',  // Day 4         → journey-step-5.html
        day5: 'COMING_SOON',  // Day 5         → journey-step-6.html
        day6: 'COMING_SOON',  // Day 6         → journey-step-7.html
        day7: 'COMING_SOON'   // Day 7         → journey-step-8.html
    },

    // -------------------------------------------------------
    // KIDS JOURNEY
    // Files: kids-journey-1.html, kids-journey-2.html ...
    // -------------------------------------------------------
    kids: {
        day0: 'ACTIVE',       // Orientation  → kids-journey-1.html
        day1: 'ACTIVE',       // Day 1         → kids-journey-1.html
        day2: 'COMING_SOON',  // Day 2         → kids-journey-2.html
        day3: 'COMING_SOON',  // Day 3         → kids-journey-3.html
        day4: 'COMING_SOON',  // Day 4         → kids-journey-4.html
        day5: 'COMING_SOON',  // Day 5         → kids-journey-5.html
        day6: 'COMING_SOON',  // Day 6         → kids-journey-6.html
        day7: 'COMING_SOON'   // Day 7         → kids-journey-7.html
    }

};

// ============================================================
// COMING SOON PAGE LOGIC
// ============================================================
// Har Coming Soon page par yeh call karein:
//   initComingSoonPage('adults', 'day2');   ← Adults pages
//   initComingSoonPage('kids',   'day2');   ← Kids pages

function initComingSoonPage(audience, currentDayKey) {
    document.addEventListener('DOMContentLoaded', function () {
        var cfg = window.JOURNEY_CONFIG[audience];
        if (!cfg || cfg[currentDayKey] !== 'COMING_SOON') return;

        // ---- ADULTS PAGES (.journey-hero) ----
        var heroSection = document.querySelector('.journey-hero');
        if (heroSection) {
            var heroLabel = heroSection.querySelector('.journey-hero-label');
            var heroTitle = heroSection.querySelector('h1');
            var labelHTML = heroLabel ? heroLabel.outerHTML : '';
            var titleHTML = heroTitle ? heroTitle.outerHTML : '';
            heroSection.innerHTML =
                labelHTML + titleHTML +
                '<div class="journey-coming-soon-msg" style="margin-top:24px;">' +
                    '<p style="font-size:2rem;font-weight:800;letter-spacing:0.1em;color:rgba(255,255,255,0.95);text-transform:uppercase;margin-bottom:10px;">COMING SOON</p>' +
                    '<p style="font-size:1.15rem;color:rgba(255,255,255,0.65);">The journey continues here.</p>' +
                '</div>';
        }

        // ---- KIDS PAGES (.kids-hero or .hero-wrapper) ----
        var kidsHero = document.querySelector('.kids-hero') || document.querySelector('.hero-wrapper');
        if (kidsHero && !heroSection) {
            var kidsBadge = kidsHero.querySelector('.kids-hero-badge') || kidsHero.querySelector('.hero-day');
            var kidsTitle = kidsHero.querySelector('h1');
            var badgeHTML = kidsBadge ? kidsBadge.outerHTML : '';
            var kidsTitleHTML = kidsTitle ? kidsTitle.outerHTML : '';
            kidsHero.innerHTML =
                '<div style="text-align:center; padding:40px;">' +
                badgeHTML + kidsTitleHTML +
                '<div class="journey-coming-soon-msg" style="margin-top:24px;">' +
                    '<p style="font-size:2rem;font-weight:800;letter-spacing:0.1em;color:var(--text-primary, rgba(255,255,255,0.95));text-transform:uppercase;margin-bottom:10px;">COMING SOON</p>' +
                    '<p style="font-size:1.15rem;color:var(--text-secondary, rgba(255,255,255,0.65));">The journey continues here.</p>' +
                '</div></div>';
        }

        // ---- Content sections chupaein ----
        ['.content-grid', '.why-section', '.reflection-section', '.task-section',
         '.fun-fact', '.activity-section', '.scripture-box', 
         '.video-section', '.expect-section', '.journey-days-section'].forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) {
                el.style.display = 'none';
            });
        });

        // ---- Next button chupaein ----
        var btnNext = document.getElementById('btn-next');
        if (btnNext) btnNext.style.display = 'none';
    });
}

// ============================================================
// NEXT-DAY NAVIGATION LOCK
// ============================================================
// Active page par Next button lock karne ke liye call karein:
//   initJourneyNavigation('adults', 'day2', 'btn-next');
//   initJourneyNavigation('kids',   'day2', 'btn-next');

function initJourneyNavigation(audience, nextDayKey, nextDayBtnId) {
    nextDayBtnId = nextDayBtnId || 'btn-next';
    document.addEventListener('DOMContentLoaded', function () {
        var cfg = window.JOURNEY_CONFIG[audience];
        if (!cfg || cfg[nextDayKey] !== 'COMING_SOON') return;

        var btnNext = document.getElementById(nextDayBtnId);
        if (!btnNext) return;

        var dayNum = nextDayKey.replace('day', '');
        btnNext.innerHTML = 'DAY ' + dayNum + ' &mdash; COMING SOON';
        btnNext.removeAttribute('href');
        btnNext.style.pointerEvents = 'none';
        btnNext.style.opacity = '0.55';
        btnNext.style.cursor = 'not-allowed';
        btnNext.classList.remove('enabled');
    });
}


