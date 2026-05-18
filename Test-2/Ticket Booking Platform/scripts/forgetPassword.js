$(document).ready(() => {
  let interval;
  function goStep(step) {
    const panels = { 1: "#panelEmail", 2: "#panelOtp", 3: "#panelPassword" };
    Object.values(panels).forEach((p) => $(p).addClass("d-none"));
    $(panels[step]).removeClass("d-none");
  }
  $("#verifyEmail").submit((e) => {
    e.preventDefault();
    const email = $("#floatingInput").val().trim();
    if (!email) {
      $("#emailErr").text("Email is required.");
      return;
    }
    $("#emailErr").text("");
    const $btn = $("#verifyEmail button[type=submit]");
    $btn
      .prop("disabled", true)
      .html('<i class="bi bi-hourglass-split"></i> Sending…');
    $.ajax({
      type: "POST",
      url: "./api/generateOtp.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-send"></i> Send OTP');
        if (response.status) {
          $("#email").val(email);
          $("#eemail").val(email);
          $("#otpSubtitle").text("OTP sent to " + email);
          $("#otp").text("");
          goStep(2);
          startOtpTimer();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
            confirmButtonColor: "#e94560",
          });
        }
      },
      error: function () {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-send"></i> Send OTP');
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Could not reach server. Please try again.",
          confirmButtonColor: "#e94560",
        });
      },
    });
  });
  function startOtpTimer() {
    let time = 120;
    $("#resendOtp").prop("disabled", true);
    clearInterval(interval);
    interval = setInterval(() => {
      if (time <= 0) {
        $("#otp").text("OTP expired — click Resend OTP to get a new one.");
        $("#resendOtp").prop("disabled", false);
        clearInterval(interval);
        return;
      }
      $("#otp").text(`OTP expires in ${time}s`);
      time--;
    }, 1000);
  }
  $("#verifyOtp").submit((e) => {
    e.preventDefault();
    const email = $("#email").val();
    const otp = $("#otpp").val().trim();
    if (!otp) {
      $("#otp").text("Please enter the OTP.");
      return;
    }
    const $btn = $("#verifyOtp button[type=submit]");
    $btn
      .prop("disabled", true)
      .html('<i class="bi bi-hourglass-split"></i> Verifying…');
    $.ajax({
      type: "POST",
      url: "./api/verifyOtp.php",
      data: { otp, email },
      dataType: "json",
      success: function (response) {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-check2-circle"></i> Verify OTP');
        if (response.status) {
          clearInterval(interval);
          goStep(3);
        } else {
          Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text: response.message,
            confirmButtonColor: "#e94560",
          });
        }
      },
      error: function () {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-check2-circle"></i> Verify OTP');
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Could not reach server. Please try again.",
          confirmButtonColor: "#e94560",
        });
      },
    });
  });
  $("#resendOtp").on("click", () => {
    const email = $("#email").val();
    $("#otp").text("");
    $("#resendOtp").prop("disabled", true);
    $.ajax({
      type: "POST",
      url: "./api/generateOtp.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          startOtpTimer();
          Swal.fire({
            icon: "success",
            title: "OTP Resent",
            text: "A new OTP has been sent to your email.",
            confirmButtonColor: "#e94560",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
            confirmButtonColor: "#e94560",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Could not reach server.",
          confirmButtonColor: "#e94560",
        });
      },
    });
  });
  $("#setPassword").submit((e) => {
    e.preventDefault();
    const email = $("#eemail").val();
    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();
    if (!password || !confirmPassword) {
      $("#pwdErr").text("Both password fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      $("#pwdErr").text("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      $("#pwdErr").text("Password must be at least 8 characters.");
      return;
    }
    $("#pwdErr").text("");
    const $btn = $("#setPassword button[type=submit]");
    $btn
      .prop("disabled", true)
      .html('<i class="bi bi-hourglass-split"></i> Saving…');
    $.ajax({
      type: "POST",
      url: "./api/updatedPassword.php",
      data: { email, password, confirmPassword },
      dataType: "json",
      success: function (response) {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-shield-lock"></i> Set New Password');
        if (response.status) {
          Swal.fire({
            icon: "success",
            title: "Password Reset!",
            text: "Your password has been updated. Please login.",
            confirmButtonColor: "#e94560",
          }).then(() => {
            window.location.replace("./index.html");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: response.message,
            confirmButtonColor: "#e94560",
          });
        }
      },
      error: function () {
        $btn
          .prop("disabled", false)
          .html('<i class="bi bi-shield-lock"></i> Set New Password');
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Could not reach server.",
          confirmButtonColor: "#e94560",
        });
      },
    });
  });

  function syncStepUI(step) {
    ["dot1", "dot2", "dot3"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = "step-dot";
      if (i + 1 < step) el.classList.add("done");
      else if (i + 1 === step) el.classList.add("active");
    });
    ["heroStep1", "heroStep2", "heroStep3"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = "rst-num" + (i + 1 === step ? " active" : "");
    });
  }
  const observer = new MutationObserver(() => {
    const p1 = !document
      .getElementById("panelEmail")
      ?.classList.contains("d-none");
    const p2 = !document
      .getElementById("panelOtp")
      ?.classList.contains("d-none");
    const p3 = !document
      .getElementById("panelPassword")
      ?.classList.contains("d-none");
    if (p3) syncStepUI(3);
    else if (p2) syncStepUI(2);
    else syncStepUI(1);
  });
  ["panelEmail", "panelOtp", "panelPassword"].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });
});
