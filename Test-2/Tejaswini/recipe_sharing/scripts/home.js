$(document).ready(function () {
  let token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("./index.html");
  }
  validateToken();
});
function validateToken() {
  $.ajax({
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    url: "./api/auth_apis/validateToken.php",
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "warning").then(() => {
          logout();
          return;
        });
      }

      loadComponents(response.data.user);
      loadView("public-home");

      // console.log("h");
      // $("#navbarUsername").text(response.data["first_name"]);
    },
    error: function (err) {
      console.error(err);
      logout();
    },
  });
}

function loadComponents(user) {
  $("#sidebarContainer").html(`
    <div id="mobileSidebar"></div>
    <div id="desktopSidebar"></div>
  `);

  $("#mobileSidebar").load("./components/sidebar.html", function () {
    renderSidebar(user);
  });

  $("#desktopSidebar").load("./components/sidebar2.html", function () {
    renderSidebar(user);
  });

  $("#navbarContainer").load("./components/navbar.html", function () {
    renderNavbar(user);
  });

  // const view = user.role === "admin" ? "admin-home" : "user-home";
  // loadView(view);
}
function loadView(view) {
  $("#mainContent").load(`./templates/${view}.html`, function () {
    if (view === "public-home") {
      getRecipes(); // call AFTER HTML is ready
    }
    if (view === "wishlist") {
      getWishlist();
    }
    if (view === "profile") {
      getProfile();
    }
  });
}
function renderSidebar(user) {
  const name = user.name;
  const role = user.role;
  const letter = name.charAt(0).toUpperCase();

  $(".sideUserName").text(name);
  $(".sideUserRole").text(role === "admin" ? "Administrator" : "User");
  // $(".sideAvatar").text(letter);
  $(".sideRoleLabel").text(role === "admin" ? "ADMIN PANEL" : "USER PANEL");
  
  // if (user.photo !== null && user.photo !== "") {
  //   $(".sideAvatar").attr("src", "./api/uploads/" + user.photo);
  // } else {
  //   $(".sideAvatar").text(letter);
  // }
  if (user.photo !== null && user.photo !== "") {

  $(".sideAvatar").replaceWith(`
    <img
      src="./api/uploads/${user.photo}"
      class="sideAvatar rounded-circle object-fit-cover"
      style="width:36px;height:36px;"
    >
  `);

} else {

  $(".sideAvatar").replaceWith(`
    <div
      class="sideAvatar rounded-circle bg-white d-flex align-items-center justify-content-center"
      style="width:36px;height:36px;font-size:1rem;">
      ${letter}
    </div>
  `);

}
  if (role === "admin") {
    $(".user-link").hide();
    $(".admin-link").show();
  } else {
    $(".admin-link").hide();
    $(".user-link").show();
  }

  // $('#sideUserBtn').click(function () {
  //   $('#logoutDropdown').slideToggle(150);
  // });
  $(document)
    .off("click", ".sideUserBtn")
    .on("click", ".sideUserBtn", function () {
      $(".logoutDropdown").slideToggle(150);
    });

  // Logout
  $(document).on("click", ".logoutBtn", function () {
    $.ajax({
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      url: "./api/auth_apis/logout.php",
      dataType: "json",
      success: function (response) {
        console.log("hi");
        if (response) {
          localStorage.removeItem("token");
          window.location.replace("./index.html");
        }
      },
      error: function (err) {
        localStorage.removeItem("token");
        window.location.replace("./index.html");
      },
    });
  });

  // sidebar nav clicks
  $(document)
    .off("click", ".sidebar-link")
    .on("click", ".sidebar-link", function (e) {
      e.preventDefault();
      const view = $(this).data("view");
      $(".sidebar-link").removeClass("active");
      $(this).addClass("active");
      // close sidebar (mobile)
      const sidebarEl = document.getElementById("sidebar");
      const offcanvas = bootstrap.Offcanvas.getInstance(sidebarEl);
      if (offcanvas) offcanvas.hide();
      loadView(view);
    });
}

function renderNavbar(user) {
  console.log(user);
  $("#navUserName").text(user.name);
  $("#navUserRole").text(user.role === "admin" ? "Admin" : "User");
  $("#navAvatar").text(user.name.charAt(0).toUpperCase());

  // $("#globalSearch").on(
  //   "keyup",
  //   debounce(function () {
  //     const q = $(this).val().trim();
  //     const view = user.role === "admin" ? "quizzes" : "attempt-list";
  //     if (q.length > 1) loadView(view, { search: q });
  //   }, 400),
  // );
}

