$(document).ready(function () {
  $("#sidebarContainer").load("templates/sidebar.html", function () {
    let role = getUserRole();

    if (role === "student") {
      $(".admin-menu").hide();
    }

    if (role === "admin") {
      $(".student-menu").hide();
    }
  });

  $("#navbarContainer").load("templates/navbar.html", function () {
    setUserDetails();

    $("#toggleSidebar").click(function () {
      $("#sidebar").toggleClass("show");
      $("#sidebarOverlay").toggleClass("show");
    });

    $("#logoutBtn").click(function () {
      logoutUser();
    });
  });

  $(document).on("click", "#sidebarOverlay", function () {
    closeSidebar();
  });

  $(document).on("click", ".side-link", function () {
    if ($(window).width() < 992) {
      closeSidebar();
    }
  });
});

function setUserDetails() {
  let user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    let fullName = user.first_name + " " + user.last_name;

    $("#navUserName").text(user.first_name);
    $("#dropdownUserName").text(fullName);
    $("#dropdownUserEmail").text(user.email);
    $("#userRole").text((user.role || "student").toUpperCase());
  }
}

function getUserRole() {
  let user = JSON.parse(localStorage.getItem("user"));
  return user ? user.role : "student";
}

function closeSidebar() {
  $("#sidebar").removeClass("show");
  $("#sidebarOverlay").removeClass("show");
}

function logoutUser() {
  let token = localStorage.getItem("token");

  $.ajax({
    type: "POST",
    url: "api/logout.php",
    data: {
      token: token,
    },
    dataType: "json",

    complete: function () {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "index.html";
    },
  });
}