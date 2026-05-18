$(function () {
  var token = localStorage.getItem("food_token");
  if (token) {
    $.ajax({
      url: "api/get_current_user.php",
      headers: { Authorization: token },
      dataType: "json",
      success: function (d) {
        if (d.status && d.data && d.data.user) {
          window.location.href =
            d.data.user.role === "admin" ? "admin.html" : "dashboard.html";
        } else {
          localStorage.removeItem("food_token");
        }
      },
    });
  }

  $("#show-forgot-link").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#login-section").hide();
    $("#otp-login-section").hide();
    $("#forgot-section").show();
    $("#forgot-step-1").show();
    $("#forgot-step-2").hide();
  });

  $("#back-to-login-link").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#forgot-section").hide();
    $("#login-section").show();
  });

  $("#show-otp-login-link").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#login-section").hide();
    $("#forgot-section").hide();
    $("#otp-login-section").show();
    $("#otp-login-step-1").show();
    $("#otp-login-step-2").hide();
  });

  $("#back-from-otp-login").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#otp-login-section").hide();
    $("#login-section").show();
  });

  $("#back-to-otp-step1").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#otp-login-step-2").hide();
    $("#otp-login-step-1").show();
  });

  $(".tab-btn").on("click", function () {
    var tab = $(this).data("tab");
    $(".tab-btn").removeClass("active");
    $(".form-panel").removeClass("active");
    $(this).addClass("active");
    $("#panel-" + tab).addClass("active");
    $("#login-section").show();
    $("#forgot-section").hide();
    $("#otp-login-section").hide();
    clearAlerts();
  });

  $(".eye-toggle").on("click", function () {
    var inputId = $(this).data("input");
    var input = $("#" + inputId);
    if (input.attr("type") === "password") {
      input.attr("type", "text");
      $(this).removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      input.attr("type", "password");
      $(this).removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  $("#otp-login-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var email = $("#otp-login-email").val().trim();
    if (!isValidEmail(email)) {
      fieldError("otp-login-email", true);
      return;
    }

    var btn = $("#send-login-otp-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Sending...');

    $.ajax({
      url: "api/send_login_otp.php",
      method: "POST",
      data: { email: email },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          console.log(
            "%c[FoodExpress DEV]",
            "color:#ff6b2b;font-weight:bold;",
            "Login OTP:",
            data.data.dev_otp,
          );
          showAlert(
            "otp-login-alert",
            "success",
            "OTP sent! Please check your email.",
          );
          $("#otp-login-step-1").hide();
          $("#otp-login-step-2").show();
        } else {
          showAlert("otp-login-alert", "error", data.message);
        }
      },
      error: function () {
        showAlert(
          "otp-login-alert",
          "error",
          "Server error. Please try again.",
        );
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-paper-plane"></i> Send OTP');
      },
    });
  });

  $("#otp-login-verify-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var email = $("#otp-login-email").val().trim();
    var otp = $("#otp-login-code").val().trim();
    if (otp.length !== 6) {
      fieldError("otp-login-code", true);
      return;
    }

    var btn = $("#verify-otp-login-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Verifying...');

    $.ajax({
      url: "api/login_with_otp.php",
      method: "POST",
      data: { email: email, otp: otp },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          localStorage.setItem("food_token", data.data.token);
          window.location.href =
            data.data.user.role === "admin" ? "admin.html" : "dashboard.html";
        } else {
          showAlert("otp-login-alert", "error", data.message);
          btn
            .prop("disabled", false)
            .html('<i class="fa-solid fa-circle-check"></i> Verify &amp; Login');
        }
      },
      error: function () {
        showAlert(
          "otp-login-alert",
          "error",
          "Server error. Please try again.",
        );
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-circle-check"></i> Verify & Login');
      },
    });
  });

  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var email = $("#login-email").val().trim();
    var password = $("#login-password").val();
    var valid = true;

    if (!isValidEmail(email)) {
      fieldError("login-email", true);
      valid = false;
    }
    if (password.length === 0) {
      fieldError("login-password", true);
      valid = false;
    }
    if (!valid) return;

    var btn = $("#login-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Logging in...');

    $.ajax({
      url: "api/login.php",
      method: "POST",
      data: { email: email, password: password },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          localStorage.setItem("food_token", data.data.token);
          window.location.href =
            data.data.user.role === "admin" ? "admin.html" : "dashboard.html";
        } else {
          showAlert("login-alert", "error", data.message);
          btn
            .prop("disabled", false)
            .html('<i class="fa-solid fa-right-to-bracket"></i> Login');
        }
      },
      error: function () {
        showAlert("login-alert", "error", "Server error. Please try again.");
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-right-to-bracket"></i> Login');
      },
    });
  });

  $("#register-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var name = $("#reg-name").val().trim();
    var email = $("#reg-email").val().trim();
    var mobile = $("#reg-mobile").val().trim();
    var password = $("#reg-password").val();
    var valid = true;

    if (name.length < 2) {
      fieldError("reg-name", true);
      valid = false;
    }
    if (!isValidEmail(email)) {
      fieldError("reg-email", true);
      valid = false;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      fieldError("reg-mobile", true);
      valid = false;
    }
    if (password.length < 6) {
      fieldError("reg-password", true);
      valid = false;
    }
    if (!valid) return;

    var btn = $("#send-otp-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Sending OTPs...');

    $.ajax({
      url: "api/send_registration_otp.php",
      method: "POST",
      data: { name: name, email: email, mobile: mobile, password: password },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          console.log(
            "%c[FoodExpress DEV]",
            "color:#ff6b2b;font-weight:bold;",
            "Email OTP:",
            data.data.dev_email_otp,
          );
          console.log(
            "%c[FoodExpress DEV]",
            "color:#ff6b2b;font-weight:bold;",
            "Mobile OTP:",
            data.data.dev_mobile_otp,
          );
          showAlert(
            "register-alert",
            "success",
            "OTPs sent successfully!",
          );
          $("#reg-step-1").hide();
          $("#reg-step-2").show();
        } else {
          showAlert("register-alert", "error", data.message);
        }
      },
      error: function () {
        showAlert("register-alert", "error", "Server error. Please try again.");
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-paper-plane"></i> Send OTP');
      },
    });
  });

  $("#verify-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var name = $("#reg-name").val().trim();
    var email = $("#reg-email").val().trim();
    var mobile = $("#reg-mobile").val().trim();
    var password = $("#reg-password").val();
    var emailOtp = $("#email-otp").val().trim();
    var mobileOtp = $("#mobile-otp").val().trim();
    var valid = true;

    if (emailOtp.length !== 6) {
      fieldError("email-otp", true);
      valid = false;
    }
    if (mobileOtp.length !== 6) {
      fieldError("mobile-otp", true);
      valid = false;
    }
    if (!valid) return;

    var btn = $("#verify-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Verifying...');

    $.ajax({
      url: "api/verify_and_register.php",
      method: "POST",
      data: {
        name: name,
        email: email,
        mobile: mobile,
        password: password,
        email_otp: emailOtp,
        mobile_otp: mobileOtp,
      },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          showAlert("register-alert", "success", data.message);
          $("#register-form")[0].reset();
          $("#verify-form")[0].reset();
          setTimeout(function () {
            $("#reg-step-2").hide();
            $("#reg-step-1").show();
            $('.tab-btn[data-tab="login"]').trigger("click");
          }, 1500);
        } else {
          showAlert("register-alert", "error", data.message);
        }
      },
      error: function () {
        showAlert("register-alert", "error", "Server error. Please try again.");
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html(
            '<i class="fa-solid fa-circle-check"></i> Verify & Create Account',
          );
      },
    });
  });

  $("#back-to-step1-btn").on("click", function () {
    clearAlerts();
    $("#reg-step-2").hide();
    $("#reg-step-1").show();
  });

  $("#forgot-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var email = $("#forgot-email").val().trim();
    if (!isValidEmail(email)) {
      fieldError("forgot-email", true);
      return;
    }

    var btn = $("#forgot-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Sending...');

    $.ajax({
      url: "api/forgot_password.php",
      method: "POST",
      data: { email: email },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          console.log(
            "%c[FoodExpress DEV]",
            "color:#ff6b2b;font-weight:bold;",
            "Reset OTP:",
            data.data.dev_otp,
          );
          showAlert(
            "forgot-alert",
            "success",
            "OTP sent! Please check your email.",
          );
          $("#forgot-step-1").hide();
          $("#forgot-step-2").show();
        } else {
          showAlert("forgot-alert", "error", data.message);
        }
      },
      error: function () {
        showAlert("forgot-alert", "error", "Server error. Please try again.");
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-paper-plane"></i> Send OTP');
      },
    });
  });

  $("#reset-form").on("submit", function (e) {
    e.preventDefault();
    clearAlerts();

    var email = $("#forgot-email").val().trim();
    var otp = $("#reset-otp").val().trim();
    var newPassword = $("#reset-password").val();
    var valid = true;

    if (otp.length !== 6) {
      fieldError("reset-otp", true);
      valid = false;
    }
    if (newPassword.length < 6) {
      fieldError("reset-password", true);
      valid = false;
    }
    if (!valid) return;

    var btn = $("#reset-btn");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin"></i> Resetting...');

    $.ajax({
      url: "api/reset_password.php",
      method: "POST",
      data: { email: email, otp: otp, new_password: newPassword },
      dataType: "json",
      success: function (data) {
        if (data.status) {
          showAlert("forgot-alert", "success", data.message);
          $("#reset-form")[0].reset();
          $("#forgot-form")[0].reset();
          setTimeout(function () {
            $("#forgot-step-2").hide();
            $("#forgot-step-1").show();
            $("#forgot-section").hide();
            $("#login-section").show();
          }, 1500);
        } else {
          showAlert("forgot-alert", "error", data.message);
        }
      },
      error: function () {
        showAlert("forgot-alert", "error", "Server error. Please try again.");
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-key"></i> Reset Password');
      },
    });
  });

  $("#back-to-forgot-step1").on("click", function (e) {
    e.preventDefault();
    clearAlerts();
    $("#forgot-step-2").hide();
    $("#forgot-step-1").show();
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function fieldError(id, show) {
    var errEl = $("#err-" + id);
    var inpEl = $("#" + id);
    show ? errEl.addClass("show") : errEl.removeClass("show");
    inpEl
      .toggleClass("error", show)
      .toggleClass("success", !show && inpEl.val() !== "");
  }

  function showAlert(id, type, message) {
    Swal.fire({
      icon: type === 'success' ? 'success' : 'error',
      title: type === 'success' ? 'Success!' : 'Oops...',
      text: message,
      confirmButtonColor: '#ff5722'
    });
  }

  function clearAlerts() {
    $(".alert").removeClass("show");
    $(".field-error").removeClass("show");
    $("input").removeClass("error success");
  }
});
