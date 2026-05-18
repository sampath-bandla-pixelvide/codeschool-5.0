const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;

const phoneRegex = /^[6-9][0-9]{9}$/;

const passwordRegex = /^(?=.*[@$!%*?&]).{8,}$/;

$(document).ready(function () {
  $(document).on("submit", "#registerForm", function (e) {
    e.preventDefault();

    $(".form-control").removeClass("is-invalid");

    let errorFlag = false;

    const firstName = $("#firstName");
    const lastName = $("#lastName");
    const email = $("#email");
    const phoneNumber = $("#phoneNumber");
    const dob = $("#dob");
    const password = $("#password");
    const confirmPassword = $("#confirmPassword");

    if (
      firstName.val().trim().length < 3 ||
      firstName.val().trim().length > 20
    ) {
      firstName.addClass("is-invalid");

      errorFlag = true;
    }

    if (lastName.val().trim().length < 3 || lastName.val().trim().length > 20) {
      lastName.addClass("is-invalid");

      errorFlag = true;
    }

    if (!emailRegex.test(email.val().trim())) {
      email.addClass("is-invalid");

      errorFlag = true;
    }

    if (!phoneRegex.test(phoneNumber.val().trim())) {
      phoneNumber.addClass("is-invalid");

      errorFlag = true;
    }

    if (dob.val() === "") {
      dob.addClass("is-invalid");

      errorFlag = true;
    }

    if (!passwordRegex.test(password.val().trim())) {
      password.addClass("is-invalid");

      errorFlag = true;
    }

    if (password.val().trim() !== confirmPassword.val().trim()) {
      confirmPassword.addClass("is-invalid");

      errorFlag = true;
    }

    if (errorFlag) {
      return;
    }

    $.ajax({
      url: "../api/register.php",

      type: "POST",

      data: {
        first_name: firstName.val().trim(),

        last_name: lastName.val().trim(),

        email: email.val().trim(),

        phone_number: phoneNumber.val().trim(),

        date_of_birth: dob.val(),

        password: password.val(),

        confirm_password: confirmPassword.val(),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          alert(response.message);

          $("#registerForm")[0].reset();

          window.location.href = "./index.html";
        } else {
          alert(response.message);
        }
      },

      error: function (error) {
        console.log(error);

        alert("Something went wrong");
      },
    });
  });

  $(document).on("submit", "#loginForm", function (e) {
    e.preventDefault();

    $(".form-control").removeClass("is-invalid");

    let errorFlag = false;

    const loginInput = $("#loginInput");
    const loginPassword = $("#loginPassword");
    const rememberMe = $("#rememberMe");

    if (
      !emailRegex.test(loginInput.val().trim()) &&
      !phoneRegex.test(loginInput.val().trim())
    ) {
      loginInput.addClass("is-invalid");

      errorFlag = true;
    }

    if (
      loginPassword.val().trim().length < 8 ||
      loginPassword.val().trim().length > 12
    ) {
      loginPassword.addClass("is-invalid");

      errorFlag = true;
    }

    if (errorFlag) {
      return;
    }

    $.ajax({
      url: "../api/login.php",

      type: "POST",

      data: {
        login_input: loginInput.val().trim(),

        password: loginPassword.val(),

        remember_me: rememberMe.is(":checked"),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          localStorage.setItem("token", response.data.token);

          $("#loginForm")[0].reset();

          if (response.data.role === "admin") {
            window.location.href = "./adminDashboard.html";
          } else {
            window.location.href = "./UserDashboard.html";
          }
        } else {
          alert(response.message);
        }
      },

      error: function (error) {
        console.log(error);

        alert("Invalid Credentials");
      },
    });
  });

  $(document).on("submit", "#forgotPasswordForm", function (e) {
    e.preventDefault();

    $("#forgotInput").removeClass("is-invalid");

    const forgotInput = $("#forgotInput");

    if (
      !emailRegex.test(forgotInput.val().trim()) &&
      !phoneRegex.test(forgotInput.val().trim())
    ) {
      forgotInput.addClass("is-invalid");

      return;
    }

    $.ajax({
      url: "../api/forgotPassword.php",

      type: "POST",

      data: {
        forgot_input: forgotInput.val().trim(),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          localStorage.setItem("temp_token", response.data.temp_token);

          alert(response.message + "\nYour OTP is: " + response.data.otp);

          $("#forgotStep").addClass("d-none");

          $("#otpStep").removeClass("d-none");
        } else {
          alert(response.message);
        }
      },

      error: function (error) {
        console.log(error);

        alert("Something went wrong");
      },
    });
  });

  $(document).on("submit", "#verifyOtpForm", function (e) {
    e.preventDefault();

    $("#otpInput").removeClass("is-invalid");

    const otp = $("#otpInput").val().trim();

    if (otp.length !== 6 || isNaN(otp)) {
      $("#otpInput").addClass("is-invalid");

      return;
    }

    $.ajax({
      url: "../api/verifyOtp.php",

      type: "POST",

      data: {
        otp: otp,

        temp_token: localStorage.getItem("temp_token"),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          alert(response.message);

          $("#otpStep").addClass("d-none");

          $("#resetStep").removeClass("d-none");
        } else {
          if (response.message === "Session expired!") {
            localStorage.removeItem("temp_token");

            $("#forgotInput").val("");

            $("#otpInput").val("");

            $("#newPassword").val("");

            $("#confirmNewPassword").val("");

            $("#otpStep").addClass("d-none");

            $("#resetStep").addClass("d-none");

            $("#forgotStep").removeClass("d-none");

            alert("Session expired! Please send OTP again.");
          } else {
            alert(response.message);
          }
        }
      },

      error: function (error) {
        console.log(error);

        alert("Something went wrong");
      },
    });
  });

  $(document).on("click", "#resendOtpBtn", function (e) {
    e.preventDefault();

    $.ajax({
      url: "../api/resendOtp.php",

      type: "POST",

      data: {
        temp_token: localStorage.getItem("temp_token"),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          $("#otpInput").val("");

          alert(response.message + "\nNew OTP: " + response.data.otp);
        } else {
          if (response.message === "Session expired!") {
            localStorage.removeItem("temp_token");

            $("#forgotInput").val("");

            $("#otpInput").val("");

            $("#newPassword").val("");

            $("#confirmNewPassword").val("");

            $("#otpStep").addClass("d-none");

            $("#resetStep").addClass("d-none");

            $("#forgotStep").removeClass("d-none");

            alert("Session expired! Please send OTP again.");
          } else {
            alert(response.message);
          }
        }
      },

      error: function (error) {
        console.log(error);

        alert("Something went wrong");
      },
    });
  });

  $(document).on("submit", "#resetPasswordForm", function (e) {
    e.preventDefault();

    $("#newPassword").removeClass("is-invalid");

    $("#confirmNewPassword").removeClass("is-invalid");

    const newPassword = $("#newPassword");

    const confirmPassword = $("#confirmNewPassword");

    let errorFlag = false;

    if (!passwordRegex.test(newPassword.val().trim())) {
      newPassword.addClass("is-invalid");

      errorFlag = true;
    }

    if (newPassword.val().trim() !== confirmPassword.val().trim()) {
      confirmPassword.addClass("is-invalid");

      errorFlag = true;
    }

    if (errorFlag) {
      return;
    }

    $.ajax({
      url: "../api/resetPassword.php",

      type: "POST",

      data: {
        password: newPassword.val().trim(),

        temp_token: localStorage.getItem("temp_token"),
      },

      success: function (response) {
        console.log(response);

        if (response.status) {
          alert(response.message);

          $("#resetPasswordForm")[0].reset();

          localStorage.removeItem("temp_token");

          $("#resetStep").addClass("d-none");

          $("#otpStep").addClass("d-none");

          $("#forgotStep").removeClass("d-none");

          const modal = bootstrap.Modal.getInstance(
            document.getElementById("forgotPasswordModal"),
          );

          modal.hide();
        } else {
          if (response.message === "Session expired!") {
            localStorage.removeItem("temp_token");

            $("#forgotInput").val("");

            $("#otpInput").val("");

            $("#newPassword").val("");

            $("#confirmNewPassword").val("");

            $("#resetStep").addClass("d-none");

            $("#otpStep").addClass("d-none");

            $("#forgotStep").removeClass("d-none");

            alert("Session expired! Please send OTP again.");
          } else {
            alert(response.message);
          }
        }
      },

      error: function (error) {
        console.log(error);

        alert("Something went wrong");
      },
    });
  });
});

function getToken() {
  return localStorage.getItem("token");
}
