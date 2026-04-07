$(document).ready(function () {
  $("#loginBtn").click(function () {
    username = $("#username").val(); 
    password = $("#password").val();
    if (username === "" && password === "") {
      $("#usernameError").text("Username required");
      $("#passwordError").text("Password required");
      return;
    }
    if (username.length < 4 || username.length > 12) {
      $("#usernameError").text("Username must be above 4 and below 12");
    } else if (password.length < 4 || password.length > 12) {
      $("#passwordError").text("Password must be above 4 and below 12");
    } else
      $.ajax({
        type: "POST",
        url: "https://dummyjson.com/auth/login",
        contentType: "application/Json",
        data: JSON.stringify({
          username,
          password,
        }),
        success: function (response) {
          console.log(response);
          localStorage.setItem("token", response.accessToken);
          console.log(localStorage.getItem("token"));
          window.location.replace("./Nagesh/homepage.html");
        },
        error: function () {
          Swal.fire({
            title: "Warning!",
            text: "Invalid credentilas",
            icon: "warning",
          });
        },
      });
  });
});
