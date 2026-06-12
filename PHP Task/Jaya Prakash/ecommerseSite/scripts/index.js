const userToken = localStorage.getItem("userToken");
const emailRegex = /^[a-zA-Z0-9.$#]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
const firstNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const lastNameRegex = /^[a-zA-Z]{3,}/;
const numberRegex = /^[6-9]\d{9}$/;

function validateToken() {
  const token = localStorage.getItem("userToken");
  $.ajax({
    type: "POST",
    url: "../api/validateToken.php",
    data: { userToken: token },
    dataType: "json",
    success: function (response) {
      console.log(response);
      if (!response.status) {
        return;
      }
      if (response.data.role === "ADMIN") {
        window.location.replace("./adminpanal.html");
        return;
      }

      $("#navbarUsername, #offcanvasUsername")
        .text(response.data.full_name)
        .addClass("text-truncate");
    },

    error: function (err) {
      console.error(err);
    },
  });
}

function checkToken() {
  const token = localStorage.getItem("userToken");
  if (!token) {
    $("#userDtlsDropDown,#offcanvasDropdown").addClass("d-none");
    $("#loginAndRegisterLinks,#offcanvasloginAndRegisterLinks").removeClass(
      "d-none",
    );
    return;
  }
  $("#userDtlsDropDown,#offcanvasDropdown").removeClass("d-none");
  $("#loginAndRegisterLinks,#offcanvasloginAndRegisterLinks").addClass(
    "d-none",
  );
  validateToken();
}

checkToken();

function loginFormValidations(email, password) {
  const emailErrorEle = $("#emailInputError");
  const passwordErrorEle = $("#passwordInputError");
  let errorFlag = false;

  if (!emailRegex.test(email)) {
    emailErrorEle.removeClass("d-none");
    errorFlag = true;
  }

  if (password.length < 6 || password.length > 20) {
    passwordErrorEle.removeClass("d-none");
    errorFlag = true;
  }

  if (errorFlag) {
    return false;
  }
  return true;
}

function registerFormValidations(
  firstName,
  lastName,
  email,
  phone,
  password,
  confirmPassword,
) {
  const firstNameInputErrorEle = $("#firstNameInputError");
  const lastNameInputErrorEle = $("#lastNameInputError");
  const registerEmailErrorEle = $("#registerEmailError");
  const phoneInputErrorEle = $("#phoneInputError");
  const registerPasswordErrorEle = $("#registerPasswordError");
  const confirmPasswordErrorEle = $("#confirmPasswordError");

  let errorFlag = false;

  if (!firstNameRegex.test(firstName)) {
    firstNameInputErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (!lastNameRegex.test(lastName)) {
    lastNameInputErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (!emailRegex.test(email)) {
    registerEmailErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (!numberRegex.test(phone)) {
    phoneInputErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (password.length < 6 || password.length > 20) {
    registerPasswordErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (password != confirmPassword) {
    confirmPasswordErrorEle.removeClass("d-none");
    errorFlag = true;
  }
  if (errorFlag) {
    return false;
  }
  return true;
}

function showValidationErrors(errors) {
  $(".text-danger").addClass("d-none").text("");
  for (let id in errors) {
    $("#" + id)
      .removeClass("d-none")
      .text(errors[id]);
  }
}

function getProducts() {
  $.ajax({
    type: "GET",
    url: "../api/getProducts.php",
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", "Error while fetching data!!", "error");
        return;
      }
      const products = response.data;
      let html = "";
      products.forEach((product) => {
        html += `
        <div class="card rounded-4 card-hover" style="width: 20rem" onclick=getProductDetails('${product.id}')>
          <img src="./uploads/${product.product_image}" class="card-img-top" alt="" />
          <div class="card-body">
            <div class="card-title fs-5 fw-bold mb-0">${product.product_name}</div>
            <span class="text-muted">${product.category_name}</span>
            <div class="card-text mt-2">
              <p class="text-truncate fs-6">
                ${product.product_description}
              </p>
              <div class="d-flex justify-content-between">
                <div class="text-dark fs-5 fw-semibold">₹.${product.price}</div>
                <div class="text-black fs-6 fw-medium">Instock: ${product.stock}</div>
              </div>
            </div>
          </div>
        </div>
        `;
      });
      $("#productsContainer").html(html);
    },
  });
}

function getProductDetails(id) {
  $.ajax({
    type: "GET",
    url: "./api/getOneProduct.php",
    data: { id },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", "Error while fetching the data!!", "error").then(
          () => {
            $("#mainContainer").load("./templates/home.html", function () {
              getProducts();
            });
            return;
          },
        );
      }
      $("#mainContainer").load("./templates/productDetails.html", function () {
        $("#productImage").attr(
          "src",
          "./uploads/" + response.data.product_image,
        );
        $("#productName").text(response.data.product_name);
        $("#productCategory").text(response.data.category_name);
        $("#productPrice").text(response.data.price);
        $("#productDescription").text(response.data.product_description);
        $("#productStock").text(response.data.stock);
        $("#quantityInput").attr("max", `${response.data.stock}`);
        $("#addToCartBtn").attr(
          "onclick",
          `addToCart('${response.data.product_id}')`,
        );
        $("#buyNowBtn").attr(
          "onclick",
          `getToCheckoutPage('${response.data.product_id}')`,
        );
      });
    },
  });
}

function loadCategories() {
  $.ajax({
    type: "GET",
    url: "../api/getCategories.php",
    dataType: "json",
    success: function (res) {
      if (!res.status) return;
      let html = `<option value="all">All</option>`;
      res.data.forEach((cat) => {
        html += `<option value="${cat.id}">${cat.category_name}</option>`;
      });
      $("#categoryFilter").html(html);
    },
  });
}

function getProductsByCategory() {
  const category = $("#categoryFilter").val();

  $.ajax({
    type: "GET",
    url: "../api/getProducts.php",
    data: { category },
    dataType: "json",

    success: function (response) {
      if (!response.status) {
        $("#productsContainer").html("<h3>No products found</h3>");
        return;
      }

      let html = "";

      response.data.forEach((product) => {
        html += `
          <div class="card rounded-4 card-hover" style="width: 20rem"
               onclick="getProductDetails('${product.id}')">

            <img src="./uploads/${product.product_image}" class="card-img-top">

            <div class="card-body">
              <div class="fw-bold">${product.product_name}</div>
              <span class="text-muted">${product.category_name}</span>

              <p class="text-truncate">${product.product_description}</p>

              <div class="fw-semibold">₹${product.price}</div>
            </div>

          </div>
        `;
      });

      $("#productsContainer").html(html);
    },
  });
}

function addToCart(id) {
  const quantity = parseInt($("#quantityInput").val());
  if (!id || !userToken) {
    Swal.fire("Error", "Login required", "error");
    return;
  }
  $.ajax({
    type: "POST",
    url: "./api/addToCart.php",
    data: {
      id,
      quantity,
      userToken,
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "error");
        return;
      }
      Swal.fire("Success", "Added to cart!", "success");
    },
    error: function () {
      Swal.fire("Error", "Something went wrong", "error");
    },
  });
}

