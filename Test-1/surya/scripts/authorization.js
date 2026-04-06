$(document).ready(function () {
  checkAuthentication();
});



function checkAuthentication() {
  let token = localStorage.getItem("token");
  
  if (!token) {
    if (!window.location.pathname.includes("login")) {
      window.location.href = "./login.html";
    }
    return;
  }
  $.ajax({
    type: "GET",
    url: "https://dummyjson.com/auth/me",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (response) {
      if (!window.location.pathname.includes("dashboard")) {
        window.location.href = "./dashboard.html";
      }
    },
    error: function (response) {
      localStorage.removeItem("token");
      alert("session expired.");
      window.location.href = "./login.html";
    },
  });
}
