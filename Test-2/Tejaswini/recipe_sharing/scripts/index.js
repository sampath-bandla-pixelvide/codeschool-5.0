$(document).ready(function () {
  checkUserToken();
});

function checkUserToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    loadLoginPage();
    return;
  }
  $.ajax({
    url: "./api/auth_apis/validateToken.php",
    method: "GET",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (response) {
      if (!response.status) {
        localStorage.removeItem("token");
        loadLoginPage();
        return;
      }
      window.location.href = "./home.html";
    },
    error: function () {
      localStorage.removeItem("token");
      loadLoginPage();
    },
  });
}

function loadLoginPage() {
  $("#authDiv").load("./templates/login.html", function () {
    attachLoginEvents();
  });
}

function loadRegisterPage() {
  $("#authDiv").load("./templates/signup.html", function () {
    attachRegisterEvents();
  });
}

function loadForgotPasswordPage() {
  $("#authDiv").load("./templates/forgotPassword.html", function () {
    attachForgotPasswordEvents();
  });
}

function attachLoginEvents() {
  $("#registerLink").on("click", function () {
    loadRegisterPage();
  });

  $("#forgotPasswordLink").on("click", function () {
    loadForgotPasswordPage();
  });

  $("#loginBtn").on("click", function () {
    loginUser();
  });

  $("#emailInput").on("input", function () {
    hideError("#emailInputError");
  });

  $("#passwordInput").on("input", function () {
    hideError("#passwordInputError");
  });
}

function attachRegisterEvents() {
  $("#loginLink").on("click", function () {
    loadLoginPage();
  });
  $("#registerEmailInput").on("blur", function () {
    checkUserExists("email");
  });
  $("#registerPhoneInput").on("blur", function () {
    checkUserExists("phone");
  });
  $("#profileImage").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      $("#profileImagePreview").attr("src", event.target.result);
    };
    reader.readAsDataURL(file);
  });
  $("#registerBtn").on("click", function (e) {
    e.preventDefault();
    registerUser();
  });

  $("#firstNameInput").on("input", function () {
    hideError("#firstNameInputError");
  });

  $("#lastNameInput").on("input", function () {
    hideError("#lastNameInputError");
  });

  $("#registerEmailInput").on("input", function () {
    hideError("#registerEmailInputError");
    hideError("#registerEmailExist");
  });

  $("#registerPhoneInput").on("input", function () {
    hideError("#registerPhoneInputError");
    hideError("#registerPhoneExist");
  });

  $("#registerPasswordInput").on("input", function () {
    hideError("#registerPasswordInputError");
  });

  $("#registerConfirmPasswordInput").on("input", function () {
    hideError("#registerConfirmPasswordInputError");
  });
}

function loginUser() {
  const email = $("#emailInput").val().trim();
  const password = $("#passwordInput").val().trim();
  const rememberMe = $("#remember").is(":checked");
  let isValid = true;
  if (!validateEmail(email)) {
    showError("#emailInputError", "Invalid email");
    isValid = false;
  }
  if (password.length < 6) {
    showError("#passwordInputError", "Password must be at least 6 characters");

    isValid = false;
  }

  if (!isValid) return;

  $.ajax({
    url: "./api/auth_apis/login.php",
    method: "POST",
    dataType: "json",

    data: {
      email,
      password,
      rememberMe,
    },

    beforeSend: function () {
      $("#loginBtn").prop("disabled", true).text("Logging in...");
    },

    success: function (response) {
      if (!response.status) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.message,
        });

        return;
      }

      localStorage.setItem("token", response.data.token);
      window.location.replace("./home.html");
    },

    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },

    complete: function () {
      $("#loginBtn").prop("disabled", false).text("Login");
    },
  });
}