function getToCheckoutPage(id) {
  if (!id || !userToken) {
    Swal.fire("Error", "Login required", "error");
    return;
  }

  const cartContainer = $("#mainContainer");
  cartContainer.load("./templates/buyPage.html", function () {
    $.ajax({
      type: "GET",
      url: "../api/getOneProduct.php",
      data: { id },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire(
            "Error",
            "Error While Fetching data.try again later...",
            "error",
          );
          return;
        }
        const cartItemsContainer = $("#cartItems");
        cartItemsContainer.text("");
        let html = "";
        const item = response.data;
        const total = item.price;
        html += `
          <div class="row align-items-center border-bottom py-3">
            <div class="col-4 fw-semibold">${item.product_name}</div>
            <div class="col-2 text-center">₹${item.price}</div>
            <div class="col-2 text-center">Qty: 1</div>
            <div class="col-4 text-end fw-semibold">₹${total}</div>
          </div>
        `;
        cartItemsContainer.html(html);
        $("#productId").val(item.product_id);
        $("#totalPrice").text(total);
      },
    });
    loadUserAddress();
  });
}

function updateCartQty(productId, change) {
  const qtyEl = $(`#quantityContainer-${productId}`);
  const priceEl = $(`#priceContainer-${productId}`);

  let currentQty = parseInt(qtyEl.text());
  let newQty = currentQty + change;
  console.log(newQty);
  if (newQty < 1) return;

  $.ajax({
    type: "POST",
    url: "./api/updateCartItem.php",
    data: {
      product_id: productId,
      quantity: newQty,
      userToken: localStorage.getItem("userToken"),
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message || "Failed", "error");
        return;
      }
      qtyEl.text(newQty);
      const unitPrice = Number(response.data.price);
      priceEl.text(unitPrice * newQty);
    },
  });
}

