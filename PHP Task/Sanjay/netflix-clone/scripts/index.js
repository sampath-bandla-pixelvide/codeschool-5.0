$(document).ready(() => {
  if (localStorage.getItem("token")) {
    window.location.replace("../home.html");
  }

  const emailEl = $("#floatingInput");
  const passwordEl = $("#floatingPassword");
  const emailError = $("#emailErrMsg");
  const passwordError = $("#passwordErrMsg");
  const signUpBtn = $("#signUpBtn");
  const signInUsingCodeBtn = $("#codeBtn");

  signUpBtn.on("click", () => {
    window.location.replace("../register.html");
  });

  signInUsingCodeBtn.on("click", () => {
    window.location.replace("../codeSignIn.html");
  });

  $("#loginForm").submit((e) => {
    e.preventDefault();

    emailEl.removeClass("is-invalid");
    passwordEl.removeClass("is-invalid");
    emailError.text("");
    passwordError.text("");

    let flag = false;

    const email = emailEl.val();
    const password = passwordEl.val();

    if (!isValidEmail(email)) {
      emailError.text("Please enter a valid email address!");
      emailEl.addClass("is-invalid");
      flag = true;
    }

    if (!isValidPassword(password)) {
      passwordError.html(`
        • Must be 5–20 characters<br>
        • Must include uppercase,lowercase<br>
        • Must include special character
      `);
      passwordEl.addClass("is-invalid");
      flag = true;
    }

    if (flag) return;

    $.ajax({
      type: "POST",
      url: "../api/index.php",
      data: {
        email,
        password,
      },
      dataType: "json",
      success: function (response) {
        if (response) {
          Swal.fire({
            icon: "Success",
            title: "logged in successfully",
            background: "#1e1e1e",
            color: "#fff",
            confirmButtonColor: "#e50914",
          }).then(() => {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", response.data.first_name);
            window.location.replace("../home.html");
          });
        }
        Swal.fire({
          icon: "error",
          title: "login failed",
          text: response.message,
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#e50914",
        });
      },
      error: function (response) {
        Swal.fire({
          icon: "error",
          title: "login failed",
          text: response.message,
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#e50914",
        });
      },
    });
  });

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function isValidPassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,20}$/;
    return regex.test(password);
  }
});
