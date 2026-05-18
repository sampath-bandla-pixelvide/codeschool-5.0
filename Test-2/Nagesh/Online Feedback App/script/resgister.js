$(document).ready(() => {
  $("#registerForm")[0].reset();

  clearErrors();

  $("#registerForm").submit((e) => {
    e.preventDefault();

    clearErrors();

    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const email = $("#floatingInput").val();
    const dob = $("#dob").val();
    const phone = $("#phone").val();
    const password = $("#floatingPassword").val();
    const confirmPassword = $("#confirmPassword").val();

    let flag = true;

    if (!validateName(firstName)) {
      $("#fnameError").text("First name should contain only alphabets");
      flag = false;
    }

    if (!validateName(lastName)) {
      $("#lnameError").text("Last name should contain only alphabets");
      flag = false;
    }

    if (!validateEmail(email)) {
      $("#emailError").text("Enter a valid email address");
      flag = false;
    }

    if (!validateDOB(dob)) {
      $("#dobError").text("You must be atleast 18 years old");
      flag = false;
    }

    if (!validatePhone(phone)) {
      $("#phoneError").text("Phone number should contain exactly 10 digits");
      flag = false;
    }

    if (!validatePassword(password)) {
      $("#psswdError").text(
        "Password must contain uppercase, lowercase, number and special character",
      );
      flag = false;
    }

    if (password !== confirmPassword) {
      $("#confirmPsswdError").text("Passwords do not match");
      flag = false;
    }

    if (flag) {
      $.ajax({
        url: "/api/register.php",
        type: "POST",
        data: {
          firstName,
          lastName,
          email,
          dob,
          phone,
          password,
          confirmPassword,
        },
        dataType: "json",

        success: function (response) {
          if (response.status) {
            Swal.fire({
              icon: "success",
              title: "Registration Successful",
              text: response.message,
            }).then(() => {
              window.location.replace("./index.html");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Registration Failed",
              text: response.message,
            }).then(() => {
              $("#registerForm")[0].reset();
            });
          }
        },
        error: function () {
          Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Something went wrong. Please try again later",
          }).then(() => {
            $("#registerForm")[0].reset();
          });
        },
      });
    }
  });

  function validateName(name) {
    const regex = /^[A-Za-z]+$/;
    return regex.test(name);
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePhone(phone) {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  }

  function validatePassword(password) {
    return password.length >= 5;

    // return regex.test(password);
  }

  function validateDOB(dob) {
    const birthDate = new Date(dob);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - birthDate.getFullYear();

    const monthDifference = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18;
  }

  function clearErrors() {
    $("#fnameError").text("");
    $("#lnameError").text("");
    $("#emailError").text("");
    $("#dobError").text("");
    $("#phoneError").text("");
    $("#passwordError").text("");
    $("#confirmPasswordError").text("");
  }

  $("#phone").on("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
});