function getUserOrders() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return;
  }
  $.ajax({
    type: "POST",
    url: "../api/getUserOrders.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire(
          "Warning",
          "Something went wrong. try again later...",
          "warning",
        );
        return;
      }
      let html = "";
      let total;
      let status;
      let status_class;
      const ordersContainer = $("#ordersContainer");
      for (let i = 0; i < response.data.length; i++) {
        total =
          parseInt(response.data[i].unit_price) *
          parseInt(response.data[i].quantity);
        status = response.data[i].order_status;
        if (status == "Pending") {
          status_class = "bg-warning";
        } else if (status == "Delivered") {
          status_class = "bg-success";
        } else if (status == "Shipped") {
          status_class = "bg-info";
        } else {
          status_class = "bg-danger";
        }
        html += `<div class="col-12 mb-3">
                  <div class="card shadow-sm">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-4 col-md-2 text-center mb-2 mb-md-0">
                          <img 
                            src="./uploads/${response.data[i].product_image}" 
                            class="img-fluid rounded"
                            style="max-height: 80px; object-fit: cover;"
                          >
                        </div>

                      <div class="col-8 col-md-7">
                        <h6 class="mb-1 fs-6 fs-md-5">${response.data[i].product_name}</h6>
                        <small class="text-muted d-block">Qty: ${response.data[i].quantity}</small>
                        <small class="text-muted d-block">₹ ${response.data[i].unit_price}</small>
                      </div>

                      <!-- Status + Price -->
                      <div class="col-12 col-md-3 text-md-end mt-2 mt-md-0">
                        <span class="badge ${status_class} mb-1 d-inline-block">${status}</span>
                        <div class="fw-bold fs-5">₹ ${total}</div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>`;
      }
      ordersContainer.html(html);
    },
  });
}

