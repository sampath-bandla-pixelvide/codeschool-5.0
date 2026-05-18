const token = localStorage.getItem("food_token");
if (!token) { window.location.href = "index.html"; }

let adminUser = null;

function authHeader() {
  return { Authorization: token };
}
function adminHeader() {
  return { Authorization: token };
}

let currentSection = "dashboard";
let refreshTimer = null;

function ajaxError(xhr) {
  console.error("AJAX Error", xhr.status, xhr.responseText);
}

function statusBadge(s) {
  const map = {
    placed: "bg-primary",
    preparing: "bg-warning text-dark",
    out_for_delivery: "bg-info text-dark",
    delivered: "bg-success",
    cancelled: "bg-danger",
  };
  return `<span class="badge badge-status ${map[s] || "bg-secondary"}">${(s || "—").replace(/_/g, " ")}</span>`;
}

function skeletonCards(count = 4, colClass = "col-sm-6 col-md-4 col-xl-3") {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `<div class="${colClass}">
          <div class="card food-card placeholder-glow">
            <div class="placeholder w-100" style="height:175px;border-radius:0"></div>
            <div class="card-body p-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="placeholder col-6"></span>
                <span class="placeholder col-3"></span>
              </div>
              <span class="placeholder col-5 mb-1 d-block"></span>
              <span class="placeholder col-8 mb-3 d-block"></span>
              <div class="d-flex justify-content-between">
                <span class="placeholder col-3"></span>
                <span class="placeholder col-2"></span>
              </div>
            </div>
          </div>
        </div>`;
  }
  return html;
}

function skeletonUserCards(count = 6, colClass = "col-sm-6 col-md-4 col-xl-3") {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `<div class="${colClass}">
          <div class="card user-card p-3 placeholder-glow">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div class="placeholder rounded-circle flex-shrink-0" style="width:42px;height:42px"></div>
              <div class="flex-grow-1">
                <span class="placeholder col-7 d-block mb-1"></span>
                <span class="placeholder col-4 d-block"></span>
              </div>
            </div>
            <span class="placeholder col-10 d-block mb-1"></span>
            <span class="placeholder col-7 d-block"></span>
          </div>
        </div>`;
  }
  return html;
}

function skeletonStatCards() {
  return ["stat-users", "stat-cats", "stat-items", "stat-orders"]
    .map((id) => `<span id="${id}" class="placeholder col-4 d-block"></span>`)
    .join("");
}

function skeletonTableRows(cols, count = 5) {
  const cells = Array(cols)
    .fill('<td><span class="placeholder col-8"></span></td>')
    .join("");
  return Array(count)
    .fill(`<tr class="placeholder-glow">${cells}</tr>`)
    .join("");
}

function skeletonDashUserCards(count = 6) {
  return skeletonUserCards(count, "col-sm-6 col-md-4");
}

function addToPreview(file, index, previewId, arr) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const wrap = $(`<div class="preview-item" data-idx="${index}">`);
    const img = $("<img>").attr("src", e.target.result);
    const btn = $(
      '<button type="button" class="remove-img"><i class="fa-solid fa-times"></i></button>',
    );
    btn.on("click", function () {
      arr.splice($(this).closest(".preview-item").data("idx"), 1);
      wrap.remove();
      $(`#${previewId} .preview-item`).each(function (i) {
        $(this).data("idx", i);
      });
    });
    wrap.append(img).append(btn);
    $(`#${previewId}`).append(wrap);
  };
  reader.readAsDataURL(file);
}

function loadSection(name, silent) {
  if (!silent) {
    $(".section").removeClass("active");
    $(`#section-${name}`).addClass("active");
    $(".sidebar .nav-link").removeClass("active");
    $(`.sidebar .nav-link[data-section="${name}"]`).addClass("active");
    $("#page-title").text(
      $(`.sidebar .nav-link[data-section="${name}"]`).text().trim(),
    );
  }
  if (name === "dashboard") loadDashboard();
  if (name === "categories") loadCategories();
  if (name === "food-items") {
    loadFoodItems();
    loadCatsSelect();
  }
  if (name === "users") loadUsers();
  if (name === "orders") loadOrders();
  if (name === "settings") loadAdminSettings();
}

function showSection(name) {
  currentSection = name;
  loadSection(name, false);
}

$(function () {
  if (!token) return;

  $.ajax({
    url: "api/get_current_user.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data || !d.data.user || d.data.user.role !== "admin") {
        localStorage.removeItem("food_token");
        window.location.href = "index.html";
        return;
      }
      adminUser = d.data.user;
      initAdmin();
    },
    error: function () {
      localStorage.removeItem("food_token");
      window.location.href = "index.html";
    },
  });
});

function initAdmin() {
  $("#admin-name").text(adminUser.name);
  $("#admin-avatar").text(adminUser.name.charAt(0).toUpperCase());

  $(".sidebar .nav-link").on("click", function (e) {
    e.preventDefault();
    showSection($(this).data("section"));
    $("#sidebar").removeClass("open");
    $("#sidebarBackdrop").removeClass("show");
  });

  $("#sidebar-toggle").on("click", function () {
    $("#sidebar").toggleClass("open");
    $("#sidebarBackdrop").toggleClass("show");
  });

  $("#sidebarBackdrop").on("click", function () {
    $("#sidebar").removeClass("open");
    $(this).removeClass("show");
  });

  $("#logout-btn").on("click", function () {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff6b2b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({ url: "api/logout.php", method: "POST", data: { token } });
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  });

  $(document).on("click", ".delete-btn", function () {
    const type = $(this).data("type");
    const id = $(this).data("id");
    const itemLabel = type === "category" ? "category" : "food item";

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete this ${itemLabel}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const url = type === "category" ? "api/admin/categories.php" : "api/admin/food_items.php";
        $.ajax({
          url: url,
          method: "POST",
          headers: authHeader(),
          data: { action: "delete", id: id },
          dataType: "json",
          success: function (d) {
            if (d.status) {
              Swal.fire('Deleted!', `The ${itemLabel} has been deleted.`, 'success');
              if (type === "category") loadCategories();
              else loadFoodItems();
            } else {
              Swal.fire('Error', d.message, 'error');
            }
          },
          error: function() {
            Swal.fire('Error', 'Failed to delete item.', 'error');
          }
        });
      }
    });
  });

  showSection("dashboard");
}
