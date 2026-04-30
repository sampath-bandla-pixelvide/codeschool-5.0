$(document).ready(function () {
  if (localStorage.getItem("token")) {
    window.location.href = "chat.html";
  }

  $("#email").on("keydown", function (e) {
    if (e.key === "Enter") nextStep();
  });
  $("#otpInput").on("keydown", function (e) {
    if (e.key === "Enter") verifyOtp();
  });
});

function nextStep() {
  const email = $("#email").val().trim();

  if (!email) {
    showError("emailError", "Enter an email");
    return;
  }

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    showError("emailError", "Enter a valid email address.");
    return;
  }

  const domain = email.split("@")[1];

  if (!domain || domain.indexOf(".") === -1) {
    showError("emailError", "Invalid email domain.");
    return;
  }

  clearError("emailError");

  $("#nextBtn").prop("disabled", true).text("Sending OTP…");

  $.ajax({
    url: "api/send_otp.php",
    method: "POST",
    dataType: "json",
    data: { email },
    success: function (res) {
      if (res.status) {
        console.log(
          "%cOTP for " + email + ": " + res.data.otp,
          "color: #8ab4f8; font-size: 14px; font-weight: bold;",
        );

        $("#panelTitle").text("Enter OTP");
        $("#panelDesc").text(
          "A 6-digit OTP has been logged to the server console.",
        );

        $("#emailStep").addClass("d-none");
        $("#otpStep").removeClass("d-none");
        $("#otpEmailDisplay").text(email);
        $("#otpInput").val("").focus();
        startResendTimer();
      } else {
        showError("emailError", res.message || "Failed to send OTP.");
      }
    },
    error: function () {
      showError("emailError", "Server error. Please try again.");
    },
    complete: function () {
      $("#nextBtn").prop("disabled", false).text("Next");
    },
  });
}

function verifyOtp() {
  const email = $("#email").val().trim();
  const otp = $("#otpInput").val().trim();

  if (!otp) {
    showError("otpError", "Enter the OTP sent to your email.");
    return;
  }

  clearError("otpError");
  $("#loginBtn").prop("disabled", true).text("Verifying…");

  $.ajax({
    url: "api/verify_otp.php",
    method: "POST",
    dataType: "json",
    data: { email, otp },
    success: function (res) {
      if (!res.status) {
        showError("otpError", res.message || "Invalid OTP. Try again.");
        $("#loginBtn").prop("disabled", false).text("Next");
        return;
      }

      if (res.data.redirect === "register") {
        sessionStorage.setItem("pendingEmail", res.data.email);
        window.location.href = "register.html";
      } else if (res.data.redirect === "chat") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "chat.html";
      }
    },
    error: function () {
      showError("otpError", "Server error. Please try again.");
      $("#loginBtn").prop("disabled", false).text("Next");
    },
  });
}

function backToEmail() {
  $("#otpStep").addClass("d-none");
  $("#emailStep").removeClass("d-none");
  clearError("otpError");
  if (typeof resendTimer !== "undefined") clearInterval(resendTimer);

  $("#panelTitle").text("Sign in");
  $("#panelDesc").text(
    "with your Google Account. This account will be available to other Google apps in the browser.",
  );
  $("#email").focus();
}

function toggleOtp() {
  const input = document.getElementById("otpInput");
  const icon = document.getElementById("otpEyeIcon");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("bi-eye", "bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("bi-eye-slash", "bi-eye");
  }
}

function showError(id, msg) {
  $("#" + id).text(msg);
}
function clearError(id) {
  $("#" + id).text("");
}

let resendTimer;
function startResendTimer() {
  if (typeof resendTimer !== "undefined") clearInterval(resendTimer);
  let timeLeft = 59;
  const resendBtn = $("#resendBtn");

  resendBtn.prop("disabled", true).text(`Resend OTP (${timeLeft}s)`);

  resendTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(resendTimer);
      resendBtn.prop("disabled", false).text("Resend OTP");
    } else {
      resendBtn.text(`Resend OTP (${timeLeft}s)`);
    }
  }, 1000);
}

function resendOtp() {
  const email = $("#email").val().trim();
  if (!email) return;

  const resendBtn = $("#resendBtn");
  resendBtn.prop("disabled", true).text("Sending…");
  clearError("otpError");

  $.ajax({
    url: "api/send_otp.php",
    method: "POST",
    dataType: "json",
    data: { email },
    success: function (res) {
      if (res.status) {
        console.log(
          "%cResent OTP for " + email + ": " + res.data.otp,
          "color: #8ab4f8; font-size: 14px; font-weight: bold;",
        );
        startResendTimer();
        showError("otpError", "OTP resent successfully.");
        $("#otpError").css("color", "#8ab4f8");
        setTimeout(() => {
          $("#otpError").css("color", "");
          clearError("otpError");
        }, 3000);
      } else {
        showError("otpError", res.message || "Failed to resend OTP.");
        resendBtn.prop("disabled", false).text("Resend OTP");
      }
    },
    error: function () {
      showError("otpError", "Server error. Please try again.");
      resendBtn.prop("disabled", false).text("Resend OTP");
    },
  });
}
