const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const authGate = document.getElementById("authGate");
const cmsApp = document.getElementById("cmsApp");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const cmsProductsGrid = document.getElementById("cmsProductsGrid");
const productForm = document.getElementById("productForm");
const productFormMessage = document.getElementById("productFormMessage");
const cmsProductList = document.getElementById("cmsProductList");
const resetProductsButton = document.getElementById("resetProducts");

let revealObserver;
let products = window.TJStore.loadProducts();

function parseCommaList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

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

function syncProducts() {
  window.TJStore.saveProducts(products);
}

function renderCMSProducts() {
  if (!cmsProductsGrid || !cmsProductList) {
    return;
  }

  if (!products.length) {
    cmsProductsGrid.innerHTML = '<div class="empty-products reveal show">No products yet. Use the form to add your first product.</div>';
    cmsProductList.innerHTML = '<div class="empty-products">No products in the catalog.</div>';
    return;
  }

  cmsProductsGrid.innerHTML = products
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

  cmsProductList.innerHTML = products
    .map(
      (product) => `
        <div class="cms-product-item">
          <div class="cms-product-top">
            <strong>${escapeHtml(product.name)}</strong>
            <div class="cms-product-meta">
              ${product.isNew ? '<span class="cms-chip">New</span>' : ""}
              ${product.onSale ? '<span class="cms-chip">Sale</span>' : ""}
              ${product.outOfStock ? '<span class="cms-chip">Out of Stock</span>' : ""}
            </div>
          </div>
          <div class="cms-product-actions">
            <button type="button" class="cms-button ${product.onSale ? "is-active" : ""}" data-action="toggle-sale" data-id="${product.id}">Toggle Sale</button>
            <button type="button" class="cms-button ${product.outOfStock ? "is-active" : ""}" data-action="toggle-stock" data-id="${product.id}">Toggle Stock</button>
            <button type="button" class="cms-button is-danger" data-action="remove" data-id="${product.id}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");

  observeReveals(cmsProductsGrid);
}

function updateAuthView() {
  const isAuthed = window.TJStore.isAuthenticated();

  authGate.classList.toggle("hidden", isAuthed);
  cmsApp.classList.toggle("hidden", !isAuthed);
  logoutButton.classList.toggle("hidden", !isAuthed);

  if (isAuthed) {
    products = window.TJStore.loadProducts();
    renderCMSProducts();
    observeReveals(cmsApp);
  }
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

  navLinks.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = navLinks.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      closeMenu();
    }
  });
}

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = formData.get("loginUsername").toString().trim();
    const password = formData.get("loginPassword").toString();

    if (window.TJStore.login(username, password)) {
      loginMessage.textContent = "Login successful. Welcome to the CMS.";
      loginMessage.style.color = "#D4AF37";
      loginForm.reset();
      updateAuthView();
      return;
    }

    loginMessage.textContent = "Invalid login details. Please try again.";
    loginMessage.style.color = "#FCA5A5";
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    window.TJStore.logout();
    updateAuthView();
  });
}

if (productForm && productFormMessage) {
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(productForm);
    const name = formData.get("productName").toString().trim();
    const icon = formData.get("productIcon").toString().trim();
    const description = formData.get("productDescription").toString().trim();
    const sizes = parseCommaList(formData.get("productSizes").toString());
    const tags = parseCommaList(formData.get("productTags").toString());

    if (!name || !icon || !description || !sizes.length || !tags.length) {
      productFormMessage.textContent = "Please complete all product fields before adding a product.";
      productFormMessage.style.color = "#F4C542";
      return;
    }

    products.unshift({
      id: window.TJStore.createId(),
      name,
      icon: icon.slice(0, 2).toUpperCase(),
      description,
      sizes,
      tags,
      theme: formData.get("productTheme").toString(),
      isNew: formData.has("productNew"),
      onSale: formData.has("productSale"),
      outOfStock: formData.has("productOutOfStock"),
    });

    syncProducts();
    renderCMSProducts();
    productForm.reset();
    productFormMessage.textContent = "Product added successfully.";
    productFormMessage.style.color = "#D4AF37";
  });
}

if (cmsProductList) {
  cmsProductList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const { action, id } = button.dataset;
    const product = products.find((item) => item.id === id);

    if (!product) {
      return;
    }

    if (action === "toggle-sale") {
      product.onSale = !product.onSale;
    }

    if (action === "toggle-stock") {
      product.outOfStock = !product.outOfStock;
    }

    if (action === "remove") {
      products = products.filter((item) => item.id !== id);
    }

    syncProducts();
    renderCMSProducts();
  });
}

if (resetProductsButton) {
  resetProductsButton.addEventListener("click", () => {
    products = window.TJStore.resetProducts();
    renderCMSProducts();

    if (productFormMessage) {
      productFormMessage.textContent = "Demo products restored.";
      productFormMessage.style.color = "#D4AF37";
    }
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

updateAuthView();
observeReveals();
