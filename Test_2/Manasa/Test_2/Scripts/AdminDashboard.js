$(document).ready(function () {
  $("#addItemBtn").click(function () {
    window.location.href = "AddItem.html";
  });

  let user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    window.location.href = "Login.html";
    return;
  }

  $("#profileLetter").text(user.name.charAt(0).toUpperCase());
  $("#profileName").text(user.name);

  $("#logoutBtn").click(function () {
    localStorage.clear();
    window.location.href = "Login.html";
  });

  loadItems();
});

function loadItems() {
  let user = JSON.parse(localStorage.getItem("user"));

  $.ajax({
    url: "api/getItems.php",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ role: user.role }),

    success: function (res) {
      res = typeof res === "string" ? JSON.parse(res) : res;

      if (res.status === "success") {
        displayItems(res.items);
      }
    },
  });
}

function displayItems(items) {
  let user = JSON.parse(localStorage.getItem("user"));

  let html = "";

  items.forEach((item) => {
    let image =
      item.images && item.images.length > 0
        ? item.images[0].image_path
        : "https://via.placeholder.com/300";

    html += `
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">

          <img src="${image}" class="card-img-top"
            style="height:200px;object-fit:cover;">

          <div class="card-body">

            <h5>${item.title}</h5>

            <p class="text-muted">${item.category}</p>

            <p><i class="bi bi-geo-alt"></i> ${item.location}</p>

            <span class="badge bg-${
              item.status === "approved"
                ? "success"
                : item.status === "pending"
                  ? "warning"
                  : "danger"
            }">
              ${item.status}
            </span>

            
<div class="mt-3 d-flex gap-2">

  ${
    item.status === "pending" && item.user_id !== user.id
      ? `
    <button class="btn btn-success btn-sm"
      onclick="approveItem(${item.id})">Approve</button>

    <button class="btn btn-warning btn-sm"
      onclick="rejectItem(${item.id})">Reject</button>
  `
      : ""
  }

  <button class="btn btn-danger btn-sm"
    onclick="deleteItem(${item.id})">
    Delete
  </button>

</div>

          </div>
        </div>
      </div>
    `;
  });

  $("#itemsContainer").html(html);
}

function approveItem(id) {
  updateStatus(id, "approved");
}

function rejectItem(id) {
  updateStatus(id, "rejected");
}

function updateStatus(id, status) {
  $.ajax({
    url: "api/updateItemStatus.php",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ id, status }),

    success: function () {
      loadItems();
    },
  });
}

function deleteItem(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to recover this item!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "api/deleteItem.php",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ id: id }),

        success: function (res) {
          res = typeof res === "string" ? JSON.parse(res) : res;

          if (res.status === "success") {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: res.message,
              timer: 1500,
              showConfirmButton: false,
            });

            loadItems();
          }
        },
      });
    }
  });
}
