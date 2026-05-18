$(document).ready(function () {
  $("#loginForm input").on("input", function () {
    $(this).next(".error").text("");
  });
  $("#loginForm").submit(function (e) {
    e.preventDefault();

    let email = $("#email").val().trim();
    let password = $("#password").val().trim();

    $(".error").text("");

    const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (email === "") {
      $("#email").next(".error").text("Email is required");
      isValid = false;
    } else if (!emailRegx.test(email)) {
      $("#email").next(".error").text("Invalid email format");
      isValid = false;
    }

    if (password === "") {
      $("#password").next(".error").text("Password is required");
      isValid = false;
    } else if (password.length < 6 || password.length > 25) {
      $("#password").next(".error").text("Password must be 6 to 25 characters");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      type: "POST",
      url: "api/index.php",
      data: {
        email: email,
        password: password,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          window.location.href = "dashboard.html";
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Server error", "error");
      },
    });
  });

  //   forgot password
  let forgotEmail = "";
  let timerInterval;

  $("#btnSendOTP").click(function (e) {
    e.preventDefault();

    $("#forgotEmailError").text("");

    forgotEmail = $("#forgotEmail").val().trim();

    const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (forgotEmail === "") {
      $("#forgotEmailError").text("Email is required");
      return;
    }

    if (!emailRegx.test(forgotEmail)) {
      $("#forgotEmailError").text("Invalid email format");
      return;
    }

    $.ajax({
      type: "POST",
      url: "api/forgot_password.php",
      data: {
        email: forgotEmail,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          console.log("OTP IS:", response.data.otp);
          Swal.fire("Success", response.message, "success");

          $("#stepEmail").hide();
          $("#stepOTP").show();

          startOtpTimer(60);
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Server error", "error");
      },
    });
  });

  // forgot modal
  $("#forgotModal").on("hidden.bs.modal", function () {
    clearInterval(timerInterval);

    $("#stepEmail").show();
    $("#stepOTP").hide();

    $("#forgotEmail").val("");
    $("#otp").val("");
    $("#newPassword").val("");
    $("#confirmNewPassword").val("");

    $("#btnResetPassword").prop("disabled", false);
    $("#otpTimer").text("05:00");

    $("#forgotEmailError").text("");
    $("#otpError").text("");
    $("#newPasswordError").text("");
    $("#confirmNewPasswordError").text("");
  });

  // otp timer
  function startOtpTimer(seconds) {
    clearInterval(timerInterval);

    let time = seconds;
    $("#btnResetPassword").prop("disabled", false);
    $("#btnResendOTP").hide();

    timerInterval = setInterval(function () {
      let minutes = Math.floor(time / 60);
      let secs = time % 60;

      $("#otpTimer").text(
        String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0"),
      );

      if (time <= 0) {
        clearInterval(timerInterval);
        $("#otpTimer").text("Expired");
        $("#btnResetPassword").prop("disabled", true);
        $("#btnResendOTP").show();
      }

      time--;
    }, 1000);
  }

  // resend otp
  $("#btnResendOTP").click(function (e) {
    e.preventDefault();

    $.ajax({
      type: "POST",
      url: "api/forgot_password.php",
      data: {
        email: forgotEmail,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          console.log("NEW OTP IS:", response.data.otp);

          Swal.fire("Success", "New OTP sent successfully", "success");

          $("#otp").val("");
          $("#btnResetPassword").prop("disabled", false);
          $("#btnResendOTP").hide();

          startOtpTimer(60);
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
    });
  });

  //   reset password
  $("#btnResetPassword").click(function (e) {
    e.preventDefault();

    $("#otpError").text("");
    $("#newPasswordError").text("");
    $("#confirmNewPasswordError").text("");

    let otp = $("#otp").val().trim();
    let newPassword = $("#newPassword").val().trim();
    let confirmNewPassword = $("#confirmNewPassword").val().trim();

    if (otp === "") {
      $("#otpError").text("OTP is required");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      $("#otpError").text("Enter valid 6 digit OTP");
      return;
    }

    if (newPassword === "") {
      $("#newPasswordError").text("New password is required");
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 25) {
      $("#newPasswordError").text("Password must be 6 to 25 characters");
      return;
    }

    if (confirmNewPassword === "") {
      $("#confirmNewPasswordError").text("Confirm password is required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      $("#confirmNewPasswordError").text("Passwords do not match");
      return;
    }

    $.ajax({
      type: "POST",
      url: "api/reset_password.php",
      data: {
        email: forgotEmail,
        otp: otp,
        password: newPassword,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          Swal.fire("Success", response.message, "success");

          clearInterval(timerInterval);

          setTimeout(() => {
            $("#forgotModal").modal("hide");
            $("#stepOTP").hide();
            $("#stepEmail").show();
          }, 1500);
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Server error", "error");
      },
    });
  });
});
