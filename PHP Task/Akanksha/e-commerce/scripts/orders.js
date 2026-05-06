$(document).on("click", ".nav-link", function () {
  console.log("clicked");
});

$(document).on("click", "#sidebarToggle", function () {
  $(".sidebar").toggleClass("show");
});

$(document).on("click", "#logout", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

$(document).ready(function () {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    window.location.href = "index.html";
  }
  const token = localStorage.getItem("token");
  if(!token) {
    window.location.href = "index.html";
  }
});

$(document).ready(function () {
  loadOrders();
});

function loadOrders() {
  $.ajax({
    url: "api/getorders_admin.php",
    method: "GET",
    success: function (res) {
      let data = typeof res === "string" ? JSON.parse(res) : res;

      let rows = "";

      data.data.forEach((order) => {
        rows += `
          <tr>
            <td>${order.order_id}</td>
            <td>${order.user_id}</td>
            <td>${order.product_name}</td>
            <td>${order.quantity}</td>
            <td>${order.item_total}</td>

            <td>
              <select class="form-select status-select" data-id="${order.order_id}">
                <option value="processing" ${order.order_status === "processing" ? "selected" : ""}>processing</option>
                <option value="shipped" ${order.order_status === "shipped" ? "selected" : ""}>Shipped</option>
                <option value="delivered" ${order.order_status === "delivered" ? "selected" : ""}>Delivered</option>
              </select>
            </td>

            <td>
              <button class="btn btn-primary btn-sm update-status" data-id="${order.order_id}">
                Update
              </button>
            </td>
          </tr>
        `;
      });

      $("#ordersTable").html(rows);
    },
  });
}

$(document).on("click", ".update-status", function () {
  let order_id = $(this).data("id");
  let status = $(`select[data-id='${order_id}']`).val();

  $.ajax({
    url: "api/update_order_status.php",
    method: "POST",
    data: {
      order_id: order_id,
      status: status,
    },
    success: function (res) {
      let data = typeof res === "string" ? JSON.parse(res) : res;

      alert(data.message);
      loadOrders();
    },
  });
});
