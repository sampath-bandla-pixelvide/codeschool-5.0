$(document).ready(function () {

  function loadUser() {
    let user = localStorage.getItem("user");
    if (user) {
      user = JSON.parse(user);
      $("#displayName").text(user.firstName + " " + user.lastName);
      $("#displayEmail").text(user.email);
    }
  }

  function checkAuth() {
    let token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    $.ajax({
      type: "GET",
      url: "https://dummyjson.com/auth/me",
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (data) {
        localStorage.setItem("user", JSON.stringify(data));
        loadUser();
      },
      error: function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
         Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Session expired. Please login again!",
        });
      },
    });
  }

  loadUser();
  checkAuth();

  $("#userIcon").click(function () {
    let token = localStorage.getItem("token");

    if (!token) {
      $("#loginModal").modal("show");
    } else {
      $("#userDropdown").toggle();
    }
  });

  $("#logoutBtn").click(function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire({
          title: "Logged out successfully!",
          icon: "success",
          draggable: true,
        });
    $("#userDropdown").hide();
  });

  $(document).click(function (e) {
    if (!$(e.target).closest("#userIcon, #userDropdown").length) {
      $("#userDropdown").hide();
    }
  });

});