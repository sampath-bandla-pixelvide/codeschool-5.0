$(document).ready(function () {
  
  window.goToSignup = function () {
    window.location.href = "signup.html";
  };

  window.validate = function () {
    let input = $("#codeInput");
    let label = $("#codeLabel");
    let error = $("#errorText");

    let value = input.val().trim();

    input.removeClass("input-error");
    label.removeClass("label-error");
    error.text("");

    if (value === "") {
      error.text("Please check we sent and enter that 6-digit code.");
      input.addClass("input-error");
      label.addClass("label-error");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const contact = urlParams.get("contact");
    console.log("CONTACT:", contact);
    if (!contact) {
      alert("Session expired. Please signup again.");
      window.location.href = "signup.html";
      return;
    }

    $.ajax({
      url: "api/verifyOtp.php",
      method: "POST",
      data: {
        otp: value,
        contact: contact,
      },
      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (response.status === "success") {
          console.log("OTP:", response.otp);
          window.location.href = "login.html";
        } else {
          error.text(response.message);
          input.addClass("input-error");
          label.addClass("label-error");
        }
      },
    });
  };

  $("#codeInput").on("input", function () {
    $(this).removeClass("input-error");
    $("#codeLabel").removeClass("label-error");
    $("#errorText").text("");
  });
});
