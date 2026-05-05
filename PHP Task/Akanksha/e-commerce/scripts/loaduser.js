$(document).ready(function () {
  $("#sidebar").load("sidebar.html");

  $("#header").load("header.html", function () {
    loadUser();
  });
});

function loadUser() {
  const user_id = localStorage.getItem("user_id");
  $.ajax({
    url: "/api/get_user.php",
    method: "GET",
    dataType: "json",
    data: {
      user_id: user_id,
    },
    success: function (res) {
      if (res.status) {
        console.log(res);

        $("#userName").text(res.data.first_name);
        $("#userNameDropdown").text(res.data.first_name);
        $("#userEmail").text(res.data.email);
        $("#role").text(res.data.role);

        const name = res.data.first_name;
        const initial = name.charAt(0).toUpperCase();

        $("#userAvatar").text(initial);
      }
    },
  });
}