function getCartItems() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return;
  }
  $.ajax({
    type: "POST",
    url: "../api/getCartItems.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        $("#cartContainer").html(
          "<h3 class='w-100 text-center'>Cart is empty!!</h3>",
        );
      }
      if (response.data.length != 0) {
        const buyBtnContainer = $("#buyBtnContainer");
        buyBtnContainer.html(`<button class="btn btn-success fs-5 py-2 px-5" onclick="getCartItemsIntoBuyPage()">
                                  Buy
                              </button>`);
        const cartContainer = $("#cartContainer");
        cartContainer.text("");

        let html = "";
        const carts = response.data;
        carts.forEach((cart) => {
          html += `
          <div class="card rounded-4 card-hover" style="width: 20rem">
            <img src="./uploads/${cart.product_image}" class="card-img-top" alt="" />
            <div class="card-body">
              <div class="card-title fs-5 fw-bold mb-0">${cart.product_name}</div>
              <div class="card-text mt-2">
                <div class="d-flex justify-content-between">
                  <div class="text-dark fs-5 fw-semibold">₹. <span id='priceContainer-${cart.product_id}'>${Number(cart.price) * Number(cart.quantity)}</span></div>
                      <div class="d-flex align-items-center gap-2 mt-2">
                        <button class="btn btn-sm btn-outline-dark" onclick="updateCartQty('${cart.product_id}', -1)">
                          -
                        </button>
                        <span id="quantityContainer-${cart.product_id}">
                            ${cart.quantity}
                        </span>
                        <button class="btn btn-sm btn-outline-dark" onclick="updateCartQty('${cart.product_id}', 1)">
                          +
                        </button>
                      </div>
                    </div>
                    <div class="d-flex justify-content-center mt-3">
                        <button class="btn btn-danger btn-sm w-50" onclick="removeCartItem('${cart.product_id}')">
                            Delete
                        </button>
                    </div>
                  </div>
                </div>
                </div>
                </div></div>
          `;
        });
        cartContainer.html(html);
      }
    },
  });
}

function removeCartItem(productId) {
  $.ajax({
    type: "POST",
    url: "./api/removeCartItem.php",
    data: {
      productId,
      userToken,
    },
    dataType: "json",
    success: function (res) {
      if (!res.status) {
        Swal.fire("Error", res.message || "Failed", "error");
        return;
      }
      Swal.fire("Deleted!", "Item removed", "success").then(() => {
        getCartItems();
      });
    },
  });
}

function getCartItemsIntoBuyPage() {
  const cartContainer = $("#mainContainer");
  cartContainer.load("./templates/buyPage.html", function () {
    $.ajax({
      type: "POST",
      url: "../api/getCartDetails.php",
      data: { userToken },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire(
            "Error",
            "Error While Fetching data.try again later...",
            "error",
          );
          return;
        }
        const cartItemsContainer = $("#cartItems");
        cartItemsContainer.text("");
        let total = 0;
        let html = "";
        cartItems = response.data;
        cartItems.forEach((item) => {
          total = total + parseInt(item.price * item.quantity);
          html += `
          <div class="row align-items-center border-bottom py-3">
            <div class="col-4 fw-semibold">${item.product_name}</div>
            <div class="col-2 text-center">₹${item.price}</div>
            <div class="col-2 text-center">Qty: ${item.quantity}</div>
            <div class="col-4 text-end fw-semibold">₹${item.price * item.quantity}</div>
          </div>
        `;
        });
        cartItemsContainer.html(html);
        $("#totalPrice").text(total);
      },
    });
    loadUserAddress();
  });
}

function loadUserAddress() {
  const addressList = $("#addressList");
  $.ajax({
    type: "POST",
    url: "../api/getUserAddress.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Warning", "Invalid Token", "warning");
        return;
      }
      let html = "";
      for (let i = 0; i < response.data.length; i++) {
        if (i === 0) {
          html += `
            <label class="card p-3 shadow-sm">
              <div class="form-check">
                <input
                  class="form-check-input me-2"
                  type="radio"
                  name="address"
                  value='${response.data[i].address_id}'
                  required
                  checked
                  />
              <div>
              <strong>${response.data[i].customer_name}</strong><br>
              <small class="text-muted">
                ${response.data[i].full_address}
              </small>
            </div>
            </div>
          </label>
        `;
          continue;
        }
        html += `
        <label class="card p-3 shadow-sm">
        <div class="form-check">
          <input
            class="form-check-input me-2"
            type="radio"
            name="address"
            value='${response.data[i].address_id}'
            required
          />
          <div>
            <strong>${response.data[i].customer_name}</strong><br>
            <small class="text-muted">
              ${response.data[i].full_address}
            </small>
          </div>
        </div>
      </label>
        `;
      }
      addressList.html(html);
    },
  });
}

