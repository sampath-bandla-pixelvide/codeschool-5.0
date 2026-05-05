const userToken = localStorage.getItem("userToken");

function validateAdmin() {
  const token = localStorage.getItem("userToken");
  if (!token) {
    window.location.replace("./index.html");
    return;
  }
  $.ajax({
    type: "POST",
    url: "../api/validateAdmin.php",
    data: { token },
    dataType: "dataType",
    success: function (response) {
      if (!response.status) {
        $("#logoutBtn").click();
        return;
      }
    },
  });
}

function loadAdminDashboard() {
  validateAdmin();
  $.ajax({
    type: "POST",
    url: "../api/getAdminDashboardStats.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      console.log(response);
      if (!response.status) {
        window.location.replace("./index.html");
        return;
      }
      $("#totalUsers").text(response.data.usersCount);
      $("#totalOrders").text(response.data.ordersCount);
      $("#totalProducts").text(response.data.productsCount);
      if (response.data.total_revenue == null) {
        $("#totalRevenue").text(`₹.0`);
      } else {
        $("#totalRevenue").text(`₹.${response.data.total_revenue}`);
      }
    },
    error: function () {
      window.location.replace("./index.html");
    },
  });
}

function validateProductForm(
  name,
  category,
  stock,
  price,
  description,
  image,
  isUpdating = false,
) {
  let isValid = true;
  $(".text-danger").addClass("d-none");
  if (!name || name.length < 3) {
    $("#productNameError").removeClass("d-none");
    isValid = false;
  }
  if (!category) {
    $("#categoryError").removeClass("d-none");
    isValid = false;
  }
  if (stock < 0 || stock === "") {
    $("#stockError").removeClass("d-none");
    isValid = false;
  }
  if (price <= 0 || price === "") {
    $("#priceError").removeClass("d-none");
    isValid = false;
  }
  if (!description || description.length < 5) {
    $("#descriptionError").removeClass("d-none");
    isValid = false;
  }
  if (!isUpdating && !image) {
    $("#imageError").removeClass("d-none");
    isValid = false;
  }
  return isValid;
}

