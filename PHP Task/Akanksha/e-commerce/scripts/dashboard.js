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

loadDashboard();

function loadDashboard() {
  $.ajax({
    url: "/api/dashboard.php",
    method: "GET",
    dataType: "json",
    success: function (res) {
      console.log(res);
      if (res.status) {
        const data = res.data;

        $("#totalUsers").text(data.users);
        $("#revenue").text(data.revenue);
        $("#orders").text(data.orders);
        $("#pending").text(data.pending);
      }
    },
  });
}
