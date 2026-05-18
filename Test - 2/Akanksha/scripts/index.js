$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  $.ajax({
    url: "api/validate_token.php",
    method: "GET",
    headers: {
      Authorization: token,
    },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        window.location.href = "admin_dashboard.html";
      }
    },

    error: function (err) {
      console.log(err);
    },
  });
});

$("#loginForm").submit(function (e) {
  e.preventDefault();

  let email = $("#email").val();
  let password = $("#password").val();

  let isValid = true;

  $("small").text("");

  let emailPattern = /^[a-zA-Z]+[a-zA-Z0-9+#$.]+@[a-zA-Z]{3,}\.[a-zA-Z]{2,}/;

  if (email === "") {
    $("#emailErr").text("Email is required");

    isValid = false;
  } else if (!emailPattern.test(email)) {
    $("#emailErr").text("Invalid email");

    isValid = false;
  }

  if (password === "") {
    $("#passwordErr").text("Password is required");

    isValid = false;
  } else if (password.length < 6) {
    $("#passwordErr").text("Password minimum 6 characters");

    isValid = false;
  }

  if (!isValid) {
    return;
  }

  $.ajax({
    url: "api/index.php",
    method: "POST",
    dataType: "json",
    data: {
      email: email,
      password: password,
    },

    success: function (response) {
      if (response.status) {
        localStorage.setItem("token", response.data.token);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message,
        });
        // window.location.href = "admin_dashboard.html";

        if (response.data.user.role === "admin") {
          window.location.href = "admin_dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }
    },
  });
});
