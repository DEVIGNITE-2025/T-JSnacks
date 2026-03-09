const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const productsGrid = document.getElementById("productsGrid");
const cmsLoginButton = document.getElementById("cmsLoginButton");

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
  const elements = scope.querySelectorAll(".reveal");

  if (!elements.length) {
    return;
  }

  if (revealObserver) {
    elements.forEach((element) => revealObserver.observe(element));
    return;
  }

  elements.forEach((element) => element.classList.add("show"));
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

      return `
        <article class="product-card ${escapeHtml(product.theme)} ${product.outOfStock ? "is-out-of-stock" : ""} reveal show">
          <div class="product-icon">${escapeHtml(product.icon.slice(0, 2).toUpperCase())}</div>
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

if (cmsLoginButton && window.TJStore) {
  cmsLoginButton.textContent = window.TJStore.isAuthenticated() ? "Open CMS" : "Login";
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