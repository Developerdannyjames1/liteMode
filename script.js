
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all modules
    initBridgeCarousel();
    initMinistryCardsAnimation();
    initVideoScroller();
    initHeroSlider();
    initTestimonialCarousel();
    initScrollAnimations();
    initVideoPlayback();
    initSmoothScroll();
    
});

/* ============================================
   BRIDGE CAROUSEL (Hero Section)
   ============================================ */
function initBridgeCarousel() {
    const IMAGES = [
        "/images/img1.png",
        "/images/img2.png",
        "/images/img3.png",
        "/images/img4.png",
        "/images/img5.png",
        "/images/img1.png",
        "/images/img2.png",
        "/images/img3.png",
        "/images/img4.png",
        "/images/img5.png"
    ];
    
    const originalSetCount = IMAGES.length;
    const track = document.getElementById('bridgeTrack');
    
    if (!track) return;
    
    let cards = [];
    let currentTranslateX = 0;
    let animationId = null;
    let lastTimestamp = 0;
    const speed = 85; // pixels per second
    
    let totalTrackWidth = 0;
    let originalSetWidth = 0;
    let halfWrapThreshold = 0;
    
    function buildTrack() {
        track.innerHTML = '';
        
        // Create 3 copies for seamless looping
        for (let copy = 0; copy < 3; copy++) {
            IMAGES.forEach((imgUrl, idx) => {
                const card = document.createElement('div');
                card.className = 'bridge-card';
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = `Featured scene ${idx + 1}`;
                img.loading = 'eager';
                card.appendChild(img);
                track.appendChild(card);
            });
        }
        
        cards = Array.from(document.querySelectorAll('.bridge-card'));
        updateDimensions();
        updateAllCardTransforms();
    }
    
    function updateDimensions() {
        if (!cards.length) return;
        
        const firstCard = cards[0];
        const cardRect = firstCard.getBoundingClientRect();
        const actualCardWidth = cardRect.width;
        const computedStyle = window.getComputedStyle(firstCard);
        const marginRightVal = parseFloat(computedStyle.marginRight) || 0;
        const actualOverlap = marginRightVal;
        
        if (cards.length > 0) {
            totalTrackWidth = (cards.length - 1) * (actualCardWidth - actualOverlap) + actualCardWidth;
        }
        
        originalSetWidth = (originalSetCount - 1) * (actualCardWidth - actualOverlap) + actualCardWidth;
        halfWrapThreshold = originalSetWidth;
    }
    
    function updateAllCardTransforms() {
        if (!cards.length) return;
        
        const container = document.querySelector('.bridge-container');
        if (!container) return;
        
        const containerBounds = container.getBoundingClientRect();
        const containerCenterX = containerBounds.left + containerBounds.width / 2;
        
        // Arch parameters - bottom fixed, top moves
        const maxLift = 60;
        const maxRotation = 8;
        const minScale = 0.88;
        const maxScale = 1.0;
        
        cards.forEach(card => {
            const cardBounds = card.getBoundingClientRect();
            const cardCenterX = cardBounds.left + cardBounds.width / 2;
            
            // Normalized position from -1 (left) to +1 (right)
            let t = (cardCenterX - containerCenterX) / (containerBounds.width / 2);
            t = Math.min(1.0, Math.max(-1.0, t));
            
            const absT = Math.abs(t);
            
            // Vertical lift: peak at center, zero at edges
            const liftFactor = Math.cos((absT * Math.PI) / 2);
            const verticalOffset = -maxLift * liftFactor;
            
            // Rotation: slight tilt at edges
            const rotationDeg = t * maxRotation * (1 - liftFactor * 0.3);
            
            // Scale: larger at center
            const scaleFactor = minScale + (maxScale - minScale) * liftFactor;
            
            // Apply transform - bottom is fixed
            card.style.transform = `translateY(${verticalOffset}px) rotate(${rotationDeg}deg) scale(${scaleFactor})`;
            
            // Z-index: center cards on top
            const zIndexVal = Math.floor(30 - absT * 20);
            card.style.zIndex = Math.max(5, Math.min(30, zIndexVal));
        });
    }
    
    function updateTrackPosition(deltaTime) {
        if (!track) return;
        
        const step = speed * deltaTime;
        currentTranslateX -= step;
        
        if (currentTranslateX <= -halfWrapThreshold) {
            currentTranslateX += originalSetWidth;
        }
        
        if (currentTranslateX > 0) {
            currentTranslateX = -originalSetWidth * 0.2;
        }
        
        track.style.transform = `translate3d(${currentTranslateX}px, 0, 0)`;
    }
    
    let previousTime = null;
    
    function animateCarousel(nowMs) {
        if (!previousTime) {
            previousTime = nowMs;
            requestAnimationFrame(animateCarousel);
            return;
        }
        
        let delta = Math.min(0.033, (nowMs - previousTime) / 1000);
        if (delta <= 0) {
            previousTime = nowMs;
            requestAnimationFrame(animateCarousel);
            return;
        }
        
        updateTrackPosition(delta);
        updateAllCardTransforms();
        
        previousTime = nowMs;
        animationId = requestAnimationFrame(animateCarousel);
    }
    
    let resizeTimeout;
    function handleResize() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateDimensions();
            if (originalSetWidth > 0) {
                while (currentTranslateX <= -originalSetWidth) {
                    currentTranslateX += originalSetWidth;
                }
                while (currentTranslateX > 0) {
                    currentTranslateX -= originalSetWidth;
                }
                track.style.transform = `translate3d(${currentTranslateX}px, 0, 0)`;
            }
            updateAllCardTransforms();
        }, 80);
    }
    
    // Initialize
    buildTrack();
    
    // Start animation after a brief delay to ensure layout is complete
    setTimeout(() => {
        updateDimensions();
        updateAllCardTransforms();
        animationId = requestAnimationFrame(animateCarousel);
    }, 50);
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    
    const observer = new ResizeObserver(() => {
        updateDimensions();
        updateAllCardTransforms();
    });
    
    observer.observe(track);
    
    // Expose for debugging
    window.__bridgeCarousel = { updateDimensions, updateAllCardTransforms };
}

