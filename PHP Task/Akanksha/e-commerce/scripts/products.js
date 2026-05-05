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
  const token = localStorage.getItem("token");
  if (role !== "admin") {
    window.location.href = "index.html";
  }
  if(!token) {
    window.location.href = "index.html";
  } 
});

function products() {
  const id = $("#product_id").val();

  const product_name = $("#product_name").val();
  const price = $("#price").val();
  const stock = $("#stock").val();
  const category_id = $("#category_id").val();
  const description = $("#description").val();

  const image = $("#img")[0].files[0];

  let formData = new FormData();

  formData.append("id", id);
  formData.append("product_name", product_name);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("category_id", category_id);
  formData.append("description", description);

  if (img) {
    formData.append("image", image);
  }

  $.ajax({
    url: "/api/products.php",
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    dataType: "json",
    success: (res) => {
      if (!res.status) {
        Swal.fire("Error", res.message, "warning");
        return;
      }
      console.log(res);
      Swal.fire("success", res.message, "success");

      $("#productForm")[0].reset();
      $("#product_id").val("");
      $("#submitBtn").text("Add Product");

      loadProducts();
    },
    error: (err) => {
      console.log(err);
    },
  });
}

loadProducts();

function loadProducts() {
  $.ajax({
    url: "/api/products.php",
    method: "GET",
    dataType: "json",
    success: function (res) {
      let rows = "";

      res.forEach((item, index) => {
        rows += `
            <tr>
              <td>${index + 1}</td>
              <td>${item.product_name}</td>
              <td>${item.price}</td>
              <td>${item.stock}</td>
              <td>${item.category}</td>
              <td>${item.description}</td>
              <td>
              <button class="btn btn-sm btn-warning mb-2"
                onclick='editProduct(${JSON.stringify(item)})'>
                Edit
              </button>

              <button class="btn btn-sm btn-danger"
                onclick="deleteProduct(${item.id})">
                Delete
              </button>
            </td>
            </tr>
          `;
      });

      $("#productTable").html(rows);
    },
  });
}

function editProduct(item) {
  $("#product_id").val(item.id);
  $("#product_name").val(item.product_name);
  $("#price").val(item.price);
  $("#stock").val(item.stock);
  $("#category_id").val(item.category);
  $("#description").val(item.description);

  $("#submitBtn").text("Update Product");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete the product!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/api/products.php",
        method: "POST",
        data: {
          delete_id: id,
        },
        dataType: "json",
        success: (res) => {
          if (!res.status) {
            Swal.fire("Error", res.message, "error");
            return;
          }

          Swal.fire("Deleted!", res.message, "success");
          loadProducts();
        },
      });
    }
  });
}
