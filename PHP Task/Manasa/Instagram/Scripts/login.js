$(document).ready(function () {
  function setError(inputId, errorId, message) {
    $("#" + errorId).text(message);
    $("#" + inputId).addClass("is-invalid");
  }

  function clearError(inputId, errorId) {
    $("#" + errorId).text("");
    $("#" + inputId).removeClass("is-invalid");
  }

  function validateInput() {
    let input = $("#loginInput").val().trim();
    let password = $("#password").val().trim();

    $("#loginBtn").prop("disabled", !(input && password));
  }

  $("#loginInput, #password").on("input", function () {
    let id = $(this).attr("id");
    clearError(id, id + "Error");
    validateInput();
  });

  $("#loginForm").submit(function (e) {
    e.preventDefault();

    let input = $("#loginInput").val().trim();
    let password = $("#password").val().trim();

    let valid = true;

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phonePattern = /^[6-9]\d{9}$/;
    let usernamePattern = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{3,30}$/;

    if (!input) {
      setError("loginInput", "loginError", "Enter email, phone or username");
      valid = false;
    } else if (
      !emailPattern.test(input) &&
      !phonePattern.test(input) &&
      !usernamePattern.test(input)
    ) {
      setError("loginInput", "loginError", "Invalid format");
      valid = false;
    } else {
      clearError("loginInput", "loginError");
    }

    if (!password) {
      setError("password", "passwordError", "Enter password");
      valid = false;
    } else {
      clearError("password", "passwordError");
    }

    if (!valid) return;

    $.ajax({
      url: "api/login.php",
      method: "POST",
      data: {
        login: input,
        password: password,
      },
      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (response.status === "success") {
          window.location.href = "instgramHome.html";
        } else {
          if (response.field === "login") {
            setError("loginInput", "loginError", response.message);
          } else if (response.field === "password") {
            setError("password", "passwordError", response.message);
          } else {
            setError("loginInput", "loginError", response.message);
          }
        }
      },
    });
  });
});