/* ============================================
   MINISTRY CARDS ANIMATION
   ============================================ */
function initMinistryCardsAnimation() {
    const section = document.querySelector('section.bg-\\[\\#F1B75B\\]');
    if (!section) return;
    
    const cards = Array.from(section.querySelectorAll('.ministry-card'));
    if (cards.length === 0) return;
    
    let animationTriggered = false;
    
    function startSequentialAnimation() {
        if (animationTriggered) return;
        animationTriggered = true;
        
        const baseDelay = 80;
        const cardDelayIncrement = 140;
        
        cards.forEach((card, idx) => {
            setTimeout(() => {
                if (card.classList.contains('init-hide')) {
                    card.classList.remove('init-hide');
                }
            }, baseDelay + (idx * cardDelayIncrement));
        });
    }
    
    // Intersection Observer
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationTriggered) {
                startSequentialAnimation();
                obs.unobserve(section);
            }
        });
    }, { threshold: 0.25, rootMargin: "0px 0px -20px 0px" });
    
    observer.observe(section);
    
    // Fallback check
    if (!animationTriggered) {
        const rect = section.getBoundingClientRect();
        const winHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < winHeight - 100 && rect.bottom > 100) {
            startSequentialAnimation();
            observer.unobserve(section);
        }
    }
    
    // Scroll-based fallback
    let hasCheckedScroll = false;
    function checkVisibilityOnScroll() {
        if (animationTriggered) {
            window.removeEventListener('scroll', checkVisibilityOnScroll);
            return;
        }
        
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight - 80 && rect.bottom > 120) {
            startSequentialAnimation();
            window.removeEventListener('scroll', checkVisibilityOnScroll);
            observer.unobserve(section);
        }
    }
    
    window.addEventListener('scroll', checkVisibilityOnScroll, { passive: true });
    
    setTimeout(() => {
        if (!animationTriggered) {
            checkVisibilityOnScroll();
        }
    }, 200);
}