function checkUserExists(type) {
  let data = {};
  if (type === "email") {
    const email = $("#registerEmailInput").val().trim();
    if (!validateEmail(email)) return;
    data.emailInput = email;
  } else {
    const phone = $("#registerPhoneInput").val().trim();
    if (!/^\d{10}$/.test(phone)) return;
    data.phoneInput = phone;
  }
  $.ajax({
    url: "./api/auth_apis/isUserExist.php",
    method: "POST",
    dataType: "json",
    data,
    success: function (response) {
      if (!response.status) return;
      if (type === "email") {
        showError("#registerEmailExist", "Email already exists");
      } else {
        showError("#registerPhoneExist", "Phone already exists");
      }
    },
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(selector, message) {
  $(selector).removeClass("d-none").text(message);
}

function hideError(selector) {
  $(selector).addClass("d-none");
}

function registerUser() {
  // console.log("hi")
  const firstName = $("#firstNameInput").val().trim();

  const lastName = $("#lastNameInput").val().trim();

  const email = $("#registerEmailInput").val().trim();

  const phone = $("#registerPhoneInput").val().trim();

  const password = $("#registerPasswordInput").val().trim();

  const confirmPassword = $("#registerConfirmPasswordInput").val();

  const profileImage = $("#profileImage")[0].files[0];

  let isValid = true;

  if (firstName.length < 2) {
    showError("#firstNameInputError", "Invalid first name");

    isValid = false;
  }

  if (lastName.length < 2) {
    showError("#lastNameInputError", "Invalid last name");

    isValid = false;
  }

  if (!validateEmail(email)) {
    showError("#registerEmailInputError", "Invalid email");

    isValid = false;
  }

  if (!/^\d{10}$/.test(phone)) {
    showError("#registerPhoneInputError", "Invalid phone number");

    isValid = false;
  }

  if (password.length < 6) {
    showError(
      "#registerPasswordInputError",
      "Password must be at least 6 characters",
    );

    isValid = false;
  }

  if (password !== confirmPassword) {
    showError("#registerConfirmPasswordInputError", "Passwords do not match");

    isValid = false;
  }

  if (!isValid) return;

  const formData = new FormData();

  formData.append("firstNameInput", firstName);

  formData.append("lastNameInput", lastName);

  formData.append("registerEmailInput", email);

  formData.append("registerPhoneInput", phone);

  formData.append("registerPasswordInput", password);

  formData.append("registerConfirmPasswordInput", confirmPassword);

  if (profileImage) {
    formData.append("profileImage", profileImage);
  }

  $.ajax({
    url: "./api/auth_apis/register.php",

    method: "POST",

    dataType: "json",

    data: formData,

    processData: false,

    contentType: false,

    beforeSend: function () {
      $("#registerBtn").prop("disabled", true).text("Registering...");
    },

    success: function (response) {
      if (!response.status) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: response.message,
        });

        return;
      }
      loadLoginPage();
    },

    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },

    complete: function () {
      $("#registerBtn").prop("disabled", false).text("Register");
    },
  });
}

function attachForgotPasswordEvents() {
  $("#cancleVerifyEmail").on("click", function () {
    loadLoginPage();
  });
  $("#getOTPbtn").on("click", function () {
    getOTP();
  });
  $("#verifyBtn").on("click", function () {
    verifyOTP();
  });
  $("#resendOtp").on("click", function () {
    if (!$(this).hasClass("disabled")) {
      getOTP(true);
    }
  });
  $("#validateEmailInput").on("input", function () {
    hideError("#validateEmailInputError");
  });
  $("#otpInput").on("input", function () {
    hideError("#otpInputFieldError");
  });
  $("#changeEmailBtn").on("click", function () {
    $("#validateEmailInput").prop("disabled", false).focus();

    $("#otpInputField").addClass("d-none");

    $("#changeEmailContainer").addClass("d-none");

    $("#verifyBtn").prop("disabled", true);
  });
}

function getOTP(isResend = false) {
  const email = $("#validateEmailInput").val().trim();
  if (!validateEmail(email)) {
    showError("#validateEmailInputError", "Invalid email");
    return;
  }
  $.ajax({
    url: "./api/auth_apis/getOTP.php",
    method: "POST",
    dataType: "json",
    data: {
      email,
    },
    beforeSend: function () {
      $("#getOTPbtn").prop("disabled", true).text("Sending...");
    },
    success: function (response) {
      if (!response.status) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
        return;
      }
      $("#otpInputField").removeClass("d-none");
      $("#verifyBtn").prop("disabled", false);
      $("#validateEmailInput").prop("disabled", true);
       $("#changeEmailContainer").removeClass("d-none");
      startOtpTimer();
      Swal.fire({
        icon: "success",
        title: isResend ? "OTP Resent" : "OTP Sent",
        text: response.message,
      });
      console.log("OTP:", response.data.otp);
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },
    complete: function () {
      $("#getOTPbtn").prop("disabled", false).text("Get OTP");
    },
  });
}

function verifyOTP() {
  const email = $("#validateEmailInput").val();
  const otp = $("#otpInput").val();
  if (!/^\d{6}$/.test(otp)) {
    showError("#otpInputFieldError", "Invalid OTP");
    return;
  }
  $.ajax({
    url: "./api/auth_apis/verifyOtp.php",
    method: "POST",
    dataType: "json",
    data: {
      email,
      otp,
    },
    beforeSend: function () {
      $("#verifyBtn").prop("disabled", true).text("Verifying...");
    },
    success: function (response) {
      if (!response.status) {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: response.message,
        });

        return;
      }
      localStorage.setItem("token", response.data.token);
      window.location.replace("./home.html");
    },

    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },

    complete: function () {
      $("#verifyBtn").prop("disabled", false).text("Verify");
    },
  });
}

function startOtpTimer() {
  let seconds = 30;
  $("#resendOtp").addClass("disabled");
  const timer = setInterval(function () {
    $("#timerText").text(`Resend OTP in ${seconds}s`);
    seconds--;
    if (seconds < 0) {
      clearInterval(timer);
      $("#timerText").text("");
      $("#resendOtp").removeClass("disabled");
    }
  }, 1000);
}
