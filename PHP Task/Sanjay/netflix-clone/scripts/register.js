$(document).ready(() => {
  const firstNameEl = $("#firstName");
  const lastNameEl = $("#lastName");
  const emailEl = $("#floatingInput");
  const dobEl = $("#dob");
  const passwordEl = $("#floatingPassword");
  const confirmPasswordEl = $("#floatingConfirmPassword");

  const firstNameErr = $("#firstNameErrMsg");
  const lastNameErr = $("#lastNameErrMsg");
  const emailErr = $("#emailErrMsg");
  const dobErr = $("#dobErrMsg");
  const passwordErr = $("#passwordErrMsg");
  const confirmPasswordErr = $("#confirmPasswordErrMsg");

  const signInBtn = $("#signInBtn");

  signInBtn.on("click", () => {
    window.location.replace("../index.html");
  });

  $("#loginForm").submit((e) => {
    e.preventDefault();

    $("input").removeClass("is-invalid");
    $("small").text("");

    let flag = false;

    const firstName = firstNameEl.val();
    const lastName = lastNameEl.val();
    const email = emailEl.val();
    const dob = dobEl.val();
    const password = passwordEl.val();
    const confirmPassword = confirmPasswordEl.val();

    if (firstName.length < 3) {
      firstNameErr.text("First name must be at least 3 characters");
      firstNameEl.addClass("is-invalid");
      flag = true;
    }

    if (firstName.length > 20) {
      firstNameErr.text("First name must be atmost 20 characters");
      firstNameEl.addClass("is-invalid");
      flag = true;
    }

    if (lastName.length < 3) {
      lastNameErr.text("Last name must be atleasts 3 characters");
      lastNameEl.addClass("is-invalid");
      flag = true;
    }

    if (lastName.length > 20) {
      lastNameErr.text("Last name must be atmost 20 characters");
      lastNameEl.addClass("is-invalid");
      flag = true;
    }

    if (!isValidEmail(email)) {
      emailErr.text("Enter a valid email address");
      emailEl.addClass("is-invalid");
      flag = true;
    }

    if (!dob) {
      dobErr.text("Please select your date of birth");
      dobEl.addClass("is-invalid");
      flag = true;
    }

    if (!isValidPassword(password)) {
      passwordErr.html(`
        • Must be 5–20 characters<br>
        • Must include uppercase,lowercase<br>
        • Must include number,special character<br>
      `);
      passwordEl.addClass("is-invalid");
      flag = true;
    }

    if (password !== confirmPassword) {
      confirmPasswordErr.text("Passwords do not match");
      confirmPasswordEl.addClass("is-invalid");
      flag = true;
    }

    if (flag) return;
    else {
      $.ajax({
        type: "post",
        url: "/api/register.php",
        data: {
          firstName,
          lastName,
          email,
          dob,
          password,
          confirmPassword,
        },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            Swal.fire({
              icon: "success",
              title: "success",
              text: "User Successfully registered",
              background: "#1e1e1e",
              color: "#fff",
              confirmButtonColor: "#e50914",
            }).then(() => {
              window.location.replace("../index.html");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Registration failed",
              text: "User Registration falied",
              background: "#1e1e1e",
              color: "#fff",
              confirmButtonColor: "#e50914",
            });
          }
        },
        error: function () {
          Swal.fire({
            icon: "error",
            title: "Registration failed",
            background: "#1e1e1e",
            color: "#fff",
            confirmButtonColor: "#e50914",
          });
          $("input").removeClass("is-invalid");
          $("small").text("");
        },
      });
    }
  });

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function isValidPassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    return regex.test(password);
  }
});