$(document).ready(function () {
  $("#mainContainer").load("./templates/home.html", function () {
    getProducts();
  });

  $(document).on("click", "#homeLink,#offcanvasHomeLink", function () {
    $("#mainContainer").load("./templates/home.html", function () {
      getProducts();
    });
  });

  $(document).on(
    "click",
    "#categoriesLink,#offcanvasCategoriesLink",
    function () {
      $("#mainContainer").load("./templates/categories.html", function () {
        loadCategories();
        getProductsByCategory();
      });
    },
  );

  $(document).on("click", "#cartLink,#offcanvasCartLink", function () {
    $("#mainContainer").load("./templates/cart.html", function () {
      getCartItems();
    });
  });

  $(document).on("click", "#ordersLink,#offcanvasOrdersLink", function () {
    $("#mainContainer").load("./templates/orders.html", function () {
      getUserOrders();
    });
  });

  $(document).on("click", "#loginBtn", function (e) {
    e.preventDefault();
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    if (loginFormValidations(email, password)) {
      $.ajax({
        type: "POST",
        url: "../api/login.php",
        data: { email, password },
        dataType: "json",
        success: function (response) {
          if (!response.status) {
            if (response.errors.length !== 0) {
              console.log("errors");
              showValidationErrors(response.errors);
            } else {
              Swal.fire(
                "Waring",
                "Please Check your credientials and try again",
                "warning",
              );
            }
          } else {
            localStorage.setItem("userToken", response.data.token);
            console.log(response.data.role);
            if (response.data.role == "ADMIN") {
              console.log("admin");
              window.location.replace("./admin.php");
            }
            checkToken();
            const loginEle = document.getElementById("loginModal");
            const loginModal = bootstrap.Modal.getInstance(loginEle);
            loginModal.hide();
            window.location.reload();
          }
        },
      });
    }
  });

  $(document).on("click", "#registerBtn", function () {
    const firstName = $("#firstNameInput").val();
    const lastName = $("#lastNameInput").val();
    const email = $("#registerEmailInput").val();
    const phone = $("#phoneInput").val();
    const password = $("#registerPasswordInput").val();
    const confirmPassword = $("#confirmPasswordInput").val();

    if (
      registerFormValidations(
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
      )
    ) {
      $.ajax({
        type: "POST",
        url: "../api/userRegister.php",
        data: {
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
        },
        dataType: "json",
        success: function (response) {
          if (!response.status) {
            showValidationErrors(response.errors);
          } else {
            Swal.fire("Success", "Successfully Registered!!", "success").then(
              () => {
                const registerModal = bootstrap.Modal.getInstance(
                  document.getElementById("registerModal"),
                );
                registerModal.hide();
                const loginModal = new bootstrap.Modal(
                  document.getElementById("loginModal"),
                );
                loginModal.show();
              },
            );
          }
        },
        error: function (err) {
          console.error(err);
        },
      });
    }
  });

  $(document).on("click", "#logoutBtn , #offcanvasLogoutBtn", function () {
    $.ajax({
      type: "POST",
      url: "../api/logout.php",
      data: { userToken },
      dataType: "json",
      success: function (response) {
        localStorage.removeItem("userToken");
        $("#userDtlsDropDown,#offcanvasDropdown").addClass("d-none");
        $("#loginAndRegisterLinks,#offcanvasloginAndRegisterLinks").removeClass(
          "d-none",
        );
        $("#homeLink").click();
      },
    });
    return;
  });

  let emailValidationTimer;
  $(document).on("input", "#registerEmailInput", function () {
    clearTimeout(emailValidationTimer);
    emailValidationTimer = setTimeout(function () {
      const email = $("#registerEmailInput").val().trim();
      $("#registerEmailError").addClass("d-none").text("");
      console.log(email);
      if (!emailRegex.test(email)) {
        console.log("failed");
        return;
      }
      $.ajax({
        type: "POST",
        url: "../api/isEmailExists.php",
        data: { email },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#registerEmailError")
              .text("An account with this email already exists")
              .removeClass("d-none");
          }
        },
        error: function (err) {
          console.error(err);
        },
      });
    }, 600);
  });

  let phoneTimer;
  $(document).on("input", "#phoneInput", function () {
    clearTimeout(phoneTimer);

    phoneTimer = setTimeout(function () {
      const phone = $("#phoneInput").val().trim();

      $("#phoneError").addClass("d-none").text("");

      if (!numberRegex.test(phone)) {
        return;
      }

      $.ajax({
        type: "POST",
        url: "../api/isPhoneExists.php",
        data: { phone },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#phoneInputError")
              .text("An account with this phone number already exists")
              .removeClass("d-none");
          }
        },
      });
    }, 600);
  });

  $(document).on("input", "#registerModal", function () {
    const firstNameInputErrorEle = $("#firstNameInputError");
    const lastNameInputErrorEle = $("#lastNameInputError");
    const registerEmailErrorEle = $("#registerEmailError");
    const registerPasswordErrorEle = $("#registerPasswordError");
    const confirmPasswordErrorEle = $("#confirmPasswordError");
    const phoneInputErrorEle = $("#phoneInputError");
    firstNameInputErrorEle.addClass("d-none");
    lastNameInputErrorEle.addClass("d-none");
    registerEmailErrorEle.addClass("d-none");
    registerPasswordErrorEle.addClass("d-none");
    confirmPasswordErrorEle.addClass("d-none");
    phoneInputErrorEle.addClass("d-none");
  });

  $(document).on("change", "#categoryFilter", function () {
    getProductsByCategory();
  });

  $(document).on("click", "#increaseQty", function () {
    let qty = parseInt($("#quantityInput").val()) || 1;
    let max = parseInt($("#quantityInput").attr("max"));
    if (qty < max) {
      $("#quantityInput").val(qty + 1);
    }
  });

  $(document).on("click", "#decreaseQty", function () {
    let qty = parseInt($("#quantityInput").val()) || 1;

    if (qty > 1) {
      $("#quantityInput").val(qty - 1);
    }
  });

  $(document).on("submit", "#addressForm", function (e) {
    e.preventDefault();
    let form = document.getElementById("addressForm");
    let formData = new FormData(form);
    formData.append("userToken", userToken);
    $.ajax({
      type: "POST",
      url: "../api/addUserAddress.php",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (response) {
        if (response.status) {
          Swal.fire("success", response.message, "success").then(() => {
            form.reset();
            let addressModal = bootstrap.Modal.getInstance(
              document.getElementById("addressModal"),
            );
            addressModal.hide();
            loadUserAddress();
          });
        }
      },
    });
  });

  $(document).on("click", "#payment-type-cod", function () {
    $("#upiSection, #cardSection").addClass("d-none");
  });

  $(document).on("click", "#payment-type-upi", function () {
    $("#cardSection").addClass("d-none");
    $("#upiSection").removeClass("d-none");
  });

  $(document).on("click", "#payment-type-card", function () {
    $("#upiSection").addClass("d-none");
    $("#cardSection").removeClass("d-none");
  });

  $(document).on("submit", "#paymentForm", function (e) {
    e.preventDefault();
    let addressId = $("input[name='address']:checked").val();
    let formData = new FormData(document.getElementById("paymentForm"));
    let mode = formData.get("payment_method");
    if (!mode) {
      Swal.fire("Error", "Select a payment mode", "error");
      return false;
    }

    if (mode === "upi") {
      let upi = formData.get("upi_id").trim();
      if (!upi) {
        Swal.fire("Error", "Invalid upi Id", "error");
        return;
      }
    }

    if (mode === "card") {
      let card_number = formData.get("card_number").trim();
      let expiry = formData.get("expiry").trim();
      let cvv = formData.get("cvv").trim();
      if (!card_number || !expiry || !cvv) {
        Swal.fire("Error", "Invalid card details", "error");
        return;
      }
    }
    let productId = $("#productId").val();

    formData.append("token", userToken);
    formData.append("address_id", addressId);
    formData.append("productId", productId);

    $.ajax({
      type: "POST",
      url: "../api/orderProducts.php",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire(
            "Error",
            "Error While fetching the data. please try again later...",
          );
        }
        const paymentModal = bootstrap.Modal.getInstance(
          document.getElementById("paymentsModal"),
        );
        paymentModal.hide();
        Swal.fire("Order Placed!!", "Ordered successfully!!", "success").then(
          () => {
            $("#ordersLink").click();
          },
        );
      },
      error: function (err) {
        Swal.fire("Error", "Error occures. please try again later...");
      },
    });
  });

  $(document).on("change", "#statusList", function () {
    let status = $("#statusList").val();
    if (status == 0) {
      getUserOrders();
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/getUserOrders.php",
      data: { userToken, status },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire(
            "Warning",
            "Something went wrong. try again later...",
            "warning",
          );
          return;
        }
        let html = "";
        let total;
        let status;
        let status_class;
        const ordersContainer = $("#ordersContainer");

        if (response.data.length == 0) {
          ordersContainer.html(
            "<h3 class='w-100 text-center'>No orders...</h3>",
          );
          return;
        }

        for (let i = 0; i < response.data.length; i++) {
          total =
            parseInt(response.data[i].unit_price) *
            parseInt(response.data[i].quantity);
          status = response.data[i].order_status;
          if (status == "Pending") {
            status_class = "bg-warning";
          } else if (status == "Delivered") {
            status_class = "bg-success";
          } else if (status == "Shipped") {
            status_class = "bg-info";
          } else {
            status_class = "bg-danger";
          }
          html += `<div class="col-12 mb-3">
                  <div class="card shadow-sm">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-4 col-md-2 text-center mb-2 mb-md-0">
                          <img 
                            src="./uploads/${response.data[i].product_image}" 
                            class="img-fluid rounded"
                            style="max-height: 80px; object-fit: cover;"
                          >
                        </div>

                      <div class="col-8 col-md-7">
                        <h6 class="mb-1 fs-6 fs-md-5">${response.data[i].product_name}</h6>
                        <small class="text-muted d-block">Qty: ${response.data[i].quantity}</small>
                        <small class="text-muted d-block">₹ ${response.data[i].unit_price}</small>
                      </div>

                      <!-- Status + Price -->
                      <div class="col-12 col-md-3 text-md-end mt-2 mt-md-0">
                        <span class="badge ${status_class} mb-1 d-inline-block">${status}</span>
                        <div class="fw-bold fs-5">₹ ${total}</div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>`;
        }
        ordersContainer.html(html);
      },
    });
  });

  let searchTimer;
  $(document).on("input","#searchInput", function () {
    clearTimeout(searchTimer);
    let html = "";
    const searchResult = $("#searchResult");
    searchTimer = setTimeout(()=>{
      const searchInput = $("#searchInput").val().trim();
      if(searchInput.length<3){
        searchResult.text("");
        return;
      }
      $.ajax({
        type: "GET",
        url: "../api/getSearchItem.php",
        data: { searchInput },
        dataType: "json",
        success: function (response) {
          if(response.status){
            const items = response.data;
            items.forEach((item)=>{
              html += `<div class="bg-light w-50 px-5 rounded-pill d-flex align-items-center gap-3" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSearch" onclick='getProductDetails(${item.id})'>
                          <img
                            src="./uploads/${item.product_image}"
                            height="50"
                            width="50"
                            class="rounded-circle"
                            alt="image"
                          />
                          <span class="fs-5">${item.product_name}</span>
                        </div>`
            })
            searchResult.html(html);
          }
        }
      });
    },500)
  });
});
