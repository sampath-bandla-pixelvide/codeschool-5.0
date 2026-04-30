$(document)
  .off("input", ".otp")
  .on("input", ".otp", function () {
    if (this.value.length === 1) {
      $(this).next(".otp").focus();
    }
  });


$(document)
  .off("keydown", ".otp")
  .on("keydown", ".otp", function (e) {
    if (e.key === "Backspace" && this.value === "") {
      $(this).prev(".otp").focus();
    }
  });



$(document)
  .off("click", "#verifyOtpBtn")
  .on("click", "#verifyOtpBtn", function () {

    let otp = "";

    $(".otp").each(function () {
      otp += $(this).val();
    });

    let phone = localStorage.getItem("phone");

    if (!phone || otp.length !== 6) {
      $("#otpMessage").html("<span class='text-danger'>Enter valid OTP</span>");
      return;
    }

    $("#otpMessage").html("<span class='text-muted'>Verifying...</span>");

    $.ajax({
      url: "api/auth/verify-otp.php", 
      method: "POST",
      data: {
        phone: phone,
        otp: otp
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          localStorage.setItem("token", response.data.token);
            // loadPage("dashboard");
                    window.location.href="public/dashboard.html"

        } else {
          $("#otpMessage").html(
            "<span class='text-danger'>" + response.message + "</span>"
          );
        }
      },
      error: function () {
        $("#otpMessage").html("<span class='text-danger'>Request failed</span>");
      }
    });

  });


$(document)
  .off("click", "#changeNumber")
  .on("click", "#changeNumber", function (e) {
    e.preventDefault();
    loadPage("phone");
  });


$(document).ready(function () {
  startOtpTimer();
});

let timerInterval;
let timeLeft = 60;


function startOtpTimer() {
  timeLeft = 60;
  $("#resendOtp").hide();

  updateTimerText();

  timerInterval = setInterval(() => {
    timeLeft--;

    updateTimerText();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      $("#otpTimer").text("Didn't receive code?");
      $("#resendOtp").show();
    }
  }, 1000);
}

// UPDATE UI time
function updateTimerText() {
  $("#otpTimer").text("Resend OTP in " + timeLeft + "s");
}

$(document)
  .off("click", "#resendOtp")
  .on("click", "#resendOtp", function (e) {
    e.preventDefault();
    let phone = localStorage.getItem("phone");
    if (!phone) return;

    $("#otpMessage").html("<span class='text-muted'>Resending OTP...</span>");

    $.ajax({
      url: "api/auth/send-otp.php",
      method: "POST",
      data: { phone: phone },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          console.log("New OTP:", response.data.otp);
          $("#otpMessage").html("<span class='text-success'>OTP resent</span>");

          // restart timer
          clearInterval(timerInterval);
          startOtpTimer();

        } else {
          $("#otpMessage").html(
            "<span class='text-danger'>" + response.message + "</span>"
          );
        }
      },

      error: function () {
        $("#otpMessage").html("<span class='text-danger'>Request failed</span>");
      }
    });
  });