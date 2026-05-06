
$(document)
  .off("click", "#sendOtpBtn")
  .on("click", "#sendOtpBtn", function () {

    let phone = $("#phoneInput").val().trim();

    if (!phone) {
      $("#phoneMessage").html("<span class='text-danger'>Phone number required</span>");
      return;
    }

    $("#phoneMessage").html("<span class='text-muted'>Sending OTP...</span>");

    $.ajax({
      url: "api/auth/send-otp.php",
      method: "POST",
      data: { phone: phone },
      dataType: "json",

      success: function (response) {

        if (response.status) {

          console.log("OTP:", response.data.otp);

          // store phone
          localStorage.setItem("phone", phone);

          loadPage("otp");

        } else {
          $("#phoneMessage").html("<span class='text-danger'>" + response.message + "</span>");
        }
      },

      error: function () {
        $("#phoneMessage").html("<span class='text-danger'>Request failed</span>");
      }
    });

  });



$(document)
  .off("click", "#backToLogin")
  .on("click", "#backToLogin", function (e) {
    e.preventDefault();
    loadPage("login");
  });