function getCategories() {
  validateAdmin();
  $.ajax({
    type: "GET",
    url: "../api/getCategories.php",
    dataType: "json",
    success: function (response) {
      if (response.status) {
        let html = "";
        for (let i = 0; i < response.data.length; i++) {
          html += `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${response.data[i].category_name}</td>
                        <td>
                          <button class="btn btn-sm btn-danger deleteCategoryBtn" onclick="deleteCategory('${response.data[i].id}')">
                            Delete
                          </button>
                        </td>
                      </tr>
                    `;
        }
        $("#categoryTable").html(html);
      }
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function getProducts() {
  validateAdmin();
  $.ajax({
    type: "GET",
    url: "../api/getProducts.php",
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        $("#productTable").html(
          "<tr><td colspan='8'>No products found</td></tr>",
        );
        return;
      }
      let html = "";
      response.data.forEach((product, i) => {
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${product.product_name}</td>
            <td>${product.category_name}</td>
            <td>${product.stock}</td>
            <td>₹${product.price}</td>
            <td>${product.product_description}</td>
            <td>
              <img src="../uploads/${product.product_image}" width="50" height="50" />
            </td>
            <td class="d-flex gap-1">
              <button class="btn btn-sm btn-danger" onclick='deleteProduct(${product.id})'><i class="bi bi-trash"></i></button>
              <button class="btn btn-sm btn-info" onclick="editProduct('${product.id}')"><i class="bi bi-pen"></i></button>
            </td>
          </tr>
        `;
      });

      $("#productTable").html(html);
    },

    error: function (err) {
      console.error(err);
    },
  });
}

function deleteCategory(id) {
  validateAdmin();
  Swal.fire({
    title: "Are you sure?",
    text: "This category will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    $.ajax({
      type: "POST",
      url: "../api/deleteCategory.php",
      data: {
        id,
        userToken,
      },
      dataType: "json",
      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", "Failed to delete category", "error");
          return;
        }
        Swal.fire("Deleted!", "Category removed successfully.", "success").then(
          () => {
            getCategories();
          },
        );
      },

      error: function () {
        Swal.fire("Error", "Something went wrong", "error");
      },
    });
  });
}

function deleteProduct(id, btn) {
  validateAdmin();
  Swal.fire({
    title: "Are you sure?",
    text: "This product will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/deleteProduct.php",
      data: {
        id,
        userToken,
      },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire("Error", "Failed to delete product", "error");
          return;
        }
        Swal.fire("Deleted!", "Product removed successfully.", "success").then(
          () => {
            getProducts();
          },
        );
      },

      error: function (err) {
        console.error(err);
      },
    });
  });
}

let editProductId = null;
function editProduct(id) {
  validateAdmin();
  $.ajax({
    type: "GET",
    url: "../api/getOneProduct.php",
    data: { id },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", "Failed to fetch product", "error");
        return;
      }
      const p = response.data;
      $("#productNameInput").val(p.product_name);
      $("#categoryInput").val(p.category_id);
      $("#stockInput").val(p.stock);
      $("#priceInput").val(p.price);
      $("#descriptionInput").val(p.product_description);
      $("#productModalTitle").text("Edit Product");
      editProductId = id;
      const modal = new bootstrap.Modal(
        document.getElementById("addProductModal"),
      );
      modal.show();
    },
  });
}

function getUsers() {
  validateAdmin();
  $.ajax({
    type: "POST",
    url: "../api/getUsers.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        $("#userTable").html("<tr><td colspan='6'>No users found</td></tr>");
        return;
      }
      let html = "";
      response.data.forEach((user, i) => {
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.phone_number}</td>
            <td>${user.role}</td>
            <td>
              <button class="btn btn-sm btn-danger"
                onclick="deleteUser('${user.id}')">
                Delete
              </button>
            </td>
          </tr>
        `;
      });

      $("#userTable").html(html);
    },
  });
}

function deleteUser(id) {
  validateAdmin();
  Swal.fire({
    title: "Are you sure?",
    text: "User will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (!result.isConfirmed) return;

    $.ajax({
      type: "POST",
      url: "../api/deleteUser.php",
      data: { id, userToken },
      dataType: "json",

      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", "Failed", "error");
          return;
        }

        Swal.fire("Deleted!", "User removed", "success").then(() => {
          getUsers();
        });
      },
    });
  });
}

