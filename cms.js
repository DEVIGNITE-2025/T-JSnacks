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
const productImageInput = document.getElementById("productImage");
const cmsImagePreview = document.getElementById("cmsImagePreview");
const saveProductButton = document.getElementById("saveProductButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const cmsTitle = document.getElementById("cmsTitle");

let revealObserver;
let products = window.TJStore.loadProducts();
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
let editingProductId = null;
let editingProductImage = "";

function setImagePreview(dataUrl) {
  if (!cmsImagePreview) {
    return;
  }

  if (!dataUrl) {
    cmsImagePreview.innerHTML = "No image selected.";
    cmsImagePreview.classList.remove("has-image");
    return;
  }

  cmsImagePreview.innerHTML = `<img src="${escapeHtml(dataUrl)}" alt="Selected product image preview" />`;
  cmsImagePreview.classList.add("has-image");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.readAsDataURL(file);
  });
}

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

function setEditMode(active) {
  if (saveProductButton) {
    saveProductButton.textContent = active ? "Save Changes" : "Add Product";
  }

  if (cancelEditButton) {
    cancelEditButton.classList.toggle("hidden", !active);
  }

  if (cmsTitle) {
    cmsTitle.textContent = active ? "Edit product" : "Add a new product";
  }
}

function resetProductForm() {
  if (!productForm) {
    return;
  }

  editingProductId = null;
  editingProductImage = "";
  productForm.reset();
  if (productImageInput) {
    productImageInput.value = "";
  }
  setImagePreview("");
  setEditMode(false);
}

function populateProductForm(product) {
  if (!productForm) {
    return;
  }

  document.getElementById("productName").value = product.name;
  document.getElementById("productIcon").value = product.icon || product.name.slice(0, 2).toUpperCase();
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productSizes").value = product.sizes.join(", ");
  document.getElementById("productTags").value = product.tags.join(", ");
  document.getElementById("productTheme").value = product.theme;
  document.getElementById("productNew").checked = Boolean(product.isNew);
  document.getElementById("productSale").checked = Boolean(product.onSale);
  document.getElementById("productOutOfStock").checked = Boolean(product.outOfStock);

  editingProductId = product.id;
  editingProductImage = typeof product.image === "string" ? product.image : "";
  if (productImageInput) {
    productImageInput.value = "";
  }
  setImagePreview(editingProductImage);
  setEditMode(true);
  productFormMessage.textContent = "Editing product. Update any fields and click Save Changes.";
  productFormMessage.style.color = "#D4AF37";
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <button type="button" class="cms-button" data-action="edit" data-id="${product.id}">Edit</button>
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
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isEditing = Boolean(editingProductId);

    const formData = new FormData(productForm);
    const name = formData.get("productName").toString().trim();
    const icon = formData.get("productIcon").toString().trim();
    const description = formData.get("productDescription").toString().trim();
    const sizes = parseCommaList(formData.get("productSizes").toString());
    const tags = parseCommaList(formData.get("productTags").toString());
    const imageFile = productImageInput && productImageInput.files ? productImageInput.files[0] : null;

    if (!name || !icon || !description || !sizes.length || !tags.length) {
      productFormMessage.textContent = "Please complete all product fields before saving the product.";
      productFormMessage.style.color = "#F4C542";
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      productFormMessage.textContent = "Please upload a valid image file.";
      productFormMessage.style.color = "#F4C542";
      return;
    }

    if (imageFile && imageFile.size > MAX_IMAGE_BYTES) {
      productFormMessage.textContent = "Image is too large. Please upload an image smaller than 3MB.";
      productFormMessage.style.color = "#F4C542";
      return;
    }

    let imageDataUrl = "";
    if (imageFile) {
      try {
        imageDataUrl = await fileToDataUrl(imageFile);
      } catch (error) {
        productFormMessage.textContent = "Could not process the selected image. Please try another file.";
        productFormMessage.style.color = "#F4C542";
        return;
      }
    }

    if (isEditing) {
      const targetIndex = products.findIndex((item) => item.id === editingProductId);

      if (targetIndex === -1) {
        productFormMessage.textContent = "The selected product could not be found. Please try again.";
        productFormMessage.style.color = "#F4C542";
        resetProductForm();
        renderCMSProducts();
        return;
      }

      const finalImage = imageDataUrl || editingProductImage || "";
      products[targetIndex] = {
        ...products[targetIndex],
        name,
        icon: icon.slice(0, 2).toUpperCase(),
        image: finalImage,
        description,
        sizes,
        tags,
        theme: formData.get("productTheme").toString(),
        isNew: formData.has("productNew"),
        onSale: formData.has("productSale"),
        outOfStock: formData.has("productOutOfStock"),
      };
    } else {
      products.unshift({
        id: window.TJStore.createId(),
        name,
        icon: icon.slice(0, 2).toUpperCase(),
        image: imageDataUrl,
        description,
        sizes,
        tags,
        theme: formData.get("productTheme").toString(),
        isNew: formData.has("productNew"),
        onSale: formData.has("productSale"),
        outOfStock: formData.has("productOutOfStock"),
      });
    }

    syncProducts();
    renderCMSProducts();
    resetProductForm();
    productFormMessage.textContent = isEditing ? "Product updated successfully." : "Product added successfully.";
    productFormMessage.style.color = "#D4AF37";
  });
}

if (productImageInput) {
  productImageInput.addEventListener("change", async () => {
    const imageFile = productImageInput.files ? productImageInput.files[0] : null;

    if (!imageFile) {
      setImagePreview("");
      return;
    }

    if (!imageFile.type.startsWith("image/")) {
      productFormMessage.textContent = "Please upload a valid image file.";
      productFormMessage.style.color = "#F4C542";
      productImageInput.value = "";
      setImagePreview("");
      return;
    }

    if (imageFile.size > MAX_IMAGE_BYTES) {
      productFormMessage.textContent = "Image is too large. Please upload an image smaller than 3MB.";
      productFormMessage.style.color = "#F4C542";
      productImageInput.value = "";
      setImagePreview("");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(imageFile);
      setImagePreview(dataUrl);
    } catch (error) {
      productFormMessage.textContent = "Could not process the selected image. Please try another file.";
      productFormMessage.style.color = "#F4C542";
      setImagePreview("");
    }
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

    if (action === "edit") {
      populateProductForm(product);
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

      if (editingProductId === id) {
        resetProductForm();
      }
    }

    syncProducts();
    renderCMSProducts();
  });
}

if (resetProductsButton) {
  resetProductsButton.addEventListener("click", () => {
    products = window.TJStore.resetProducts();
    renderCMSProducts();
    resetProductForm();

    if (productFormMessage) {
      productFormMessage.textContent = "Demo products restored.";
      productFormMessage.style.color = "#D4AF37";
    }
  });
}

if (cancelEditButton) {
  cancelEditButton.addEventListener("click", () => {
    resetProductForm();
    productFormMessage.textContent = "Edit cancelled.";
    productFormMessage.style.color = "#D4AF37";
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