function initVideoScroller() {
    const videoScroller = document.getElementById('videoScroller');
    const scrollerTrack = document.getElementById('scrollerTrack');
    const cards = document.querySelectorAll('.video-card');
    
    if (!videoScroller || !cards.length) return;
    
    // Responsive parameters
    let maxLift = 80;
    let maxRotation = 12;
    let minScale = 0.9;
    
    function updateParameters() {
        const width = window.innerWidth;
        if (width >= 1440) {
            maxLift = 100;
            maxRotation = 15;
            minScale = 0.85;
        } else if (width >= 1200) {
            maxLift = 90;
            maxRotation = 13;
            minScale = 0.87;
        } else if (width >= 1024) {
            maxLift = 80;
            maxRotation = 12;
            minScale = 0.9;
        } else if (width >= 768) {
            maxLift = 60;
            maxRotation = 10;
            minScale = 0.92;
        } else {
            maxLift = 40;
            maxRotation = 8;
            minScale = 0.95;
        }
    }
    
    updateParameters();
    
    // Bridge curve animation
    function updateBridgeCurve() {
        const containerRect = videoScroller.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            
            let distanceFromCenter = (cardCenterX - containerCenterX) / (containerRect.width / 2);
            distanceFromCenter = Math.max(-1, Math.min(1, distanceFromCenter));
            
            const absDistance = Math.abs(distanceFromCenter);
            const archFactor = Math.cos((absDistance * Math.PI) / 2);
            const lift = maxLift * archFactor;
            const rotation = distanceFromCenter * maxRotation * (1 - archFactor * 0.5);
            const scale = minScale + (1 - minScale) * archFactor;
            const zIndex = Math.floor(20 - absDistance * 10);
            
            card.style.transform = `translateY(-${lift}px) rotate(${rotation}deg) scale(${scale})`;
            card.style.zIndex = zIndex;
            
            if (absDistance < 0.3) {
                card.classList.add('active-center');
            } else {
                card.classList.remove('active-center');
            }
        });
    }
    
    // SMART WHEEL HANDLER - allows page scroll at boundaries
    let isAtStart = false;
    let isAtEnd = false;
    
    function checkBoundaries() {
        const scrollLeft = videoScroller.scrollLeft;
        const maxScroll = videoScroller.scrollWidth - videoScroller.clientWidth;
        
        isAtStart = scrollLeft <= 5;
        isAtEnd = (maxScroll - scrollLeft) <= 5;
        
        // Visual feedback at boundaries
        if (isAtEnd) {
            videoScroller.style.overscrollBehaviorX = 'auto';
        } else {
            videoScroller.style.overscrollBehaviorX = 'contain';
        }
    }
    
    // Wheel event with boundary detection
    videoScroller.addEventListener('wheel', (e) => {
        checkBoundaries();
        
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        
        // If at END and scrolling DOWN/RIGHT -> allow page scroll
        if (isAtEnd && isScrollingDown) {
            // Don't prevent default - let page scroll
            return;
        }
        
        // If at START and scrolling UP/LEFT and page is scrolled down -> allow page scroll  
        if (isAtStart && isScrollingUp && window.scrollY > 0) {
            return;
        }
        
        // Otherwise, scroll the carousel horizontally
        e.preventDefault();
        videoScroller.scrollLeft += e.deltaY;
        requestAnimationFrame(updateBridgeCurve);
    }, { passive: false });
    
    // Regular scroll event for animation
    videoScroller.addEventListener('scroll', () => {
        checkBoundaries();
        requestAnimationFrame(updateBridgeCurve);
    }, { passive: true });
    
    // Drag to scroll
    let isDown = false;
    let startX;
    let startScrollLeft;
    
    videoScroller.addEventListener('mousedown', (e) => {
        isDown = true;
        videoScroller.style.cursor = 'grabbing';
        startX = e.pageX - videoScroller.offsetLeft;
        startScrollLeft = videoScroller.scrollLeft;
    });
    
    window.addEventListener('mouseleave', () => {
        isDown = false;
        videoScroller.style.cursor = 'grab';
    });
    
    window.addEventListener('mouseup', () => {
        isDown = false;
        videoScroller.style.cursor = 'grab';
    });
    
    videoScroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - videoScroller.offsetLeft;
        const walk = (x - startX) * 1.5;
        videoScroller.scrollLeft = startScrollLeft - walk;
        requestAnimationFrame(updateBridgeCurve);
    });
    
    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    
    videoScroller.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    videoScroller.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchStartX - touchX;
        const deltaY = touchStartY - touchY;
        
        // Horizontal scroll dominates
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const scrollLeft = videoScroller.scrollLeft;
            const maxScroll = videoScroller.scrollWidth - videoScroller.clientWidth;
            const atEnd = (maxScroll - scrollLeft) < 10;
            
            // If at end and swiping left (next), allow page scroll
            if (atEnd && deltaX > 50) {
                return;
            }
            
            e.preventDefault();
            videoScroller.scrollLeft += deltaX * 0.5;
            touchStartX = touchX;
            requestAnimationFrame(updateBridgeCurve);
        }
    }, { passive: false });
    
    // Initial setup
    updateBridgeCurve();
    checkBoundaries();
    
    // Update on resize
    window.addEventListener('resize', () => {
        updateParameters();
        updateBridgeCurve();
        checkBoundaries();
    });
    
    // Animation loop
    function animate() {
        updateBridgeCurve();
        requestAnimationFrame(animate);
    }
    animate();
    
    // Header observer
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('header-visible');
                entry.target.classList.remove('header-hidden');
            }
        });
    }, { threshold: 0.15 });
    
    const headerDiv = document.getElementById('featured-header');
    if (headerDiv) headerObserver.observe(headerDiv);
}

