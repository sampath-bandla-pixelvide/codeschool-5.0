$(document).ready(function () {

  let timer;
  let timeLeft = 60;

  function startTimer() {
    clearInterval(timer);
    timeLeft = 60;

    $("#resendOtpBtn").addClass("d-none");

    timer = setInterval(function () {
      $("#otpTimer").text(`OTP expires in ${timeLeft}s`);
      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(timer);
        $("#otpTimer").text("OTP expired");
        $("#resendOtpBtn").removeClass("d-none");
      }
    }, 1000);
  }

  function sendOtp() {

    let phone = $("#phone").val().trim();

    $("#phoneError").text("");
    $("#otpError").text("");

    if (phone === "") {
      $("#phoneError").text("Enter phone");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      $("#phoneError").text("Invalid phone");
      return;
    }

    $("#sendOtpBtn").prop("disabled", true);
    $("#sendOtpText").text("Sending...");
    $("#sendOtpSpinner").removeClass("d-none");

    $.ajax({
      url: "api/send_otp.php",
      method: "POST",
      data: { phone: phone },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          $("#phoneError").text(response.message);
          return;
        }

        $("#otpError").removeClass("text-danger")
        alert(response.message);
        console.log(response.message);


        startTimer();
      },

      complete: function () {
        $("#sendOtpBtn").prop("disabled", false);
        $("#sendOtpText").text("Send OTP");
        $("#sendOtpSpinner").addClass("d-none");
      }
    });
  }

  function verifyOtp() {

    let phone = $("#phone").val().trim();
    let otp = $("#otp").val().trim();

    $("#otpError").text("");

    if (otp === "") {
      $("#otpError").text("Enter OTP");
      return;
    }

    $("#verifyOtpBtn").prop("disabled", true);
    $("#verifyOtpText").text("Verifying...");
    $("#verifyOtpSpinner").removeClass("d-none");

    $.ajax({
      url: "api/verify_otp.php",
      method: "POST",
      data: { phone: phone, otp: otp },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          $("#otpError").text(response.message);
          return;
        }

        localStorage.setItem("token", response.data.token);

        window.location.href = "home.html";
      },

      complete: function () {
        $("#verifyOtpBtn").prop("disabled", false);
        $("#verifyOtpText").text("Verify OTP");
        $("#verifyOtpSpinner").addClass("d-none");
      }
    });
  }

 
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    sendOtp();
  });

  $("#otpForm").submit(function (e) {
    e.preventDefault();
    verifyOtp();
  });

  $("#resendOtpBtn").click(function () {
    sendOtp();
  });

});