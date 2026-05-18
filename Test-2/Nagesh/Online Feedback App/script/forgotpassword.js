$(document).ready(() => {
  let interval;

  $("#verifyEmail").submit((e) => {
    e.preventDefault();
    const email = $("#floatingInput").val();
    $("#email").val(email);
    $("#emailInput").val(email);

    $("#otp").text("");
    let time = 120;

    $.ajax({
      type: "POST",
      url: "/api/generateOtp.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          console.log(response.message);
          $("#verifyEmail").addClass("d-none");
          $("#verifyOtp").removeClass("d-none");
          $("#resendOtp").removeClass("d-none");
          clearInterval(interval);
          interval = setInterval(() => {
            if (time <= 0) {
              $("#otp").text("Otp got expired please click resend Otp");
              $("#resendOtp").removeClass("disabled");
              clearInterval(interval);
              return;
            }
            $("#otp").text(`Otp expires in ${time}`);
            time--;
          }, 1000);
        } else {
          Swal.fire({
            icon: "error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          text: "error while fetching data",
        });
      },
    });
  });

  $("#verifyOtp").submit((e) => {
    e.preventDefault();

    const email = $("#email").val();
    const otp = $("#otpp").val();

    $.ajax({
      type: "POST",
      url: "/api/verifyOtp.php",
      data: {
        otp,
        email,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          $("#verifyOtp").addClass("d-none");
          $("#resendOtp").addClass("d-none");
          $("#setPassword").removeClass("d-none");
        } else {
          Swal.fire({
            icon: "error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          text: "Error while fetching",
        });
      },
    });
  });

  $("#resendOtp").on("click", () => {
    $("#otp").text("");
    const email = $("#email").val();
    $("#resendOtp").addClass("disabled");
    let timer = 120;
    $.ajax({
      type: "POST",
      url: "/api/generateOtp.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          clearInterval(interval);
          console.log(response);
          interval = setInterval(() => {
            if (timer <= 0) {
              $("#otp").text("otp got expired please click resend for new otp");
              $("#resendOtp").removeClass("disabled");
              clearInterval(interval);
              return;
            }
            $("#otp").text(`otp expires in ${timer}`);
            timer--;
          }, 1000);
        } else {
          Swal.fire({
            icon: "error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          text: "Invalid Otp",
        });
      },
    });
  });

  $("#setPassword").submit((e) => {
    e.preventDefault();

    const email = $("#emailInput").val();
    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();

    $.ajax({
      type: "POST",
      url: "/api/updatedPassword.php",
      data: { email, password, confirmPassword },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          Swal.fire({
            icon: "success",
            text: "Password reset successfully",
          }).then(() => {
            window.location.replace("./index.html");
          });
        } else {
          Swal.fire({
            icon: "error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          text: "error while setting password",
        });
      },
    });
  });
});
