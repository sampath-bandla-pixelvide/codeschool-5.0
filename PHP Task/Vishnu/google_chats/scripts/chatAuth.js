let token = "";
let user = null;
let currentChatUser = null;

$(document).ready(function () {
  token = localStorage.getItem("token") || "";

  if (!token) {
    window.location.href = "./index.html";
    return;
  }

  $.ajax({
    url: "./api/validate_token.php",
    method: "POST",
    data: { token: token },
    dataType: "json",
    success: function (res) {
      if (res.status && res.data && res.data.user) {
        user = res.data.user;
        localStorage.removeItem("user");
        startApp();
      } else {
        localStorage.removeItem("token");
        window.location.href = "./index.html";
      }
    },
    error: function () {
      localStorage.removeItem("token");
      window.location.href = "./index.html";
    },
  });
});
