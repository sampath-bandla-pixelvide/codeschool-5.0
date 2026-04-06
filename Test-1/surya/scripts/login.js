$(document).ready(function () {
  $("#loginBtn").click(function () {
    let username = $("#userName").val();
    let password = $("#password").val();

    $.ajax({
      type: "POST",
      url: "https://dummyjson.com/auth/login",
      contentType: "application/json",
      data: JSON.stringify({
        username: username,
        password: password,
      }),
      success: function (response) {
        console.log(response);
        localStorage.setItem("token", response.accessToken);
        window.location.href = "./dashboard.html";
      },
      error: function () {
        $("#apiError").text("Invalid username or password");
      },
    });
  });
});
