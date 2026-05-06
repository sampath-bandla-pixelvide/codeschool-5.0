$(document).on("click", "#sidebarToggle", function () {
  $(".sidebar").toggleClass("show");
});

const role = localStorage.getItem("role");

if (role !== "user") {
  window.location.href = "index.html";
}
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

$(document).on("click", "#logout", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  loadProductDetails(productId);
});

function loadProductDetails(id) {
  $.ajax({
    url: "api/products.php",
    method: "GET",
    dataType: "json",
    success: function (res) {
      const product = res.find((p) => p.id == id);

      if (!product) return;

      let html = `
        <div class="card shadow p-4 w-75 ms-5">
  <div class="row align-items-center">
    
    <div class="col-md-5 text-center">
      <img src="${product.image}" 
           class="img-fluid"
           style="max-height:350px; object-fit:contain;">
    </div>

    <div class="col-md-7">
      
      <h3 class="mb-3">${product.product_name}</h3>

      <h4 class="text-primary fw-bold mb-3">
        ₹${product.price}
      </h4>

      <p class="text-muted">
        ${product.description || "No description available for this product."}
      </p>

      <div class="mb-3">
        <label class="fw-bold">Quantity:</label>
        <select id="quantity" class="form-select w-25">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

        <button class="btn btn-warning mt-3 me-2"
          onclick="addToCart(${product.id})">
          Add to Cart
        </button>

      <button class="btn btn-danger mt-3 px-3"
        onclick="buyNow(${product.id})">
        Buy Now
      </button>

    </div>

  </div>
</div>
      `;

      $("#productDetails").html(html);
    },
  });
}

const user_id = localStorage.getItem("user_id");

if (!user_id) {
  window.location.href = "index.html";
}

const cartKey = "cart_" + user_id;
const checkoutKey = "checkout_" + user_id;

function addToCart(productId) {
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch (e) {
    cart = [];
  }

  const qty = $("#quantity").val();
  const existing = cart.find((item) => item.product_id == productId);

  if (existing) {
    existing.quantity += parseInt(qty);
  } else {
    cart.push({
      product_id: productId,
      quantity: parseInt(qty),
    });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));

  //Swal.fire("Added!", "Product added to cart", "success");
  window.location.href = "cart.html";
}

function buyNow(productId) {
  const qty = parseInt($("#quantity").val());

  $.ajax({
    url: "api/products.php",
    method: "GET",
    dataType: "json",
    success: function (products) {
      const product = products.find((p) => p.id == productId);

      if (!product) {
        alert("Product not found");
        return;
      }

      const checkoutData = [
        {
          product_id: product.id,
          product_name: product.product_name,
          price: product.price,
          image: product.image,
          quantity: qty,
        },
      ];

      localStorage.setItem(checkoutKey, JSON.stringify(checkoutData));

      // redirect
      window.location.href = "checkout.html";
    },
  });
}

// function orderProduct(productId) {
//   $.ajax({
//     url: "api/order_api.php",
//     method: "POST",
//     dataType: "json",
//     data: {
//       product_id: productId,
//       user_id: user_id,
//     },
//     success: function (res) {
//       if (res.status) {
//         Swal.fire({
//           title: "Order Placed!",
//           icon: "success",
//           confirmButtonText: "View Orders",
//         }).then(() => {
//           window.location.href = "user_orders.html";
//         });
//       }
//     },
//     error: function () {
//       Swal.fire("Error", "Something went wrong", "error");
//     },
//   });
// }
