document.addEventListener('DOMContentLoaded', () => {
    // --- Advanced Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('awaiting-scroll');
            }
        });
    }, observerOptions);

    // Observe detailed sections
    const scrollElements = document.querySelectorAll('.feature-block, .card, .tech-icon, .timeline-content, .db-table-card, .screen-block');

    scrollElements.forEach(el => {
        el.classList.add('awaiting-scroll'); // Hide them only if JS runs
        observer.observe(el);
    });

    // --- Parallax Effect for Hero ---
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const shapes = document.querySelectorAll('.hero-visual');
        // Simple parallax for the SVG container
        if (shapes.length > 0) {
            shapes[0].style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });

    // --- Carousel Logic ---
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const dotsNav = document.querySelector('.carousel-dots');

        // Create dots if they don't exist based on slide count
        if (dotsNav && dotsNav.children.length !== slides.length) {
            dotsNav.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.dataset.slide = i;
                dotsNav.appendChild(dot);
            });
        }

        const dots = Array.from(dotsNav.children);

        let currentSlideIndex = 0;

        const updateSlide = (index) => {
            slides.forEach(slide => {
                slide.style.display = 'none';
                slide.classList.remove('active');
                slide.style.opacity = '0';
            });
            slides[index].style.display = 'block';
            // Trigger reflow
            void slides[index].offsetWidth;
            slides[index].classList.add('active');
            slides[index].style.opacity = '1';

            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        };

        // Initialize
        updateSlide(0);

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentSlideIndex = (currentSlideIndex + 1) % slides.length;
                updateSlide(currentSlideIndex);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
                updateSlide(currentSlideIndex);
            });
        }

        if (dotsNav) {
            dotsNav.addEventListener('click', (e) => {
                const targetDot = e.target.closest('.dot');
                if (!targetDot) return;
                currentSlideIndex = parseInt(targetDot.dataset.slide);
                updateSlide(currentSlideIndex);
            });
        }
    }

    // --- Scroll to Top ---
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-top';
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Interactive Tech Cards ---
    const techCards = document.querySelectorAll('.grid-4 .card');
    techCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Close others
            techCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('expanded');
                }
            });
            // Toggle current
            card.classList.toggle('expanded');
        });
    });

    // --- Hero SVG Interactivity ---
    const heroNodes = {
        'node-faculty': {
            title: '👨‍🏫 Faculty App',
            desc: 'For Teachers. Open app → Pick class → Mark who\'s absent → Done. Takes 10 seconds. Works even without internet, syncs later automatically.'
        },
        'node-student': {
            title: '👨‍🎓 Student App',
            desc: 'For Students. Open app → See your attendance % instantly (Example: "82%"). Get alerts if you\'re going below 75%. No confusion, no surprises.'
        },
        'node-nodejs': {
            title: '🧠 Node.js (The Brain)',
            desc: 'The Logic Center. It connects Faculty App and Student App to the database. Makes sure all calculations are correct and data is secure.'
        },
        'node-supabase': {
            title: '🔒 Supabase (The Vault)',
            desc: 'Secure Cloud Database. Stores ALL attendance records safely. Has "Auto-Lock" feature - after 3 days, no one can change old attendance. Prevents cheating.'
        }
    };

    const infoPanel = document.getElementById('hero-info-panel');
    const panelTitle = document.getElementById('panel-title');
    const panelDesc = document.getElementById('panel-desc');
    const closePanelBtn = document.getElementById('close-panel');
    let activeNodeId = null;

    Object.keys(heroNodes).forEach(id => {
        const node = document.getElementById(id);
        if (node) {
            node.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent closing immediately
                const data = heroNodes[id];

                // Update Content
                panelTitle.textContent = data.title;
                panelDesc.textContent = data.desc;

                // Show Panel
                infoPanel.classList.add('visible');
                activeNodeId = id;
            });
        }
    });

    // Close Panel Logic
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            infoPanel.classList.remove('visible');
            activeNodeId = null;
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (infoPanel && infoPanel.classList.contains('visible') && !infoPanel.contains(e.target)) {
            infoPanel.classList.remove('visible');
            activeNodeId = null;
        }
    });

    // --- Zoom Modal Logic (Custom CSS Transform) ---
    const modal = document.getElementById('diagram-modal');
    const modalContent = document.getElementById('modal-diagram-container');
    const closeModalBtn = document.getElementById('close-diagram-modal');

    // Controls
    const btnZoomIn = document.getElementById('modal-zoom-in');
    const btnZoomOut = document.getElementById('modal-zoom-out');
    const btnReset = document.getElementById('modal-reset');

    const diagrams = document.querySelectorAll('.mermaid');

    let currentScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const updateTransform = (element) => {
        if (element) {
            element.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
        }
    };

    if (modal && modalContent) {
        let activeClone = null;

        diagrams.forEach(diagram => {
            diagram.addEventListener('click', () => {
                const svg = diagram.querySelector('svg');
                if (svg) {
                    modalContent.innerHTML = '';

                    // Reset state
                    currentScale = 1;
                    currentTranslateX = 0;
                    currentTranslateY = 0;

                    const clone = svg.cloneNode(true);
                    activeClone = clone;

                    // Setup Clone Styles
                    clone.id = `modal-clone-${Date.now()}`;
                    clone.style.width = '100%';
                    clone.style.height = '100%';
                    clone.style.maxWidth = 'none';
                    clone.removeAttribute('height');
                    clone.style.display = 'block';
                    clone.style.cursor = 'grab';
                    clone.style.transition = 'transform 0.1s ease-out';
                    clone.style.transformOrigin = 'center center';
                    // Disable default touch actions to prevent scrolling while panning
                    clone.style.touchAction = 'none';

                    modalContent.appendChild(clone);
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    // --- Mouse Events ---
                    clone.addEventListener('wheel', (e) => {
                        e.preventDefault();
                        const delta = e.deltaY * -0.001;
                        currentScale = Math.min(Math.max(0.5, currentScale + delta), 5);
                        updateTransform(clone);
                    });

                    clone.addEventListener('mousedown', (e) => {
                        isDragging = true;
                        startX = e.clientX - currentTranslateX;
                        startY = e.clientY - currentTranslateY;
                        clone.style.cursor = 'grabbing';
                    });

                    // --- Touch Events (Mobile) ---
                    clone.addEventListener('touchstart', (e) => {
                        if (e.touches.length === 1) {
                            isDragging = true;
                            startX = e.touches[0].clientX - currentTranslateX;
                            startY = e.touches[0].clientY - currentTranslateY;
                        }
                    }, { passive: false });

                    clone.addEventListener('touchmove', (e) => {
                        if (!isDragging) return;
                        e.preventDefault(); // Prevent page scroll
                        currentTranslateX = e.touches[0].clientX - startX;
                        currentTranslateY = e.touches[0].clientY - startY;
                        updateTransform(clone);
                    }, { passive: false });

                    clone.addEventListener('touchend', () => {
                        isDragging = false;
                    });
                }
            });
        });

        // Global Mouse Up/Move to handle dragging outside element
        window.addEventListener('mousemove', (e) => {
            if (!isDragging || !activeClone) return;
            e.preventDefault();
            currentTranslateX = e.clientX - startX;
            currentTranslateY = e.clientY - startY;
            updateTransform(activeClone);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (activeClone) activeClone.style.cursor = 'grab';
        });

        // --- Button Controls Logic ---
        if (btnZoomIn) {
            btnZoomIn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing modal
                if (activeClone) {
                    currentScale = Math.min(currentScale + 0.5, 5);
                    updateTransform(activeClone);
                }
            });
        }

        if (btnZoomOut) {
            btnZoomOut.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeClone) {
                    currentScale = Math.max(0.5, currentScale - 0.5);
                    updateTransform(activeClone);
                }
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeClone) {
                    currentScale = 1;
                    currentTranslateX = 0;
                    currentTranslateY = 0;
                    updateTransform(activeClone);
                }
            });
        }

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            activeClone = null;
            setTimeout(() => {
                modalContent.innerHTML = '';
            }, 300);
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

});

// Global function for Folder Tree
window.toggleFolder = function (element) {
    const children = element.nextElementSibling;
    const icon = element.querySelector('i');

    if (children) {
        children.classList.toggle('open');

        // Toggle icon
        if (children.classList.contains('open')) {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        } else {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        }
    }
};