$(document).on("submit", "#uploadRecipeForm", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const inputs = document.querySelectorAll('input[name="images[]"]');
  let count = 0;

  inputs.forEach((input, index) => {
    if (input.files.length > 0) {
      count++;
      console.log(`Image ${count}:`, input.files[0].name, input.files[0]);
    }
  });

  console.log("Total selected images:", count);

  $.ajax({
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    url: "./api/recipe_apis/add_recipe.php",
    data: formData,
    processData: false,
    contentType: false,
    dataType: "json",

    success: function (response) {
      console.log(" Response:", response);

      if (!response.status) {
        Swal.fire("Error", response.message, "warning");
        return;
      }

      Swal.fire("Success", response.message, "success");

      // Reset form
      $("#uploadRecipeForm")[0].reset();

      // Reset image inputs UI (keep only one row)
      $("#imageInputs").html(`
        <div class="d-flex gap-2 mb-2 image-row">
          <input type="file" name="images[]" class="form-control" accept="image/*">
          <button type="button" class="btn btn-success addImageBtn">+</button>
        </div>
      `);
    },

    error: function (err) {
      console.error(" AJAX Error:", err);
      Swal.fire("Error", "Something went wrong", "error");
    },
  });
});

// Remove input
$(document).on("click", ".removeImageBtn", function () {
  $(this).closest(".image-row").remove();
});
$(document).on("click", ".addImageBtn", function () {
  // Change current + to -
  $(this)
    .removeClass("btn-success addImageBtn")
    .addClass("btn-danger removeImageBtn")
    .text("-");

  // Add new row with +
  $("#imageInputs").append(`
    <div class="d-flex gap-2 mb-2 image-row">
      <input type="file" name="images[]" class="form-control" accept="image/*">
      <button type="button" class="btn btn-success addImageBtn">+</button>
    </div>
  `);
});

