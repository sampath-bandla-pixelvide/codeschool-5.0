console.log("Hello World");

let products = [];
let catProducts = [];
$(document).ready(function () {
  fetchProducts();
  //   fetchProductsByCategory();
});
function fetchProducts() {
  showLoading("#featured-products");

  $.ajax({
    url: "https://dummyjson.com/products",
    method: "GET",
    success: (response) => {
      const products = response.products.slice(0, 8);
      displayProducts(products);
    },
    error: () => {
      showLoadingError("#featured-products", "Failed to load products");
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

      return `
      <div class="col mb-3">
        <div data-id="${product.id}">
          <div class="position-relative mx-2">
            <img src="${image}" class="img-fluid" />
          </div>

          <div class="text-center mt-3">
            <h6>${product.title}</h6>
            <span>₹${product.price}</span>
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
