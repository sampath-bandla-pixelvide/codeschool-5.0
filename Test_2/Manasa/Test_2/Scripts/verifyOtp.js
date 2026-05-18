$(document).ready(function () {

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  $("#emailText").text("OTP sent to: " + email);

 
  $("#otpForm").on("submit", function (e) {
    e.preventDefault();

    let otp = $("#otp").val().trim();
    $("#otpError").text("");

    if (otp === "") {
      $("#otpError").text("OTP is required");
      return;
    }

    $.ajax({
      url: "api/verifyOtp.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        email: email,
        otp: otp,
      }),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        if (res.status === "success") {
      
          localStorage.setItem("token", res.token);

          window.location.href = "Dashboard.html";
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },

      error: function () {
        Swal.fire("Error", "Something went wrong", "error");
      },
    });
  });

 
  $("#resendOtp").click(function () {
    $.ajax({
      url: "api/resendOtp.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: email }),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;
        console.log("FULL RESPONSE:", res);
        console.log("RESEND OTP:", res.otp);
        if (res.status === "success") {
          Swal.fire("Success", "OTP Resent", "success");
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
    });
  });
});
