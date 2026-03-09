const TJStore = (() => {
  const PRODUCT_STORAGE_KEY = "tj-snacks-products";
  const AUTH_STORAGE_KEY = "tj-snacks-cms-auth";
  const CMS_USERNAME = "owner";
  const CMS_PASSWORD = "TJSnacks2026!";

  const createId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `tj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const buildDefaultProducts = () => [
    {
      id: createId(),
      name: "Balers",
      icon: "B",
      description: "Popular snack range available in multiple pack sizes for retail and wholesale distribution.",
      sizes: ["50 × 16g", "50 × 20g", "40 × 30g", "12 × 100g"],
      tags: ["Mixed", "BBQ", "Tomato", "Cheese", "Sweet Chilli", "Fruit Chutney"],
      theme: "vibrant-1",
      isNew: false,
      onSale: false,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Puffs",
      icon: "P",
      description: "Light soft snacks designed for everyday enjoyment and convenient shelf movement.",
      sizes: ["50 × 24g"],
      tags: ["Cheese", "Spring Onion", "Savoury"],
      theme: "vibrant-2",
      isNew: false,
      onSale: true,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Tubes",
      icon: "T",
      description: "Larger sharing packs suited to gatherings, resellers and bulk buyers.",
      sizes: ["1kg", "1.75kg", "2kg", "3kg"],
      tags: ["Spicy Tomato", "BBQ", "Cheese", "Spicy Beef"],
      theme: "vibrant-3",
      isNew: false,
      onSale: false,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Mielie Pops",
      icon: "M",
      description: "A well-known TJ Snacks line offered in larger pack formats and wholesale-ready volumes.",
      sizes: ["1kg", "1.75kg", "2kg", "3kg"],
      tags: ["Bulk Packs", "Wholesale Ready"],
      theme: "vibrant-4",
      isNew: false,
      onSale: false,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Sweet Chilli Sauce",
      icon: "S",
      description: "Bold sweet-and-heat sauce made to pair with chips, puffs and snack platters.",
      sizes: ["12 × 250ml", "6 × 500ml"],
      tags: ["Sweet", "Chilli", "Snack Dip"],
      theme: "vibrant-5",
      isNew: true,
      onSale: false,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Smoky BBQ Sauce",
      icon: "S",
      description: "Rich smoky sauce crafted for braai packs, chips and savoury snack flavours.",
      sizes: ["12 × 250ml", "6 × 500ml"],
      tags: ["Smoky", "BBQ", "Dipping"],
      theme: "vibrant-6",
      isNew: true,
      onSale: true,
      outOfStock: false,
    },
    {
      id: createId(),
      name: "Peri-Peri Sauce",
      icon: "S",
      description: "Spicy sauce option for customers who enjoy stronger flavour in every bite.",
      sizes: ["12 × 250ml", "6 × 500ml"],
      tags: ["Hot", "Peri-Peri", "Flavour Boost"],
      theme: "vibrant-7",
      isNew: true,
      onSale: false,
      outOfStock: true,
    },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const loadProducts = () => {
    try {
      const savedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
      return savedProducts ? JSON.parse(savedProducts) : buildDefaultProducts();
    } catch (error) {
      return buildDefaultProducts();
    }
  };

  const saveProducts = (products) => {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  };

  const resetProducts = () => {
    const defaults = buildDefaultProducts();
    saveProducts(defaults);
    return defaults;
  };

  const isAuthenticated = () => sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";

  const login = (username, password) => {
    const isValid = username === CMS_USERNAME && password === CMS_PASSWORD;

    if (isValid) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
    }

    return isValid;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    createId,
    clone,
    loadProducts,
    saveProducts,
    resetProducts,
    isAuthenticated,
    login,
    logout,
  };
})();

window.TJStore = TJStore;
