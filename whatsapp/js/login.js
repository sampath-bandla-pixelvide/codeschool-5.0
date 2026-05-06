$(document)
  .off("click", "#loginTogglePassword")
  .on("click", "#loginTogglePassword", function () {
    let input = $("#loginPassword");
    let icon = $(this).find("i");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("bi-eye").addClass("bi-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("bi-eye-slash").addClass("bi-eye");
    }
  });

$(document)
  .off("click", "#goRegister")
  .on("click", "#goRegister", function () {
    loadPage("register");
  });

$(document)
  .off("click", "#goPhoneLogin")
  .on("click", "#goPhoneLogin", function () {
    loadPage("phone");
  });

$(document)
  .off("click", "#loginBtn")
  .on("click", "#loginBtn", function () {
    let email = $("#loginEmail").val().trim();
    let password = $("#loginPassword").val();

    if (!email || !password) {
      $("#loginMessage").html(
        "<span class='text-danger'>Email and password required</span>",
      );
      return;
    }

    $("#loginMessage").html("<span class='text-muted'>Logging in...</span>");

    $.ajax({
      url: "api/auth/login.php",
      method: "POST",
      data: {
        email: email,
        password: password,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          localStorage.setItem("token", response.data.token);
        //   loadPage("dashboard");
        window.location.replace("public/dashboard.html")
        } else {
            console.log("hi")
          $("#loginMessage").html(
            "<span class='text-danger'>" + response.message + "</span>",
          );
        }
      },
      error: function () {
        $("#loginMessage").html(
          "<span class='text-danger'>Request failed</span>",
        );
      },
    });
  });

  $(document).on("blur", "#loginEmail", function () {

  const email = $(this).val().trim();

  if (!email) return;

  if (!validateEmail(email)) {
    showLoginMessage("Invalid email format", "danger");
    return;
  }

  $.ajax({
    url: "/api/auth/check-field.php",
    method: "GET",
    data: {
      field: "email",
      value: email
    },
    success: function (res) {

      if (res.status && res.data) {

        if (!res.data.exists) {
          showLoginMessage("Email does not exist", "danger");
        } else {
          clearLoginMessage();
        }

      }

    }
  });

});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function showLoginMessage(msg, type = "danger") {
  $("#loginMessage")
    .removeClass("text-danger text-success")
    .addClass("text-" + type)
    .text(msg)
    .show();
}

function clearLoginMessage() {
  $("#loginMessage").text("");
}
