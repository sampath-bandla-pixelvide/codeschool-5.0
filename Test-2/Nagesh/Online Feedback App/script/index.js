$(document).ready(() => {
  emptyText();

  $("#loginForm").submit((e) => {
    e.preventDefault();

    const email = $("#floatingInput").val().trim();
    const password = $("#floatingPassword").val().trim();

    let flag = true;

    if (!validateEmail(email)) {
      $("#emailError").text("Enter a valid email");
      flag = false;
    }

    if (!validatePassword(password)) {
      $("#passwordError").text("Enter a valid password");
      flag = false;
    }

    if (!flag) return;

    $.ajax({
      type: "POST",

      url: "/api/login.php",

      data: {
        email: email,
        password: password,
      },

      dataType: "json",

      success: function (response) {
        if (response.status) {
          Swal.fire({
            icon: "success",
            text: response.message,
          }).then(() => {
            localStorage.setItem("token", response.data.token);

            localStorage.setItem("user", response.data.first_name);

            localStorage.setItem("userId", response.data.id);

            localStorage.setItem("role", response.data.role);

            window.location.href = "./dashboard.html";
          });
        } else {
          Swal.fire({
            icon: "error",
            text: response.message,
          });
        }
      },

      error: function (xhr) {
        Swal.fire({
          icon: "error",
          text: xhr.responseJSON?.message || "Something went wrong",
        });
      },
    });
  });

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
  }

  function validatePassword(password) {
    return password.length >= 5;
  }

  function emptyText() {
    $("#passwordError").text("");
    $("#emailError").text("");
  }
});
