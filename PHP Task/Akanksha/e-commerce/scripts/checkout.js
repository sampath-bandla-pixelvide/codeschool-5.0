function placeOrder() {
  const checkoutItems = JSON.parse(localStorage.getItem(checkoutKey)) || [];
  const address_id = $("input[name='address']:checked").val();
  const payment_method = $("#payment").val();

  if (checkoutItems.length === 0) {
    alert("Cart is empty");
    return;
  }

  if (!address_id) {
    alert("Please select address");
    return;
  }

  $.ajax({
    url: "api/order_api.php",
    method: "POST",
    dataType: "json",
    data: {
      user_id: user_id,
      items: JSON.stringify(checkoutItems),
      address_id: address_id,
      payment_method: payment_method,
    },
    success: function (res) {
      console.log(res);

      if (res.status) {
        localStorage.removeItem(cartKey);
        localStorage.removeItem(checkoutKey);

        Swal.fire("Success", "Order placed!", "success").then(() => {
          window.location.href = "user_orders.html";
        });
      }
    },
  });
}

const user_id = localStorage.getItem("user_id");

if (!user_id) {
  window.location.href = "index.html";
}

const cartKey = "cart_" + user_id;
const checkoutKey = "checkout_" + user_id;

$(document).ready(function () {
  loadCheckoutItems();
  loadAddresses();
});

function loadCheckoutItems() {
  let checkout = [];

  try {
    checkout = JSON.parse(localStorage.getItem(checkoutKey)) || [];
  } catch (e) {
    checkout = [];
  }

  if (checkout.length === 0) {
    $("#checkoutItems").html("No items found");
    return;
  }

  $.ajax({
    url: "api/products.php",
    method: "GET",
    dataType: "json",
    success: function (products) {
      let html = "";
      let total = 0;

      checkout.forEach((item) => {
        const product = products.find((p) => p.id == item.product_id);

        if (!product) return;

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        html += `
          <div class="card shadow-sm p-3 mb-3">
            <div class="row align-items-center">

              <div class="col-md-3 text-center">
                <img src="${product.image}"
                     class="img-fluid"
                     style="max-height:100px; object-fit:contain;">
              </div>

              <div class="col-md-6">
                <h6>${product.product_name}</h6>
                <p class="mb-1">₹${product.price}</p>
                <p class="mb-0">
                  Quantity: <strong>${item.quantity}</strong>
                </p>
              </div>
            </div>
          </div>
        `;
      });

      $("#checkoutItems").html(html);
      $("#checkoutTotal").text(total);
    },
  });
}

function loadAddresses() {
  const user_id = localStorage.getItem("user_id");

  $.ajax({
    url: "api/get_addresses.php",
    method: "GET",
    data: { user_id: user_id },
    dataType: "json",
    success: function (res) {
      let html = "";

      if (!res.data || res.data.length === 0) {
        html = `<p class="text-muted">No addresses found</p>`;
      } else {
        res.data.forEach((a) => {
          html += `
            <div class="card p-3 mb-2 d-flex justify-content-between">

              <div>
                <input type="radio" name="address" value="${a.id}">
                
                <div class="ms-2">
                  <strong>${a.address_line}</strong><br>
                  ${a.city}, ${a.state}<br>
                  ${a.country} - ${a.pincode}
                </div>
              </div>
            </div>
          `;
        });
      }

      $("#addressList").html(html);
    },
  });
}

function saveAddress() {
  const user_id = localStorage.getItem("user_id");

  const data = {
    user_id: user_id,
    address_line: $("#address_line").val(),
    city: $("#city").val(),
    state: $("#state").val(),
    country: $("#country").val(),
    pincode: $("#pincode").val(),
  };

  if (!data.address_line || !data.city || !data.state || !data.pincode) {
    alert("Fill all required fields");
    return;
  }

  $.ajax({
    url: "api/save_address.php",
    method: "POST",
    data: data,
    dataType: "json",
    success: function (res) {
      if (res.status) {
        $(".modal").modal("hide");

        $("#address_line, #city, #state, #country, #pincode").val("");

        loadAddresses();
      }
    },
  });
}