/* ============================================
   HERO SLIDER (Characters Section)
   ============================================ */
function initHeroSlider() {
    class HeroSlider {
        constructor() {
            this.slidesTrack = document.getElementById('slidesTrack');
            this.slides = document.querySelectorAll('.slide');
            this.dots = document.querySelectorAll('.dot');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');
            
            this.currentIndex = 0;
            this.totalSlides = this.slides.length;
            this.isAnimating = false;
            
            if (this.slides.length > 0) {
                this.init();
            }
        }
        
        init() {
            this.updateSlidesPosition();
            this.updateActiveSlide();
            this.updateDots();
            
            // Event listeners
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            // Dot navigation
            this.dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.goToSlide(index);
                });
            });
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });
            
            // Touch/Swipe support
            let touchStartX = 0;
            let touchEndX = 0;
            
            const container = document.querySelector('.heroes-container');
            
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
            
            this.setupVideos();
        }
        
        handleSwipe(startX, endX) {
            const swipeThreshold = 50;
            const diff = endX - startX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
        }
        
        updateSlidesPosition() {
            if (this.slidesTrack) {
                const offset = -this.currentIndex * 100;
                this.slidesTrack.style.transform = `translateX(${offset}%)`;
            }
        }
        
        updateActiveSlide() {
            this.slides.forEach((slide, index) => {
                slide.style.display = 'flex';
                
                // Update ARIA
                const dot = this.dots[index];
                if (dot) {
                    dot.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
                    dot.classList.toggle('active', index === this.currentIndex);
                }
            });
        }
        
        updateDots() {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
                dot.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
            });
        }
        
        updateVideos() {
            // Pause all videos
            this.slides.forEach(slide => {
                const video = slide.querySelector('video');
                if (video) {
                    video.pause();
                }
            });
            
            // Play current slide video
            const currentSlide = this.slides[this.currentIndex];
            const currentVideo = currentSlide.querySelector('video');
            if (currentVideo) {
                currentVideo.play().catch(e => console.log('Autoplay prevented:', e));
            }
        }
        
        setupVideos() {
            // Video hover effect
            document.querySelectorAll('.video-wrapper').forEach(wrapper => {
                const video = wrapper.querySelector('video');
                
                wrapper.addEventListener('mouseenter', () => {
                    if (video && this.slides[this.currentIndex].contains(video)) {
                        video.play();
                    }
                });
            });
            
            // Initial video play
            setTimeout(() => {
                this.updateVideos();
            }, 100);
        }
        
        nextSlide() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            
            if (this.currentIndex < this.totalSlides - 1) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0;
            }
            
            this.updateSlidesPosition();
            this.updateDots();
            this.updateVideos();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
        
        prevSlide() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            
            if (this.currentIndex > 0) {
                this.currentIndex--;
            } else {
                this.currentIndex = this.totalSlides - 1;
            }
            
            this.updateSlidesPosition();
            this.updateDots();
            this.updateVideos();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
        
        goToSlide(index) {
            if (this.isAnimating || index === this.currentIndex) return;
            if (index < 0 || index >= this.totalSlides) return;
            
            this.isAnimating = true;
            this.currentIndex = index;
            
            this.updateSlidesPosition();
            this.updateDots();
            this.updateVideos();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }
    
    // Initialize slider
    new HeroSlider();
}

