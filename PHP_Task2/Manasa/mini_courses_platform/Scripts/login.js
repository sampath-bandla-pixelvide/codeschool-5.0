$(document).ready(function () {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    let email = $("#email").val().trim();
    let password = $("#password").val().trim();

    $(".text-danger").text("");

    if (email === "") {
      $("#emailError").text("Email is required");
      isValid = false;
    }

    if (password === "") {
      $("#passwordError").text("Password is required");
      isValid = false;
    }

    if (isValid) {
      let formData = {
        email: email,
        password: password,
      };

      $.ajax({
        url: "api/login.php",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),

        success: function (response) {
          let res =
            typeof response === "string" ? JSON.parse(response) : response;

          if (res.status === "success") {
            localStorage.setItem("token", res.token);
            localStorage.setItem("role", res.user.role);

            Swal.fire({
              icon: "success",
              title: "Login Successful",
            }).then(() => {
              window.location.href = "Dashboard.html";
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: res.message,
            });
          }
        },

        error: function () {
          Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Something went wrong",
          });
        },
      });
    }
  });
});
