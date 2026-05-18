function checkLoggedUser() {
  let token = localStorage.getItem("token");

  if (!token) {
    $("#authBtn").click(function () {
      window.location.href = "login.html";
    });
    return;
  }
  $(document).on("click", "#openMenu", function () {
    $("#menuOverlay").fadeIn(200);
  });

  $(document).on("click", "#closeMenu", function () {
    $("#menuOverlay").fadeOut(200);
  });
  $.ajax({
    url: "api/get_logged_user.php",
    method: "POST",
    data: { token: token },

    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;

      if (!response.status) {
        localStorage.removeItem("token");
        return;
      }

      let user = response.data;

      $("#authArea").html(`
          <div class="dropdown">
            
            <button class="btn btn-outline-warning rounded-5  dropdown-toggle fw-bold px-3" 
                    data-bs-toggle="dropdown">
              <i class="bi bi-person-circle me-1"></i> ${user.name}
            </button>

            <ul class="dropdown-menu dropdown-menu-end shadow bg-dark text-white border-0">

              <li class="px-3 py-2 border-bottom">
                <div class="fw-bold">${user.name}</div>
                <small class="text-secondary">${user.phone}</small>
              </li>

              <li>
                <a class="dropdown-item text-warning fw-blod" href="watchlist.html">
                  <i class="bi bi-bookmark me-2"></i> Watchlist
                </a>
              </li>

              <li>
                <a class="dropdown-item text-warning" href="profile.html">
                  <i class="bi bi-person me-2"></i> Edit Profile
                </a>
              </li>

              <li>
                <a class="dropdown-item text-warning fw-blod" href="home.html">
                  <i class="bi bi-house me-2"></i> Goto Home
                </a>
              </li>

              <li><hr class="dropdown-divider bg-secondary"></li>

              <li>
                <button class="dropdown-item text-danger fw-bold" id="logoutBtn">
                  <i class="bi bi-box-arrow-right me-2"></i> Sign out
                </button>
              </li>

            </ul>

          </div>
        `);
    },
  });
}

$(document).on("keyup", "#searchInput", function () {
  let value = $(this).val().toLowerCase();

  $(".movie-card").each(function () {
    let title = $(this).find(".movie-title").text().toLowerCase();

    if (title.includes(value)) {
      $(this).closest(".movie-col").show();
    } else {
      $(this).closest(".movie-col").hide();
    }
  });
});
