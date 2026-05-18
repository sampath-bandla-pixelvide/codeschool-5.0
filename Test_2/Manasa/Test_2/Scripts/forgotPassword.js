$(document).ready(function () {
  $("#forgotForm").submit(function (e) {
    e.preventDefault();

    let email = $("#email").val().trim();
    $("#emailError").text("");

    if (email === "") {
      $("#emailError").text("Email is required");
      return;
    }

    $.ajax({
      url: "api/forgotPassword.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: email }),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        console.log("FULL RESPONSE:", res);
        console.log("OTP:", res.otp);

        if (res.status === "success") {
          Swal.fire({
            icon: "success",
            title: "OTP Sent",
            text: "Check console for OTP",
            confirmButtonText: "OK",
          }).then(() => {
            setTimeout(() => {
              window.location.href = "VerifyOtp.html?email=" + email;
            }, 1000);
          });
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
      error: function (xhr) {
        console.log("ERROR RESPONSE:", xhr.responseText);
        Swal.fire("Error", "Something went wrong", "error");
      },
    });
  });
});
