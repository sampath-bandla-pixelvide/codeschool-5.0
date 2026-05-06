$(document).on("click", "#sidebarToggle", function () {
  $(".sidebar").toggleClass("show");
});

$(document).on("click", "#logout", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

$(document).ready(function () {
  loadProducts();
  loadUser();
});

function loadProducts() {
  $.ajax({
    url: "api/products.php",
    method: "GET",
    dataType: "json",
    success: function (res) {
      let html = "";

      res.forEach((p) => {
        html += `
          <div class="col-md-4 mb-4">
        <div class="card shadow-sm product-card rounded-3 h-100">
          <div class="d-flex justify-content-center align-items-center" style="height:220px;">
            <img src="${p.image}"
              style="max-height:200px; object-fit:contain;">
          </div>
          <div class="card-body text-center">
            <h5 class="card-title">${p.product_name}</h5>
            <p class="card-text  fw-bold">
              ₹${p.price}
            </p>

            <button class="btn btn-primary"
                    onclick="viewProduct(${p.id})">
              View
            </button>

          </div>
        </div>
      </div>
    `;
      });

      $("#productList").html(html);
    },
  });
}

function viewProduct(id) {
  window.location.href = `view_product.html?id=${id}`;
}

user_id = localStorage.getItem("user_id");

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
