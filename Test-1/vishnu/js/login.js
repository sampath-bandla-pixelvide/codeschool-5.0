$(document).ready(function () {
  function login() {
    let username = $("#userName").val().trim();
    let password = $("#password").val().trim();

    if (!validateInputs(username, password)) return;

    $.ajax({
      type: "POST",
      url: "https://dummyjson.com/auth/login",
      contentType: "application/json",
      data: JSON.stringify({
        username,
        password,
        expiresInMins: 720,
      }),
      success: function (data) {
        if (data.message) {
          $("#userError").text("Invalid username or password");
          return;
        }

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data));
        Swal.fire({
          title: "Login successful!",
          icon: "success",
          draggable: true,
        });

        $("#loginModal").modal("hide");
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      },
    });
  }

  $("#login").click(login);
  $("#userName").on("input", function () {
    $(this).removeClass("is-invalid");
    $("#userError").text("");
  });

  $("#password").on("input", function () {
    $(this).removeClass("is-invalid");
    $("#passError").text("");
  });
  function validateInputs(username, password) {
    let valid = true;
    if (username === "") {
      $("#userName").addClass("is-invalid");
      $("#userError").text("Username is required");
      valid = false;
    }

    if (username.length < 3) {
      $("#userName").addClass("is-invalid");
      $("#userError").text("Username must be at least 3 characters");
      valid = false;
    }

    if (username.length > 24) {
      $("#userName").addClass("is-invalid");
      $("#userError").text("Username must be less than 24 characters");
      valid = false;
    }
    if (username !== "" && username.length >= 3 && username.length <= 24) {
      $("#userError").text("");
    }
    if (password === "") {
      $("#password").addClass("is-invalid");
      $("#passError").text("Password is required");
      valid = false;
    }

    if (password.length < 8) {
      $("#password").addClass("is-invalid");
      $("#passError").text("Password must be at least 8 characters");
      valid = false;
    }

    if (password.length > 26) {
      $("#password").addClass("is-invalid");
      $("#passError").text("Password must be less than 26 characters");
      valid = false;
    }

    if (password !== "" && password.length >= 8 && password.length <= 26) {
      $("#passError").text("");
    }

    return valid;
  }
});
