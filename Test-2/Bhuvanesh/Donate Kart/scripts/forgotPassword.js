$("#cancelVerifyEmail").on("click",function(){
    window.location.replace("./index.html")
})
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
$("#getOTPBtn").on("click",function(){
     $("#emailError").addClass("d-none");
    console.log("clicked")
    const emailRegex = /^[a-zA-Z]+[a-zA-Z0-9+#$.]+@[a-zA-Z]{3,}\.[a-zA-Z]{2,}/;
    let email = $("#email").val()
     if (email === "" || !emailRegex.test(email)) {
        $("#emailError").removeClass("d-none");
     }
     
     $.ajax({
        type: "POST",
        url: "./api/php-scripts/verifyEmail.php",
        dataType:"json",
        data: {
            email
        },
        success: function (res) {
            if(!res.status){
                Swal.fire("Warning", "No user exist with this email!!", "warning");
          return;
            }
            else{
                console.log(res.data.otp);
                $("#otpInputField").removeClass("d-none");
                $("#email").prop("disabled",true);
                $("#otpInputField").removeClass("d-none");
                localStorage.setItem("temp_token", res.data.temp_token);
                startTimer();
            }
        }
     });
})
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
      url: "../api/php-scripts/verifyOtp.php",
      data: { token: temp_token, otp: userOtp },
      dataType: "json",
      success: function (res) {
        if (!res.status) {
          Swal.fire("Warning",res.message, "warning");
          return;
        }
        else{
        $("#otpInput").prop("disabled", true);
        $("#resendOtpContainer").addClass("d-none");
        $("#verifyBtn").addClass("d-none");
        $("#passwordResetContainer").removeClass("d-none");
        }
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
      url: "../api/php-scripts/resendOtp.php",
      data: { temp_token: localStorage.getItem("temp_token") },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          startTimer();
          console.log("New Otp - " + res.data.otp);
        } else {
          Swal.fire(
            "Warning",
            res.message,
            "warning",
          ).then(() => {
           window.location.href = "./index.html"
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
$(document).on("click", "#resetPasswordBtn", function () {
    const newPassword = $("#newPasswordInput").val();
    const confirmPassword = $("#confirmPasswordInput").val();
    console.log(newPassword, confirmPassword);
    let errorFlag = false;
    if (newPassword.length < 6) {
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
      url: "./api/php-scripts/resetPassword.php",
      data: {
        token: localStorage.getItem("temp_token"),
        password: newPassword,
        confirmPassword: confirmPassword,
      },
      dataType: "json",
      success: function (res) {
        console.log(res);
        if (!res.status) {
          Swal.fire("Error", res.message, "error");
          return;
        }else{
        Swal.fire("Success", res.message, "success").then(
          () => {
            localStorage.removeItem("temp_token");
            $("#cancelVerifyEmail").click();
          });
        }
      },
      error: function (err) {
        console.error(err);
      },
    });
});