const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const navParent = document.querySelector('.nav-parent');
const navGroup = document.querySelector('.nav-group');
const sections = Array.from(document.querySelectorAll('main section[id], main section[data-section="Home"]'));
const revealItems = document.querySelectorAll('.reveal');
const photoPanels = document.querySelectorAll('.image-panel-photo');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const currentPage = document.body.dataset.page;

if (menuToggle && nav) {
    const closeMenu = () => {
        nav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        if (navGroup && navParent) {
            navGroup.classList.remove('is-open');
            navParent.setAttribute('aria-expanded', 'false');
        }
    };

    const openMenu = () => {
        nav.classList.add('is-open');
        menuToggle.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
    };

    menuToggle.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
            closeMenu();
            return;
        }

        openMenu();
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    if (navGroup && navParent) {
        navParent.addEventListener('click', () => {
            if (window.innerWidth > 760) {
                return;
            }

            const isOpen = navGroup.classList.toggle('is-open');
            navParent.setAttribute('aria-expanded', String(isOpen));
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) {
            closeMenu();
        }
    });
}

if (currentPage) {
    navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.pageLink === currentPage);
    });

    if (navParent && (currentPage === 'products' || currentPage === 'snacks' || currentPage === 'sauces')) {
        navParent.classList.add('is-active');
    }
}

if (currentPage === 'home' && sections.length > 0 && navLinks.length > 0) {
    let scrollLockTimer = null;
    let lockedSection = null;

    const setActiveLink = (sectionId) => {
        if (lockedSection !== null) return;

        navLinks.forEach((link) => {
            const isMatch = link.getAttribute('href') === `index.html#${sectionId}` || (sectionId === 'top' && link.getAttribute('href') === 'index.html#top');
            link.classList.toggle('is-active', isMatch);
        });

        if (navParent) {
            navParent.classList.remove('is-active');
        }
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            const hashMatch = href && href.match(/#(.+)$/);
            if (!hashMatch) return;

            const targetSection = hashMatch[1];
            lockedSection = targetSection;

            navLinks.forEach((l) => {
                const isMatch = l.getAttribute('href') === href;
                l.classList.toggle('is-active', isMatch);
            });
            if (navParent) navParent.classList.remove('is-active');

            clearTimeout(scrollLockTimer);
            scrollLockTimer = setTimeout(() => {
                lockedSection = null;
            }, 1200);
        });
    });

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                setActiveLink(entry.target.id || 'top');
            });
        },
        {
            threshold: 0.35,
            rootMargin: '-25% 0px -45% 0px'
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

if (revealItems.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.18,
            rootMargin: '0px 0px -8% 0px'
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (photoPanels.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    photoPanels.forEach((panel) => {
        panel.addEventListener('mousemove', (event) => {
            const bounds = panel.getBoundingClientRect();
            const percentX = (event.clientX - bounds.left) / bounds.width;
            const percentY = (event.clientY - bounds.top) / bounds.height;
            const rotateY = (percentX - 0.5) * 5;
            const rotateX = (0.5 - percentY) * 5;

            panel.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
            panel.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.setProperty('--tilt-x', '0deg');
            panel.style.setProperty('--tilt-y', '0deg');
        });
    });
}

if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        formSuccess.textContent = 'Thank you. Your message has been received and we will be in touch soon.';
        contactForm.reset();
    });
}

const productButtons = document.querySelectorAll('[data-product-target]');
const productInterestField = document.getElementById('product-interest');

if (productButtons.length > 0 && productInterestField) {
    productButtons.forEach((button) => {
        button.addEventListener('click', () => {
            productInterestField.value = button.dataset.productTarget;
            productInterestField.dispatchEvent(new Event('change', { bubbles: true }));
            productInterestField.focus({ preventScroll: true });
        });
    });
}