/* ============================================
   TESTIMONIAL CAROUSEL
   ============================================ */
function initTestimonialCarousel() {
    const container = document.getElementById('testimonialContainer');
    const cards = document.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    
    if (!container || !cards.length) return;
    
    let currentCenterIndex = 2; // Start with center card
    let isAnimating = false;
    
    const vPositions = ['v-position-0', 'v-position-1', 'v-position-2', 'v-position-3', 'v-position-4'];
    
    function updateVPositions() {
        cards.forEach((card, index) => {
            // Remove all V position classes
            vPositions.forEach(pos => card.classList.remove(pos));
            card.classList.remove('is-center');
            
            // Calculate distance from center
            let distance = index - currentCenterIndex;
            
            // Handle wrap-around
            if (distance < -2) distance += totalCards;
            if (distance > 2) distance -= totalCards;
            
            // Map distance to V position
            let vPositionIndex = distance + 2;
            vPositionIndex = Math.max(0, Math.min(4, vPositionIndex));
            
            card.classList.add(vPositions[vPositionIndex]);
            
            if (distance === 0) {
                card.classList.add('is-center');
            }
        });
    }
    
    function scrollToCenterCard() {
        const centerCard = cards[currentCenterIndex];
        if (!centerCard || !container) return;
        
        const cardRect = centerCard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const cardCenter = cardRect.left + cardRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const scrollOffset = cardCenter - containerCenter;
        
        container.scrollLeft += scrollOffset;
    }
    
    // Expose global function for button clicks
    window.moveCarousel = function(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
        cards.forEach(card => card.classList.add('transitioning'));
        
        if (direction === 'left') {
            currentCenterIndex = (currentCenterIndex - 1 + totalCards) % totalCards;
        } else {
            currentCenterIndex = (currentCenterIndex + 1) % totalCards;
        }
        
        updateVPositions();
        scrollToCenterCard();
        
        setTimeout(() => {
            isAnimating = false;
            cards.forEach(card => card.classList.remove('transitioning'));
        }, 600);
    };
    
    // Initialize
    updateVPositions();
    
    // Center on load
    window.addEventListener('load', scrollToCenterCard);
    
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scrollToCenterCard, 250);
    });
    
    // Drag to scroll
    let isDown = false;
    let startX;
    let startScrollLeft;
    
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        startScrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseup', () => {
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
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                entry.target.classList.remove('scroll-hidden');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.scroll-hidden').forEach((el) => {
        observer.observe(el);
    });
    
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('header-visible');
                entry.target.classList.remove('header-hidden');
            }
        });
    }, observerOptions);
    
    const header = document.getElementById('header');
    if (header) {
        headerObserver.observe(header);
    }
}

/* ============================================
   VIDEO PLAYBACK CONTROLS
   ============================================ */
function initVideoPlayback() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        const video = card.querySelector('video');
        const playBtn = card.querySelector('.play-btn');
        
        if (!video) return;
        
        card.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('Playback failed:', e));
        });
        
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
            
            // Keyboard accessibility
            playBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playBtn.click();
                }
            });
        }
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

  const elements = document.querySelectorAll('.scroll-anim');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // thoda delay trigger (extra smooth feel)
        setTimeout(() => {
          entry.target.classList.add('show');
        }, 100);
      }
    });
  }, {
    threshold: 0.25
  });

  elements.forEach(el => observer.observe(el));
