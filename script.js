   /* ============================================
       UTILITY FUNCTIONS
       ============================================ */
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    /* ============================================
       NAVBAR - Non-sticky, mobile toggle
       ============================================ */
    const initNavbar = () => {
      const toggle = document.querySelector('.navbar-toggle');
      const menu = document.querySelector('.navbar-menu');
      
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          const isOpen = menu.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', isOpen);
        });
      }

      document.querySelectorAll('.navbar-link').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    };

    /* ============================================
       BRIDGE CAROUSEL
       ============================================ */
    const initBridgeCarousel = () => {
      const IMAGES = [
        "/images/img1.png", "/images/img2.png", "/images/img3.png",
        "/images/img4.png", "/images/img5.png"
      ];
      
      const track = document.getElementById('bridgeTrack');
      if (!track) return;

      const buildTrack = () => {
        track.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          IMAGES.forEach((src, idx) => {
            const card = document.createElement('div');
            card.className = 'bridge-card';
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Featured scene ${idx + 1}`;
            img.loading = 'eager';
            card.appendChild(img);
            track.appendChild(card);
          });
        }
      };

      buildTrack();

      const cards = Array.from(track.querySelectorAll('.bridge-card'));
      let currentX = 0;
      let animationId = null;
      let lastTime = 0;
      const speed = 85;

      const getDimensions = () => {
        if (!cards.length) return { cardWidth: 0, overlap: 0, setWidth: 0 };
        const card = cards[0];
        const style = window.getComputedStyle(card);
        const marginRight = parseFloat(style.marginRight) || 0;
        const cardWidth = card.getBoundingClientRect().width;
        return {
          cardWidth,
          overlap: Math.abs(marginRight),
          setWidth: (IMAGES.length - 1) * (cardWidth + marginRight) + cardWidth
        };
      };

      const updateCardTransforms = () => {
        const container = track.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          
          let t = (cardCenterX - centerX) / (containerRect.width / 2);
          t = Math.max(-1, Math.min(1, t));
          
          const absT = Math.abs(t);
          const lift = -60 * Math.cos((absT * Math.PI) / 2);
          const rotation = t * 8 * (1 - absT * 0.3);
          const scale = 0.88 + 0.12 * Math.cos((absT * Math.PI) / 2);
          const zIndex = Math.floor(30 - absT * 20);

          card.style.transform = `translate3d(0, ${lift}px, 0) rotate(${rotation}deg) scale(${scale})`;
          card.style.zIndex = Math.max(5, zIndex);
        });
      };

      const animate = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const delta = Math.min(0.033, (timestamp - lastTime) / 1000);
        lastTime = timestamp;

        const { setWidth } = getDimensions();
        currentX -= speed * delta;

        if (setWidth > 0) {
          if (currentX <= -setWidth) currentX += setWidth;
          if (currentX > 0) currentX -= setWidth;
        }

        track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        updateCardTransforms();
        animationId = requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      window.addEventListener('resize', debounce(() => {
        const { setWidth } = getDimensions();
        if (setWidth > 0 && currentX <= -setWidth) {
          currentX += setWidth;
        }
      }, 100));
    };

    /* ============================================
       WELCOME SECTION - PINNED SCROLL ANIMATION
       ============================================ */
    const initWelcomeAnimation = () => {
      gsap.registerPlugin(ScrollTrigger);

      const section = document.getElementById('welcome-section');
      if (!section) return;

      const leftImages = section.querySelectorAll('[data-welcome-animate="left"]');
      const rightImages = section.querySelectorAll('[data-welcome-animate="right"]');
      const centerImage = section.querySelector('[data-welcome-animate="center"]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1000",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        }
      });

      tl.from(leftImages, {
        x: -400,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
      }, 0);

      tl.from(rightImages, {
        x: 400,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
      }, 0);

      tl.from(centerImage, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.2)"
      }, 0.2);
    };

    /* ============================================
       MINISTRY CARDS ANIMATION
       ============================================ */
    const initMinistryCards = () => {
      const cards = document.querySelectorAll('.ministry-card[data-animate]');
      if (!cards.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, index * 150);
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });

      cards.forEach(card => observer.observe(card));
    };

    /* ============================================
       VIDEO SCROLLER - FIXED with HOVER PLAY/STOP
       ============================================ */
    const initVideoScroller = () => {
      const scroller = document.getElementById('videoScroller');
      const track = document.getElementById('videoTrack');
      if (!scroller || !track) return;

      const cards = track.querySelectorAll('.video-card');
      
cards.forEach(card => {
  const video = card.querySelector('video');
  if (video) {

    // ✅ Autoplay setup
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    // ✅ Ensure video starts automatically
    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.01;
      video.play().catch(() => {});
    });

    // ✅ Hover = Pause
    card.addEventListener('mouseenter', () => {
      video.pause();
    });

    // ✅ Leave = Resume Play
    card.addEventListener('mouseleave', () => {
      video.play().catch(() => {});
    });
  }
});
      const updateBridgeCurve = () => {
        const containerRect = scroller.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          
          let distance = (cardCenterX - centerX) / (containerRect.width / 2);
          distance = Math.max(-1, Math.min(1, distance));
          
          const absDist = Math.abs(distance);
          const arch = Math.cos((absDist * Math.PI) / 2);
          
          const lift = 80 * arch;
          const rotation = distance * 12 * (1 - arch * 0.5);
          const scale = 0.9 + 0.1 * arch;
          const zIndex = Math.floor(20 - absDist * 10);

          card.style.transform = `translate3d(0, -${lift}px, 0) rotate(${rotation}deg) scale(${scale})`;
          card.style.zIndex = zIndex;
        });
      };

      let isAtStart = false;
      let isAtEnd = false;

      const checkBoundaries = () => {
        const scrollLeft = scroller.scrollLeft;
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        isAtStart = scrollLeft <= 5;
        isAtEnd = maxScroll - scrollLeft <= 5;
      };

      scroller.addEventListener('wheel', (e) => {
        checkBoundaries();
        
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        if ((isAtEnd && scrollingDown) || (isAtStart && scrollingUp && window.scrollY > 0)) {
          return;
        }

        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
        requestAnimationFrame(updateBridgeCurve);
      }, { passive: false });

      scroller.addEventListener('scroll', () => {
        checkBoundaries();
        requestAnimationFrame(updateBridgeCurve);
      }, { passive: true });

      // Drag to scroll
      let isDown = false;
      let startX;
      let startScrollLeft;

      scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        scroller.style.cursor = 'grabbing';
        startX = e.pageX - scroller.offsetLeft;
        startScrollLeft = scroller.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        isDown = false;
        scroller.style.cursor = 'grab';
      });

      scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = (x - startX) * 1.5;
        scroller.scrollLeft = startScrollLeft - walk;
        requestAnimationFrame(updateBridgeCurve);
      });

      // Touch support
      let touchStartX = 0;
      
      scroller.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      scroller.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const deltaX = touchStartX - touchX;
        
        const scrollLeft = scroller.scrollLeft;
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        
        if (Math.abs(deltaX) > 10 && maxScroll - scrollLeft > 10) {
          e.preventDefault();
          scroller.scrollLeft += deltaX * 0.5;
          touchStartX = touchX;
          requestAnimationFrame(updateBridgeCurve);
        }
      }, { passive: false });

      updateBridgeCurve();
      checkBoundaries();
    };

    /* ============================================
       HEROES SLIDER
       ============================================ */
    const initHeroesSlider = () => {
      const track = document.getElementById('heroesTrack');
      const slides = document.querySelectorAll('.heroes-slide');
      const dots = document.querySelectorAll('.heroes-dot');
      const prevBtn = document.getElementById('heroesPrev');
      const nextBtn = document.getElementById('heroesNext');
      
      if (!track || !slides.length) return;

      let currentIndex = 0;
      let isAnimating = false;

      const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === currentIndex);
          dot.setAttribute('aria-selected', idx === currentIndex);
        });

        slides.forEach((slide, idx) => {
          const video = slide.querySelector('video');
          if (video) {
            if (idx === currentIndex) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        });
      };

      const goToSlide = (index) => {
        if (isAnimating || index === currentIndex) return;
        isAnimating = true;
        currentIndex = index;
        updateSlider();
        setTimeout(() => isAnimating = false, 500);
      };

      const nextSlide = () => {
        const next = (currentIndex + 1) % slides.length;
        goToSlide(next);
      };

      const prevSlide = () => {
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prev);
      };

      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => goToSlide(idx));
      });

      let touchStartX = 0;
      const container = document.querySelector('.heroes-slider');
      
      container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) prevSlide();
          else nextSlide();
        }
      }, { passive: true });

      updateSlider();
    };

    /* ============================================
       TESTIMONIALS CAROUSEL
       ============================================ */
    let testimonialIndex = 2;
    
    window.moveTestimonial = (direction) => {
      const container = document.getElementById('testimonialsScroll');
      const cards = container.querySelectorAll('.testimonial-card');
      const totalCards = cards.length;
      
      if (direction === 'left') {
        testimonialIndex = Math.max(0, testimonialIndex - 1);
      } else {
        testimonialIndex = Math.min(totalCards - 1, testimonialIndex + 1);
      }

      cards.forEach((card, idx) => {
        card.classList.toggle('is-center', idx === testimonialIndex);
      });

      const activeCard = cards[testimonialIndex];
      if (activeCard) {
        const cardRect = activeCard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2);
        container.scrollLeft += offset;
      }
    };

    const initTestimonials = () => {
      const container = document.getElementById('testimonialsScroll');
      if (!container) return;

      let isDown = false;
      let startX;
      let startScrollLeft;

      container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        startScrollLeft = container.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = startScrollLeft - walk;
      });

      window.addEventListener('load', () => {
        moveTestimonial('right');
        moveTestimonial('left');
      });
    };

    /* ============================================
       SMOOTH SCROLL
       ============================================ */
    const initSmoothScroll = () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    };

    /* ============================================
       INITIALIZATION
       ============================================ */
    document.addEventListener('DOMContentLoaded', () => {
      initNavbar();
      initBridgeCarousel();
      initWelcomeAnimation();
      initMinistryCards();
      initVideoScroller();
      initHeroesSlider();
      initTestimonials();
      initSmoothScroll();
    });