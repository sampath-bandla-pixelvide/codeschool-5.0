const nameRegex = /^[A-Za-z]{2,}(?: [A-Za-z]+)*$/;
const userNameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;

let userToken = localStorage.getItem("userToken");

if (userToken) {
  window.location.href = "./home.html";
}

function phoneNumberValidation() {
  const numberRegex = /^[6-9]\d{9}$/;
  let number = $("#phoneNumberInput").val().trim();
  if (number.length == 0) {
    $("#nextBtn").addClass("d-none");
    $("#phoneNumberError").addClass("d-none");
    return;
  }
  if (!numberRegex.test(number)) {
    $("#nextBtn").addClass("d-none");
    $("#phoneNumberError").removeClass("d-none");
    return;
  }
  $("#nextBtn").removeClass("d-none");
}

let time = 30;
let countdown;
function startTimer() {
  const timerEl = $("#timer");
  const resendBtn = $("#resendOtp");
  clearInterval(countdown);
  time = 30;
  resendBtn.addClass("disabled");

  countdown = setInterval(() => {
    timerEl.text(`Resend available in ${time}s`);
    time--;

    if (time < 0) {
      clearInterval(countdown);
      timerEl.text("");
      resendBtn.removeClass("disabled");
    }
  }, 1000);
}

$(document).ready(function () {
  $("#loginOptionsContainer").load("./templates/qrlogin.html");
  $(document).on("click", "#nextBtn", function () {
    const number = $("#phoneNumberInput").val();
    const rememberMe = $("#keepMeSignedIn").is(":checked");
    $.ajax({
      type: "POST",
      url: "../api/setPhoneNumber.php",
      data: { number, rememberMe },
      dataType: "json",
      success: function (response) {
        console.log(response);
        if (response.status) {
          $("#loginOptionsContainer").load(
            "./templates/otpVerify.html",
            function () {
              startTimer();
            },
          );
        }
      },
    });
  });

  let typingTimer;
  $(document).on("input", "#phoneNumberInput", function () {
    $("#phoneNumberError").addClass("d-none");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      phoneNumberValidation();
    }, 1000);
  });

  $(document).on("input", "#otpInput", function () {
    let otp = $("#otpInput").val();
    if (otp.length != 6) {
      $("#otpSubmitBtn").addClass("disabled");
      return;
    }
    $("#otpSubmitBtn").removeClass("disabled");
    return;
  });

  $(document).on("click", "#resendOtp", function (e) {
    e.preventDefault();
    if ($(this).hasClass("disabled")) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/setPhoneNumber.php",
      dataType: "json",
      success: function (response) {
        console.log(response);
        if (response.status) {
          startTimer();
        } else {
          Swal.fire("Warning", response.message, "warning").then(() => {
            $("#loginOptionsContainer").load("./templates/qrlogin.html");
          });
        }
      },
    });
  });

  $(document).on("submit", "#otpForm", function (e) {
    e.preventDefault();
    let otp = $("#otpInput").val();
    $("#otpError").addClass("d-none");
    $.ajax({
      type: "post",
      url: "../api/otpVerify.php",
      data: { otp },
      dataType: "json",
      success: function (response) {
        console.log(response);
        if (response.status) {
          if (response.data.userExist) {
            $.ajax({
              type: "get",
              url: "../api/login.php",
              dataType: "json",
              success: function (response) {
                if (response.status) {
                  let token = response.data.token;
                  localStorage.setItem("userToken", token);
                  window.location.href = "./home.html";
                }
              },
            });
          } else {
            $("#loginOptionsContainer").load("./templates/register.html");
          }
        } else {
          $("#otpError").removeClass("d-none");
        }
      },
    });
  });

  $(document).on("change", "#photo", function () {
    const file = $("#photo")[0].files[0];
    if (!file) {
      return;
    }
    $("#photoPreview").attr("src", URL.createObjectURL(file));
  });

  $(document).on("submit", "#registerForm", function (e) {
    e.preventDefault();
    const first_name = $("#firstName").val();
    const last_name = $("#lastName").val();
    const user_name = $("#username").val();
    const email = $("#email").val();
    const bio = $("#bio").val();
    const photo = $("#photo")[0].files[0];
    let errorFlag = false;

    if (!nameRegex.test(first_name)) {
      $("#firstNameError").removeClass("d-none");
      errorFlag = true;
    }

    if (last_name) {
      if (!nameRegex.test(last_name)) {
        $("#lastNameError").removeClass("d-none");
        errorFlag = true;
      }
    }

    if (errorFlag) {
      return;
    }

    let formData = new FormData(document.getElementById("registerForm"));

    $.ajax({
      url: "../api/register.php",
      type: "POST",
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        console.log(response);
        if (response.status) {
          let token = response.data.token;
          console.log(token);
          localStorage.setItem("userToken", token);
          window.location.href = "./home.html";
        }
      },
      error: function () {
        $("#registerError")
          .text("Something went wrong!! Try again later...")
          .removeClass("d-none");
      },
    });
  });

  $(document).on("input", "#registerForm", function () {
    $("#firstNameError").addClass("d-none");
    $("#lastNameError").addClass("d-none");
    $("#userNameError").addClass("d-none");
  });

  let userNameValidationTimer;

  $(document).on("input", "#username", function () {
    $("#userNameError").addClass("d-none");
    $("#usernameX").addClass("d-none");
    $("#usernameCheck").addClass("d-none");
    $("#usernameSpinner").removeClass("d-none");

    clearTimeout(userNameValidationTimer);
    userNameValidationTimer = setTimeout(function () {
      const user_name = $("#username").val().trim();

      if (user_name.length === 0) {
        $("#usernameSpinner").addClass("d-none");
        $("#userNameError").addClass("d-none");
        $("#usernameCheck").addClass("d-none");
        $("#usernameX").addClass("d-none");
        return;
      }

      if (!userNameRegex.test(user_name)) {
        $("#userNameError").text("Only a–z, A–Z, 0–9, _ and . are allowed");
        $("#userNameError").removeClass("d-none");
        $("#usernameSpinner").addClass("d-none");
        $("#usernameX").removeClass("d-none");
        return;
      }

      $.ajax({
        type: "get",
        url: "../api/isUserNameTaken.php",
        data: { user_name },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#usernameSpinner").addClass("d-none");
            $("#userNameError").addClass("d-none");
            $("#usernameX").addClass("d-none");
            $("#usernameCheck").removeClass("d-none");
          } else {
            $("#usernameSpinner").addClass("d-none");
            $("#userNameError").text("User-Name already taken!!");
            $("#userNameError").removeClass("d-none");
            $("#usernameCheck").addClass("d-none");
            $("#usernameX").removeClass("d-none");
          }
        },
      });
    }, 1000);
  });

  $(document).on("click", "#phoneNumberLogin", function () {
    $("#loginOptionsContainer").load("./templates/phonenumberlogin.html");
  });

  $(document).on("click", "#qrCodeLogin", function () {
    $("#loginOptionsContainer").load("./templates/qrlogin.html");
  });
});
