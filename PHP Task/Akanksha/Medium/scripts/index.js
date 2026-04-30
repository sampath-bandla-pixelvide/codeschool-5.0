let countdown;

$("#sendOtpBtn").click(function () {
  const email = $("#email").val();
  const name = $("#name").val();

  if (!email || !name) {
    alert("Email and Name are required");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    alert("Invalid email format");
    return;
  }

  $.ajax({
    url: "/api/send_otp.php",
    method: "POST",
    data: {
      email: email,
      name: name,
    },
    dataType: "json",

    success: function (data) {
      console.log(data);
      if (data.status) {
      
        $("#loginModal").modal("hide");

        $("#otpModal").modal("show");

        startTimer(120);
      } else {
        alert("Failed to send OTP");
      }
    },

    error: function () {
      alert("Server error");
    },
  });
});

function startTimer(seconds) {
  clearInterval(countdown);

  let time = seconds;

  countdown = setInterval(() => {
    $("#timer").text("Expires in " + time + "s");

    if (time <= 0) {
      clearInterval(countdown);
      $("#timer").text("OTP expired");
    }

    time--;
  }, 1000);
}

$("#verifyOtpBtn").click(function () {
  const email = $("#email").val();
  const otp = $("#otpInput").val();
  const name = $("#name").val();

  $.ajax({
    url: "/api/verify_otp.php",
    method: "POST",
    data: { email: email, otp: otp, name: name },
    dataType: "json",

    success: function (data) {
      console.log(data);
      if (data.status) {
        Swal.fire({
          title: "Login successful",
          icon: "success",
          confirmButtonText: "OK",
        });
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid or expired OTP");
      }
    },

    error: function () {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "error",
      });
    },
  });
});
