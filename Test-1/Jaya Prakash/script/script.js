const token = localStorage.getItem("userToken");
if (token) {
  window.location.href = "../templates/index.html";
}

$("#loginBtn").click(function () {
  $("#loginBtn").addClass("disabled");
  $("#btnText").addClass("d-none");
  $("#spinner").removeClass("d-none");

  let userName = $("#userName");
  let userPass = $("#password");

  function formValidations(username, password) {
    return (
      username.val().length >= 4 &&
      username.val().length <= 15 &&
      password.val().length >= 8 &&
      password.val().length <= 16
    );
  }

  function warnings(type = "validation") {
    if (type === "validation") {
      $("#userNameError").removeClass("d-none");
      $("#passwordError").removeClass("d-none");
    } else {
      $("#invalidCreds").removeClass("d-none");
    }

    $("#userName").addClass("is-invalid");
    $("#password").addClass("is-invalid");
  }

  if (formValidations(userName, userPass)) {
    $.ajax({
      url: "https://dummyjson.com/user/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username: userName.val(),
        password: userPass.val(),
      }),
      success: function (response) {
        localStorage.setItem("userToken", response.accessToken);

        Swal.fire({
          title: "Success!",
          text: "Login successful",
          icon: "success",
        }).then(() => {
          window.location.href = "../templates/index.html";
        });
      },
      error: function () {
        $("#loginBtn").removeClass("disabled");
        $("#btnText").removeClass("d-none");
        $("#spinner").addClass("d-none");
        warnings("invalid");
      },
    });
  } else {
    $("#loginBtn").removeClass("disabled");
    $("#btnText").removeClass("d-none");
    $("#spinner").addClass("d-none");
    warnings("validation");
  }
});

function clearWarnings() {
  $("#userNameError, #passwordError, #invalidCreds").addClass("d-none");
  $("#userName, #password").removeClass("is-invalid");
}

$("#userName, #password").on("input", clearWarnings);