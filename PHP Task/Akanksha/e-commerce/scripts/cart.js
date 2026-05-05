$(document).ready(function () {
  loadCart();
});

const role = localStorage.getItem("role");

if (role !== "user") {
  window.location.href = "index.html";
}
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

const user_id = localStorage.getItem("user_id");

const cartKey = "cart_" + user_id;
const checkoutKey = "checkout_" + user_id;

function loadCart() {
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch (e) {
    cart = [];
  }

  if (cart.length === 0) {
    $("#cartItems").html("Cart is empty");
    return;
  }

  $.ajax({
    url: "api/products.php",
    method: "GET",
    dataType: "json",
    success: function (products) {
      let html = "";
      let total = 0;

      cart.forEach((item) => {
        const product = products.find((p) => p.id == item.product_id);

        if (!product) return;

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        html += `
          <div class="card shadow-sm p-3 mb-3 w-50">
            <div class="row align-items-center">
              <div class="col-md-3 text-center">
                <img src="${product.image}" 
                     class="img-fluid"
                     style="max-height:120px; object-fit:contain;">
              </div>

              <div class="col-md-6">
                <h5>${product.product_name}</h5>
                <p class="mb-1">₹${product.price}</p>
                <p class="mb-0">
                  Quantity: <strong>${item.quantity}</strong>
                </p>
              </div>


            </div>
          </div>
        `;
      });

      $("#cartItems").html(html);
      $("#total").text(total);
    },
  });
}

function goToCheckout() {
  const cart = localStorage.getItem(cartKey);
  localStorage.setItem(checkoutKey, cart);
  window.location.href = "checkout.html";
}

loadUser();

function loadUser() {
  $.ajax({
    url: "/api/get_user.php",
    method: "GET",
    dataType: "json",
    data: {
      user_id: user_id,
    },
    success: function (res) {
      if (res.status) {
        console.log(res);

        $("#userName").text(res.data.first_name);
        $("#userNameDropdown").text(res.data.first_name);
        $("#userEmail").text(res.data.email);
        $("#role").text(res.data.role);

        const name = res.data.first_name;
        const initial = name.charAt(0).toUpperCase();

        $("#userAvatar").text(initial);
      }
    },
  });
}
