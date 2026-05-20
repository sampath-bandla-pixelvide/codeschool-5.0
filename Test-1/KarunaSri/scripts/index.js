console.log("Hello World");

let products = [];
let catProducts = [];

$(document).on("click", ".cat-btn", function () {
  const category = $(this).data("category");
  $(".cat-btn").removeClass("active text-dark").addClass("text-muted");
  $(this).addClass("active text-dark").removeClass("text-muted");
  fetchProductsByCategoryName(category);
});

function fetchProducts() {
  fetchProductsByCategoryName("beauty");
}

function fetchProductsByCategoryName(category) {
  showLoading("#featured-products");

  $.ajax({
    url: `https://dummyjson.com/products/category/${category}`,
    method: "GET",
    success: (response) => {
      const products = response.products.slice(0, 8);
      displayProducts(products);
    },
    error: () => {
      showLoadingError(
        "#featured-products",
        `Failed to load ${category} products`,
      );
    },
  });
}

function showLoading(selector) {
  $(selector).html(`
    <div class="col-12 text-center">
      <p>Loading...</p>
    </div>
  `);
}

function showLoadingError(selector, message) {
  $(selector).html(`
    <div class="col-12 text-center text-danger">
      <p>${message}</p>
    </div>
  `);
}

function fetchProductsByCategory() {
  showLoading("#category-products");

  $.ajax({
    url: "https://dummyjson.com/products/categories",
    method: "GET",
    success: (response) => {
      const categories = response.slice(0, 5);
      displayCategoryProducts(categories);
    },
    error: () => {
      showLoadingError("#category-products", "Failed to load categories");
    },
  });
}

function displayProducts(products) {
  if (!products.length) {
    showLoadingError("#featured-products", "No products found");
    return;
  }

  const html = products
    .map((product) => {
      const image = product.images?.[0];
      const discount = Math.round(product.discountPercentage);

      return `
      <div class="col">
        <div class="product-card" data-id="${product.id}">
          <div class="position-relative overflow-hidden rounded">
            ${
              discount > 0
                ? `<span class="badge bg-light text-dark position-absolute top-0 start-0 m-3 shadow-sm" style="z-index: 2;">-${discount}%</span>`
                : ""
            }
            <div class="bg-body-secondary p-4 d-flex align-items-center justify-content-center" style="height: 280px;">
               <img src="${image}" class="img-fluid" style="max-height: 100%; object-fit: contain;" alt="${product.title}" />
            </div>
            <span class="wishlist-icon position-absolute top-0 end-0 m-3 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm cursor-pointer" style="width: 35px; height: 35px; z-index: 2;">
              <i class="bi bi-heart fs-5"></i>
            </span>
          </div>

          <div class="text-center mt-3">
            <h6 class="mb-1 text-dark fw-medium">${product.title}</h6>
            <span class="text-muted small">₹${product.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  $("#featured-products").html(html);
}

function displayCategoryProducts(categories) {
  if (!categories.length) {
    showLoadingError("#category-products", "No categories found");
    return;
  }

  const html = categories
    .map(
      (category) => `
    <div class="col text-center">
      <div class="p-3 border">
        <h6>${category}</h6>
      </div>
    </div>
  `,
    )
    .join("");

  $("#category-products").html(html);
}
