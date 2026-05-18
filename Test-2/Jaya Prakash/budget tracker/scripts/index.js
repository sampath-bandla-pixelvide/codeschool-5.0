const emailRegex = /^[a-zA-Z]+[a-zA-Z0-9+#$.]+@[a-zA-Z]{3,}\.[a-zA-Z]{2,}/;
const phoneRegex = /^[6-9][0-9]{9}$/;

const token = localStorage.getItem("userToken");

function resetAnimations(element) {
  $(element).removeClass("top-center center-down left-center center-right");
}

function loginFormValidations(email, password) {
  return (
    emailRegex.test(email.val()) &&
    password.val().length >= 8 &&
    password.val().length <= 20
  );
}

function clearRegisterErrors() {
  $("#firstNameInputError").addClass("d-none");
  $("#lastNameInputError").addClass("d-none");
  $("#registerEmailInputError").addClass("d-none");
  $("#registerPhoneInputError").addClass("d-none");
  $("#registerPasswordInputError").addClass("d-none");
  $("#registerConfirmPasswordInputError").addClass("d-none");
  $("#firstNameInput").removeClass("is-invalid");
  $("#lastNameInput").removeClass("is-invalid");
  $("#registerEmailInput").removeClass("is-invalid");
  $("#registerPhoneInput").removeClass("is-invalid");
  $("#registerPasswordInput").removeClass("is-invalid");
  $("#registerConfirmPasswordInput").removeClass("is-invalid");
}

function clearLoginErrors() {
  $("#emailInputError, #passwordInputError").addClass("d-none");
  $("#emailInput, #passwordInput").removeClass("is-invalid");
}

let countdown = null;
function startTimer(duration = 30) {
  const timerEl = $("#timerText");
  const resendBtn = $("#resendOtp");
  let time = duration;
  clearInterval(countdown);
  resendBtn.addClass("disabled");
  timerEl.text(`Resend available in ${time}s`);
  countdown = setInterval(() => {
    time--;
    timerEl.text(`Resend available in ${time}s`);
    if (time <= 0) {
      clearInterval(countdown);
      resendBtn.removeClass("disabled");
    }
  }, 1000);
}

if (token) {
  window.location.replace("./home.html");
}

$(document).ready(function () {
  $("#authDiv").load("./templates/login.html");

  $(document).on("click", "#loginLink", function () {
    resetAnimations("#registerContainer");
    $("#registerContainer").addClass("center-right");
    setTimeout(() => {
      $("#authDiv").load("./templates/login.html", function () {
        $("#loginContainer").addClass("left-center");
      });
    }, 150);
  });

  $(document).on("click", "#registerLink", function () {
    resetAnimations("#loginContainer");
    $("#loginContainer").addClass("center-right");
    setTimeout(() => {
      $("#authDiv").load("./templates/signup.html", function () {
        $("#registerContainer").addClass("left-center");
      });
    }, 150);
  });

  $(document).on("click", "#forgotPasswordLink", function () {
    resetAnimations("#loginContainer");
    $("#loginContainer").addClass("center-down");
    setTimeout(() => {
      $("#authDiv").load("./templates/forgotPassword.html", function () {
        $("#verifyEmail").addClass("top-center");
      });
    }, 150);
  });

  $(document).on("click", "#cancleVerifyEmail", function () {
    resetAnimations("#verifyEmail");
    $("#verifyEmail").addClass("center-down");
    setTimeout(() => {
      $("#authDiv").load("./templates/login.html", function () {
        $("#loginContainer").addClass("top-center");
      });
    }, 150);
  });

  $(document).on("click", "#loginBtn", function () {
    const userEmail = $("#emailInput");
    const userPassword = $("#passwordInput");
    const userEmailVal = userEmail.val();
    const userPasswordVal = userPassword.val();
    const rememberMe = $("#remember").is(":checked");
    let errorFlag = false;

    if (!emailRegex.test(userEmailVal)) {
      $("#emailInputError").removeClass("d-none");
      userEmail.addClass("is-invalid");
      errorFlag = true;
    }

    if (userPasswordVal.length < 6 || userPasswordVal.length > 25) {
      $("#passwordInputError").removeClass("d-none");
      userPassword.addClass("is-invalid");
      errorFlag = true;
    }

    if (errorFlag) {
      return;
    }
    $.ajax({
      url: "../api/login.php",
      method: "POST",
      dataType: "json",
      data: {
        email: userEmailVal,
        password: userPasswordVal,
        rememberMe,
      },
      success: function (response) {
        if (response.status) {
          console.log(response);
          localStorage.setItem("userToken", response.data.token);

          window.location.replace("../home.html");
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
      error: function (error) {
        console.error(error);
      },
    });
  });

  $(document).on("submit", "#registerForm", function (e) {
    e.preventDefault();
    const firstName = $("#firstNameInput");
    const lastName = $("#lastNameInput");
    const email = $("#registerEmailInput");
    const number = $("#registerPhoneInput");
    const password = $("#registerPasswordInput");
    const conformPassword = $("#registerConfirmPasswordInput");

    let errorFlag = false;

    if (firstName.val().length < 4 || firstName.val().length > 30) {
      $("#firstNameInputError").removeClass("d-none");
      firstName.addClass("is-invalid");
      errorFlag = true;
    }

    if (lastName.val().length < 4 || lastName.val().length > 30) {
      $("#lastNameInputError").removeClass("d-none");
      lastName.addClass("is-invalid");
      errorFlag = true;
    }

    if (!emailRegex.test(email.val())) {
      $("#registerEmailInputError").removeClass("d-none");
      email.addClass("is-invalid");
      errorFlag = true;
    }

    if (!phoneRegex.test(number.val())) {
      $("#registerPhoneInputError").removeClass("d-none");
      number.addClass("is-invalid");
      errorFlag = true;
    }

    if (password.val().length < 8 || password.val().length > 25) {
      $("#registerPasswordInputError").removeClass("d-none");
      password.addClass("is-invalid");
      errorFlag = true;
    }

    if (password.val() !== conformPassword.val()) {
      $("#registerConfirmPasswordInputError").removeClass("d-none");
      conformPassword.addClass("is-invalid");
      errorFlag = true;
    }

    if (errorFlag) {
      return;
    }

    const formData = new FormData(document.getElementById("registerForm"));

    $.ajax({
      type: "POST",
      url: "../api/register.php",
      dataType: "json",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        console.log(response);
        console.log(response.status);
        if (!response.status) {
          if (response.errors && Object.entries(response.errors).length > 0) {
            const errors = response.errors;
            console.log("errors" + errors);
            Object.entries(errors).forEach(([key, value]) => {
              $(`#${key}Error`).text(value);
            });
            return;
          }
          Swal.fire("Error", response.message, "error");
          return;
        }
        Swal.fire("Success", "Successfully Registerd!!", "success").then(() => {
          $("#authDiv").load("./templates/login.html");
        });
      },
      error: function (error) {
        console.log(error);
      },
    });
  });

  $(document).on(
    "click",
    "#uploadImageIcon, #profileImagePreview",
    function () {
      $("#profileImage").click();
    },
  );

  $(document).on("change", "#profileImage", function () {
    const uploadedImg = $("#profileImage")[0].files[0];
    if (!uploadedImg) {
      return;
    }
    $("#profileImagePreview").attr("src", URL.createObjectURL(uploadedImg));
  });

  let emailValidationTimer;
  $(document).on("input", "#registerEmailInput", function () {
    clearTimeout(emailValidationTimer);
    emailValidationTimer = setTimeout(() => {
      const emailInput = $("#registerEmailInput").val().trim();
      if (!emailRegex.test(emailInput)) {
        $("#registerEmailExist").addClass("d-none").text("");
        return;
      }
      $.ajax({
        type: "POST",
        url: "../api/isUserExist.php",
        data: {
          emailInput,
        },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#registerEmailExist")
              .removeClass("d-none")
              .text("An User with this email already exists!!");
          } else {
            $("#registerEmailExist").addClass("d-none").text("");
          }
        },
      });
    }, 800);
  });

  let phoneValidationTimer;
  $(document).on("input", "#registerPhoneInput", function () {
    clearTimeout(phoneValidationTimer);
    phoneValidationTimer = setTimeout(() => {
      const phoneInput = $("#registerPhoneInput").val().trim();
      if (!phoneRegex.test(phoneInput)) {
        $("#registerPhoneExist").addClass("d-none").text("");
        return;
      }
      $.ajax({
        type: "POST",
        url: "../api/isUserExist.php",
        data: {
          phoneInput,
        },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#registerPhoneExist")
              .removeClass("d-none")
              .text("An User with this phone number already exists!!");
          } else {
            $("#registerPhoneExist").addClass("d-none").text("");
          }
        },
      });
    }, 800);
  });

  $(document).on("input", "#emailInput , #passwordInput", function () {
    clearLoginErrors();
  });

  $(document).on("input", "#registerForm", function () {
    clearRegisterErrors();
  });

  $(document).on("click", "#getOTPbtn", function () {
    const email = $("#validateEmailInput").val();
    const emailError = $("#validateEmailInputError");
    if (!emailRegex.test(email)) {
      emailError.removeClass("d-none");
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/getOTP.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire("Warning", "No user exist with this email!!", "warning");
          return;
        }
        $("#validateEmailInput").prop("disabled", true);
        $("#otpInputField").removeClass("d-none");
        $("#getOTPbtn").addClass("disabled");
        localStorage.setItem("temp_token", response.data.temp_token);
        console.log(response.data.otp);
        startTimer();
      },
    });
  });

  $(document).on("click", "#resendOtp", function () {
    const resendBtn = $(this);
    if (resendBtn.hasClass("disabled")) {
      return;
    }
    resendBtn.addClass("disabled");
    $.ajax({
      type: "POST",
      url: "../api/resendOtp.php",
      data: { temp_token: localStorage.getItem("temp_token") },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          startTimer();
          console.log("New Otp - " + response.data.otp);
        } else {
          Swal.fire(
            "Warning",
            response.message + " " + response.data,
            "warning",
          ).then(() => {
            $("#loginOptionsContainer").load("./templates/qrlogin.html");
          });
        }
      },
      error: function (err) {
        console.error(err);
        resendBtn.removeClass("disabled");
        Swal.fire(
          "Error",
          "Something went wrong. Please try again later...",
          "error",
        );
      },
    });
  });

  $(document).on("input", "#otpInput", function () {
    const otp = $("#otpInput").val();
    if (otp.length != 6) {
      $("#verifyBtn").prop("disabled", true);
      return;
    }
    $("#verifyBtn").prop("disabled", false);
  });

  $(document).on("click", "#verifyBtn", function () {
    const temp_token = localStorage.getItem("temp_token");
    const userOtp = $("#otpInput").val();

    $.ajax({
      type: "POST",
      url: "../api/verifyOtp.php",
      data: { token: temp_token, otp: userOtp },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire("Warning", "Invalid OTP, Try again!!", "warning");
          return;
        }
        $("#otpInput").prop("disabled", true);
        $("#resendOtpContainer").addClass("d-none");
        $("#verifyBtn").addClass("d-none");
        $("#passwordResetContainer").removeClass("d-none");
      },
    });
  });

  $(document).on("click", "#resetPasswordBtn", function () {
    const newPassword = $("#newPasswordInput").val().trim();
    const confirmPassword = $("#confirmPasswordInput").val().trim();
    console.log(newPassword, confirmPassword);
    let errorFlag = false;
    if (newPassword.length < 6 || newPassword > 25) {
      $("#newPasswordInputError").removeClass("d-none");
      errorFlag = true;
    }
    if (newPassword != confirmPassword) {
      $("#confirmPasswordInputError").removeClass("d-none");
      errorFlag = true;
    }
    if (errorFlag) {
      return;
    }

    $.ajax({
      type: "POST",
      url: "../api/resetPassword.php",
      data: {
        token: localStorage.getItem("temp_token"),
        password: newPassword,
        confirmPassword: confirmPassword,
      },
      dataType: "json",
      success: function (response) {
        console.log(response);
        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }
        Swal.fire("Success", "Password reset successful!", "success").then(
          () => {
            localStorage.removeItem("temp_token");
            $("#cancleVerifyEmail").click();
          },
        );
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
});