function getRecipes(search = "") {
  // loadView("public-home");
  $.ajax({
    method: "GET",
    url: "./api/recipe_apis/get_recipes.php",
    dataType: "json",
    data: {
      search,
    },
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (response) {
      if (!response.status) {
        return;
      }
      let html = "";

      response.data.forEach((recipe) => {
        html += `
    <div class="col-md-4 mb-4">
      <div class="card h-100 border-0 rounded-4 overflow-hidden shadow-sm">

        <div class="position-relative">
          <img src="${recipe.image}" class="card-img-top" style="height:200px;object-fit:cover;">
          <button class="wishlistBtn btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 p-1 shadow-sm"
        data-id="${recipe.id}"
        style="width:34px;height:34px;">

  <i class="bi ${recipe.wishlisted ? "bi-heart-fill" : "bi-heart"} text-danger"></i>

</button>
        </div>

        <div class="card-body d-flex flex-column gap-1 px-3 py-3" style="background:#fff;">
          <h6 class="fw-bold mb-0 text-truncate" style="color:#2B1A0F;">${recipe.title}</h6>
          <p class="small mb-0 flex-grow-1" style="color:#9a7455;">${recipe.description ?? ""}</p>
          <div class="pt-2 border-top mt-2">
            <button class="btn btn-sm w-100 viewRecipeBtn fw-semibold" data-id="${recipe.id}" style="background:#D45E20;color:#fff;border-radius:8px;">
              View Recipe <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
      });
      $("#recipeList").html(html);
    },
  });
}

$(document).on("click", ".viewRecipeBtn", function () {
  const id = $(this).data("id");

  $.ajax({
    method: "POST",
    url: "./api/recipe_apis/get_recipe.php",
    data: { id },
    dataType: "json",
    success: function (response) {
      if (!response.status) return;

      const recipe = response.data;
      $("#recipeModalTitle").text(recipe.title);

      let images = "";
      recipe.images.forEach((img, index) => {
        images += `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${img.image_path}" class="d-block w-100" style="height:420px;object-fit:cover;">
          </div>
        `;
      });

      $("#recipeModalBody").html(`

        <div id="recipeCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
          <div class="carousel-inner rounded-4 overflow-hidden">
            ${images}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#recipeCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#recipeCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>

        <div class="p-3 rounded-4 mb-3" style="background:#FDF5EE;border:0.5px solid #e2cdb8;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-card-list" style="color:#D45E20;font-size:1.1rem;"></i>
            <h6 class="fw-bold mb-0" style="color:#2B1A0F;">Ingredients</h6>
          </div>
          <p class="mb-0 small" style="white-space:pre-line;color:#6b4226;line-height:1.8;">${recipe.ingredients}</p>
        </div>

        <div class="p-3 rounded-4" style="background:#FDF5EE;border:0.5px solid #e2cdb8;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-list-ol" style="color:#D45E20;font-size:1.1rem;"></i>
            <h6 class="fw-bold mb-0" style="color:#2B1A0F;">Steps</h6>
          </div>
          <p class="mb-0 small" style="white-space:pre-line;color:#6b4226;line-height:1.8;">${recipe.steps}</p>
        </div>

      `);

      $("#recipeModal").modal("show");
    },
  });
});

$(document).on("click", ".wishlistBtn", function () {
  const btn = $(this);

  const icon = btn.find("i");

  $.ajax({
    method: "POST",

    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },

    url: "./api/recipe_apis/toggle_wishlist.php",

    data: {
      recipe_id: btn.data("id"),
    },

    dataType: "json",

    success: function (response) {
      if (!response.status) {
        return;
      }

      if (response.data.wishlisted) {
        icon.removeClass("bi-heart").addClass("bi-heart-fill text-danger");
      } else {
        icon.removeClass("bi-heart-fill").addClass("bi-heart text-danger");
      }
    },
  });
});

function getWishlist() {
  $.ajax({
    method: "POST",
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    url: "./api/recipe_apis/get_wishlist.php",
    data: { user_id: localStorage.getItem("user_id") },
    dataType: "json",
    success: function (response) {
      if (!response.status) return;

      let html = "";
      response.data.forEach((recipe) => {
        html += `
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 rounded-4 overflow-hidden shadow-sm">

              <div class="position-relative">
                <img src="${recipe.image}" class="card-img-top" style="height:200px;object-fit:cover;">
                <span class="position-absolute top-0 end-0 m-2 badge rounded-pill" style="background:#D45E20;">
                  <i class="bi bi-heart-fill me-1"></i>Saved
                </span>
              </div>

              <div class="card-body d-flex flex-column gap-1 px-3 py-3" style="background:#fff;">
                <h6 class="fw-bold mb-0 text-truncate" style="color:#2B1A0F;">${recipe.title}</h6>
                <p class="small mb-0 flex-grow-1" style="color:#9a7455;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${recipe.description ?? ""}</p>
                <div class="pt-2 border-top mt-2">
                  <button class="btn btn-sm w-100 viewRecipeBtn fw-semibold" data-id="${recipe.id}" style="background:#D45E20;color:#fff;border-radius:8px;">
                    View Recipe <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>

            </div>
          </div>
        `;
      });

      $("#wishlistRecipes").html(html);
    },
  });
}
let searchTimer;

$(document).on("input", "#globalSearch", function () {
  clearTimeout(searchTimer);

  const search = $(this).val().trim();

  searchTimer = setTimeout(function () {
    // loadView("public-home")
    getRecipes(search);
  }, 400);
});
$(document).on("blur", "#globalSearch", function () {
  $(this).val("");
});

function getProfile() {
  $.ajax({
    method: "POST",

    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },

    url: "./api/recipe_apis/get_profile.php",
    dataType: "json",

    success: function (response) {
      if (!response.status) {
        return;
      }
      const user = response.data;

      $("#profileName").text(user.name);
      $("#profileRole").text(user.role === "admin" ? "Administrator" : "User");
      $("#profileEmail").text(user.email);
      $("#profileLabel").text(user.label);
      $("#profileTotal").text(user.total);
      $("#profileAvatar").text(user.name.charAt(0).toUpperCase());
    },
  });
}

$(document).on("submit", "#changePasswordForm", function (e) {
  e.preventDefault();

  $.ajax({
    method: "POST",

    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },

    url: "./api/recipe_apis/change_password.php",

    data: $(this).serialize(),

    dataType: "json",

    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "warning");

        return;
      }

      Swal.fire("Success", response.message, "success");

      $("#changePasswordForm")[0].reset();
    },
  });
});
