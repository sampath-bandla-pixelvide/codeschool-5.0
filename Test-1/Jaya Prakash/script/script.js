let token = localStorage.getItem("userToken");
if (token) {
  window.location.href = "../templates/index.html";
}
clearWarnings();
$("#loginBtn").click(function () {
  $("#loginBtn").addClass("disabled");
  $("#btnText").addClass("d-none");
  $("#spinner").removeClass("d-none");
  let userName = $("#userName");
  let userPass = $("#password");

  function formValidations(username, password) {
    if (
      username.val().length >= 4 &&
      username.val().length <= 15 &&
      password.val().length >= 8 &&
      password.val().length <= 16
    ) {
      return true;
    }
    return false;
  }

  function warnings(useCase = null) {
    if (useCase) {
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
      data: {
        username: userName.val(),
        password: userPass.val(),
      },
      success: function (response) {
        localStorage.setItem("userToken", response.accessToken);
        Swal.fire({
          title: "success!",
          text: "Login successfull",
          icon: "success",
        }).then(()=> {window.location.href = "../templates/index.html";})
      },
      error: function (error) {
        $("#loginBtn").removeClass("disabled");
        $("#btnText").removeClass("d-none");
        $("#spinner").addClass("d-none");
        warnings(1);
        console.log(error);
      },
    });
  } else {
    $("#loginBtn").removeClass("disabled");
    $("#btnText").removeClass("d-none");
    $("#spinner").addClass("d-none");
    warnings();
  }
});

function clearWarnings() {
  $("#nameError").addClass("d-none");
  $("#passError").addClass("d-none");
  $("#invalidCreds").addClass("d-none");
  $("#userName").removeClass("is-invalid");
  $("#password").removeClass("is-invalid");
}
