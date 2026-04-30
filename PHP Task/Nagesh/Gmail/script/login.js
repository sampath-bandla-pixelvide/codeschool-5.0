$(document).ready(function () {
 
  if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
  }

 
  $("#email").on("keydown", function (e) {
    if (e.key === "Enter") nextStep();
  });


  $("#password").on("keydown", function (e) {
    if (e.key === "Enter") login();
  });
});

function nextStep() {
  const email = $("#email").val().trim();

  if (!email) {
    showError("emailError", "Enter an email or phone number.");
    return;
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) {
    showError("emailError", "Enter a valid email address.");
    return;
  }

  clearError("emailError");
  $("#emailStep").hide();
  $("#passwordStep").removeClass("hidden").show();
  $("#subtitle").text(email);
  $("#password").focus();
}

function backStep() {
  $("#passwordStep").hide();
  $("#emailStep").show();
  clearError("passwordError");
}

function togglePw() {
  const pw = document.getElementById("password");
  pw.type = pw.type === "password" ? "text" : "password";
}

function login() {
  const email    = $("#email").val().trim();
  const password = $("#password").val();

  if (!password) {
    showError("passwordError", "Enter your password.");
    return;
  }

  clearError("passwordError");
  $("#loginBtn").prop("disabled", true).text("Signing in...");

  $.ajax({
    url: "api/login.php",
    method: "POST",
    dataType: "json",
    data: { email, password },
    success: function (res) {
      if (res.status) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "dashboard.html";
      } else {
        showError("passwordError", res.message || "Wrong password.");
        $("#loginBtn").prop("disabled", false).text("Next");
      }
    },
    error: function (xhr) {
      try {
        const err = JSON.parse(xhr.responseText);
        showError("passwordError", err.message || "Server error.");
      } catch (e) {
        showError("passwordError", "Server error. Please try again.");
      }
      $("#loginBtn").prop("disabled", false).text("Next");
    }
  });
}

function goToRegister() {
  window.location.href = "register.html";
}

function showError(id, msg) {
  $("#" + id).text(msg).show();
}

function clearError(id) {
  $("#" + id).text("").hide();
}

function openModal() {
  $("#forgotModal").removeClass("hidden");
}

function closeModal() {
  $("#forgotModal").addClass("hidden");
}

function sendOtp() {
  const email = $("#fpEmail").val().trim();

  $.post("api/send_otp.php", { email }, function(res) {
    if (res.status) {
      $("#fpEmailStep").hide();
      $("#fpOtpStep").show();
      $("#fpMsg").text("OTP sent to email");
    } else {
      $("#fpMsg").text(res.message);
    }
  }, "json");
}

function sendOtp() {
  const email = $("#fpEmail").val().trim();

  if (!email) {
    $("#fpMsg").text("Enter email");
    return;
  }

  $.post("api/send_otp.php", { email }, function(res) {
    console.log("SEND OTP:", res);

    if (res.status) {
      $("#fpEmailStep").hide();
      $("#fpOtpStep").removeClass("hidden").show();
      $("#fpMsg").text("OTP sent successfully");

      console.log("OTP:", res.data?.otp);
    } else {
      $("#fpMsg").text(res.message);
    }
  }, "json");
}

function verifyOtp() {
  const email = $("#fpEmail").val().trim();
  const otp   = $("#fpOtp").val().trim();

  if (!otp) {
    $("#fpMsg").text("Enter OTP");
    return;
  }

  $.ajax({
    url: "api/verify_otp.php",
    method: "POST",
    data: {
      email: email,
      otp: otp  
    },
    dataType: "json",
    success: function(res) {
      console.log("VERIFY:", res);

      if (res.status) {
        $("#fpOtpStep").hide();
        $("#fpResetStep").removeClass("hidden").show();
        $("#fpMsg").text("OTP verified");
      } else {
        $("#fpMsg").text(res.message);
      }
    },
    error: function(xhr) {
      console.log("ERROR:", xhr.responseText);
      $("#fpMsg").text("Server error");
    }
  });
}

function resetPassword() {
  const email    = $("#fpEmail").val().trim();
  const otp      = $("#fpOtp").val().trim();   
  const password = $("#newPassword").val();

  if (!password) {
    $("#fpMsg").text("Enter new password");
    return;
  }

  $.post("api/resetpassword.php", { email, otp, password }, function(res) {
    console.log("RESET:", res);

    if (res.status) {
      alert("Password updated successfully");

      closeModal();

      // Reset modal UI
      $("#fpResetStep").hide();
      $("#fpOtpStep").hide();
      $("#fpEmailStep").show();

      window.location.href = "login.html";
    } else {
      $("#fpMsg").text(res.message);
    }
  }, "json");


}













