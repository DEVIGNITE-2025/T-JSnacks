const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const productsGrid = document.getElementById("productsGrid");
const scrollTopButton = document.getElementById("scrollTopButton");

/* Seamless ticker: clone the inner strip so the animation loops without gaps */
const brandsTrack = document.querySelector(".brands-track");
const brandsOriginal = document.querySelector(".brands-inner");
if (brandsTrack && brandsOriginal) {
  brandsTrack.appendChild(brandsOriginal.cloneNode(true));
}

let revealObserver;
const products = window.TJStore ? window.TJStore.loadProducts() : [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function observeReveals(scope = document) {
  const elements = scope.querySelectorAll(".reveal, .reveal-left");

  if (!elements.length) {
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }

  /* Assign stagger delays to grid / list children */
  scope.querySelectorAll(".products-grid, .features-grid, .hero-stats, .contact-list").forEach((grid) => {
    const kids = grid.querySelectorAll(".reveal, .reveal-left");
    kids.forEach((kid, i) => {
      kid.classList.add("delay-" + Math.min(i + 1, 7));
    });
  });

  elements.forEach((el) => revealObserver.observe(el));
}

function renderProducts() {
  if (!productsGrid) {
    return;
  }

  if (!products.length) {
    productsGrid.innerHTML = '<div class="empty-products reveal show">No products yet. Use the owner CMS to add your first product.</div>';
    return;
  }

  productsGrid.innerHTML = products
    .map((product) => {
      const statusBadges = [
        product.onSale ? '<span class="status-badge status-sale">On Sale</span>' : "",
        product.outOfStock ? '<span class="status-badge status-out">Out of Stock</span>' : "",
      ]
        .filter(Boolean)
        .join("");

      const sizes = product.sizes.map((size) => `<li>${escapeHtml(size)}</li>`).join("");
      const tags = product.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      const hasImage = typeof product.image === "string" && product.image.trim().length > 0;
      const imageMarkup = hasImage
        ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />`
        : '<span class="product-image-placeholder">Product Image</span>';

      return `
        <article class="product-card ${escapeHtml(product.theme)} ${product.outOfStock ? "is-out-of-stock" : ""} reveal show">
          <div class="product-image-slot">${imageMarkup}</div>
          ${product.isNew ? '<span class="new-product-badge">New Product</span>' : ""}
          ${statusBadges ? `<div class="product-statuses">${statusBadges}</div>` : ""}
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <ul>${sizes}</ul>
          <div class="tag-wrap">${tags}</div>
        </article>
      `;
    })
    .join("");

  observeReveals(productsGrid);
}

if (window.location.pathname.endsWith("/admin") || window.location.hash === "#admin") {
  window.location.href = "cms.html";
}

if (scrollTopButton) {
  const syncScrollTopButton = () => {
    if (window.scrollY > 260) {
      scrollTopButton.classList.add("show");
      return;
    }

    scrollTopButton.classList.remove("show");
  };

  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", syncScrollTopButton, { passive: true });
  syncScrollTopButton();
}

if (menuToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = navLinks.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
      formMessage.textContent = "Please complete all fields before sending your enquiry.";
      formMessage.style.color = "#F4C542";
      return;
    }

    formMessage.textContent =
      "Thank you. Your enquiry has been captured in this demo and can now be connected to email or a backend.";
    formMessage.style.color = "#D4AF37";

    contactForm.reset();
  });
}

if ("IntersectionObserver" in window) {
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );
}

renderProducts();
observeReveals();