function getOrders() {
  validateAdmin();
  $.ajax({
    type: "POST",
    url: "../api/getOrders.php",
    data: { userToken },
    dataType: "json",

    success: function (response) {
      if (!response.status) {
        $("#orderTable").html(
          "<tr><td colspan='9' class='text-center'>No orders found</td></tr>",
        );
        return;
      }

      let html = "";

      response.data.forEach((order, i) => {
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${order.customer_name}</td>
            <td>${order.city}</td>
            <td>${order.state}</td>
            <td>${order.pin_code}</td>
            <td>₹.${order.total_amount}</td>
            <td>${order.order_status}</td>
            <td>${order.ordered_date}</td>
            <td>
              <button class="btn btn-sm btn-primary"
                onclick="updateOrderStatus('${order.id}')">
                Update Status
              </button>
            </td>
          </tr>
        `;
      });

      $("#orderTable").html(html);
    },
  });
}

function updateOrderStatus(id) {
  validateAdmin();
  Swal.fire({
    title: "Update Status",
    input: "select",
    inputOptions: {
      Pending: "Pending",
      Shipped: "Shipped",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
    },
    inputPlaceholder: "Select status",
    showCancelButton: true,
  }).then((result) => {
    if (!result.value) {
      return;
    }

    $.ajax({
      type: "POST",
      url: "../api/updateOrderStatus.php",
      data: {
        id,
        status: result.value,
        userToken,
      },
      dataType: "json",

      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", "Failed To Update", "error");
          return;
        }
        Swal.fire("Success", "Status updated", "success").then(() => {
          getOrders();
        });
      },
    });
  });
}

function loadCategoryOptions() {
  validateAdmin();
  $.ajax({
    type: "GET",
    url: "../api/getCategories.php",
    dataType: "json",

    success: function (response) {
      if (!response.status) return;

      const selectDiv = $("#categoryInput");

      selectDiv.html(
        '<option value="" selected hidden>Select Category</option>',
      );

      response.data.forEach((cat) => {
        selectDiv.append(
          `<option value="${cat.id}">${cat.category_name}</option>`,
        );
      });
    },
  });
}

$(document).ready(function () {
  validateAdmin();
  loadAdminDashboard();

  $(document).on("click", "#productsLink", function () {
    $("#pageTitle").text("Products");
    $("#contentArea").load("./templates/manageProducts.html", function () {
      getProducts();
      loadCategoryOptions();
    });
  });

  $(document).on("click", "#dashboardLink", function () {
    $("#pageTitle").text("Dashboard");
    $("#contentArea").html("");
  });

  $(document).on("click", "#categoriesLink", function () {
    $("#pageTitle").text("Categories");
    $("#contentArea").load("./templates/manageCategories.html", function () {
      getCategories();
    });
  });

  $(document).on("click", "#usersLink", function () {
    $("#pageTitle").text("Users");
    $("#contentArea").load("./templates/manageUsers.html", function () {
      getUsers();
    });
  });

  $(document).on("click", "#ordersLink", function () {
    $("#pageTitle").text("Orders");
    $("#contentArea").load("./templates/manageOrders.html", function () {
      getOrders();
    });
  });

  $(document).on("click", "#logoutBtn", function () {
    $.ajax({
      type: "POST",
      url: "../api/logout.php",
      data: { userToken },
      dataType: "json",
      success: function (response) {
        localStorage.removeItem("userToken");
        window.location.replace("./index.html");
      },
    });
    return;
  });

  $(document).on("click", "#saveCategoryBtn", function () {
    validateAdmin();
    const name = $("#CategoryNameInput").val().trim();
    if (name.length === 0) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/addCategory.php",
      data: {
        userToken,
        name,
      },
      dataType: "json",

      success: function (response) {
        if (!response.status) {
          Swal.fire("Failed", "Failed to  add Category!", "warning");
          return;
        }

        Swal.fire("Success", "Category added successfully!", "success").then(
          () => {
            getCategories();
            loadCategoryOptions();
          },
        );
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addCategoryModal"),
        );
        modal.hide();
      },
    });
  });

  $(document).on("click", "#saveProductBtn", function () {
    validateAdmin();
    const name = $("#productNameInput").val().trim();
    const category = $("#categoryInput").val();
    const stock = $("#stockInput").val();
    const price = $("#priceInput").val();
    const description = $("#descriptionInput").val().trim();
    const image = $("#imageInput")[0].files[0];

    let isUpdateing = false;
    if (editProductId) {
      isUpdateing = true;
    }

    if (
      !validateProductForm(
        name,
        category,
        stock,
        price,
        description,
        image,
        isUpdateing,
      )
    ) {
      return;
    }

    let formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("stock", stock);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("userToken", localStorage.getItem("userToken"));

    let url = "../api/addProduct.php";

    if (editProductId) {
      url = "../api/updateProduct.php";
      formData.append("id", editProductId);
    }

    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (res) {
        if (!res.status) {
          Swal.fire("Failed", "Failed to added product!", "warning");

          return;
        }
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addProductModal"),
        );
        modal.hide();
        Swal.fire("Success", "Product added successfully!", "success").then(
          () => {
            loadAdminDashboard();
            getProducts();
          },
        );
      },
    });
  });

  $(document).on("click", "#addProductBtn", function () {
    editProductId = null;
    $("#productNameInput").val("");
    $("#categoryInput").val("");
    $("#stockInput").val("");
    $("#priceInput").val("");
    $("#descriptionInput").val("");
    $("#imageInput").val("");
  });
});
