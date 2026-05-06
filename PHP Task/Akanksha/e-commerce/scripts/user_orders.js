$(document).on("click", "#sidebarToggle", function () {
  $(".sidebar").toggleClass("show");
});

$(document).on("click", "#logout", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  window.location.href = "index.html";
});

user_id = localStorage.getItem("user_id");
console.log(user_id);

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

$(document).ready(function () {
  const user_id = localStorage.getItem("user_id");

  $.ajax({
    url: "api/get_orders.php",
    method: "GET",
    data: { user_id: user_id },
    dataType: "json",
    success: function (res) {
      let html = "";

      if (!res.data || res.data.length === 0) {
        html = `
          <div class="text-center text-muted mt-5">
            No orders found
          </div>
        `;
      } else {
        res.data.forEach((o) => {
          html += `
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm p-3 h-100">
                
                <div class="d-flex justify-content-between mb-2 align-items-start">
                  <div class="d-flex flex-column">
                    <h6 class="mb-0">Order #${o.order_id}</h6>
                  <p class="text-muted small">
  Order placed: ${new Date(o.created_at).toDateString()}
</p>
                  </div>
                  ${formatStatus(o.order_status)}
                </div>

                <h5>${o.product_name}</h5>

                <p class="mb-1">
                  Price: ₹${o.price}
                </p>

                <p class="mb-1">
                  Quantity: <strong>${o.quantity}</strong>
                </p>

                <p class="fw-bold text-primary">
                  Total: ₹${o.price * o.quantity}
                </p>

              </div>
            </div>
          `;
        });
      }

      $("#ordersList").html(html);
    },
  });
});

function formatStatus(status) {
  if (status === "processing") {
    return `<span class="badge bg-warning text-dark align-self-start ">processing</span>`;
  } else if (status === "shipped") {
    return `<span class="badge bg-warning text-dark align-self-start">shipped</span>`;
  } else if (status === "cancelled") {
    return `<span class="badge bg-danger align-self-start">Cancelled</span>`;
  } else {
    return `<span class="badge bg-success align-self-start">${status}</span>`;
  }
}

// $(document).ready(function () {
//   $.ajax({
//     url: "api/get_orders.php",
//     method: "GET",
//     data: {
//       user_id: user_id,
//     },
//     dataType: "json",
//     success: function (res) {
//       console.log(res);
//       let html = "";

//       res.data.forEach((o) => {
//         html += `
//           <tr>
//             <td>${o.order_id}</td>
//             <td>${o.product_name}</td>
//             <td>${o.price}</td>
//             <td>${o.order_status}</td>
//           </tr>
//         `;
//       });

//       $("#ordersTable").html(html);
//     },
//     error: function (err) {
//       console.log(err);
//     },
//   });
// });
