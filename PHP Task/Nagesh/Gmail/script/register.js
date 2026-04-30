$(document).ready(function () {
  $("input").on("keydown", function (e) {
    if (e.key === "Enter") register();
  });
});

function register() {
  const first_name = $("#first_name").val().trim();
  const last_name = $("#last_name").val().trim();
  const dob = $("#dob").val();
  const gender = $("#gender").val();
  const email = $("#email").val().trim();
  const password = $("#password").val();

  $(".error-msg").text("");

  let valid = true;

  if (!first_name) {
    $("#firstNameError").text("Enter first name.");
    valid = false;
  }
  if (!last_name) {
    $("#lastNameError").text("Enter last name.");
    valid = false;
  }
  if (!dob) {
    $("#dobError").text("Enter your date of birth.");
    valid = false;
  }
  if (!gender) {
    $("#genderError").text("Select your gender.");
    valid = false;
  }

  const emailPat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    $("#emailError").text("Enter an email address.");
    valid = false;
  } else if (!emailPat.test(email)) {
    $("#emailError").text("Enter a valid email address.");
    valid = false;
  }

  if (!password) {
    $("#passwordError").text("Create a password.");
    valid = false;
  } else if (password.length < 6) {
    $("#passwordError").text("Use 6 characters or more.");
    valid = false;
  } else if (password.length > 25) {
    $("#passwordError").text("Use 25 characters or fewer.");
    valid = false;
  }

  if (!valid) return;

  $(".btn-create").prop("disabled", true).text("Creating account...");

  $.ajax({
    url: "api/register.php",
    method: "POST",
    dataType: "json",
    data: { first_name, last_name, dob, gender, email, password },
    success: function (res) {
      if (res.status) {
        // Show success and redirect
        alert("Account created");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        $("#emailError").text(res.message || "Registration failed.");
        $(".btn-create").prop("disabled", false).text("Create Account");
      }
    },
    error: function (xhr) {
      try {
        const err = JSON.parse(xhr.responseText);
        $("#emailError").text(err.message || "Server error.");
      } catch (e) {
        $("#emailError").text("Server error. Please try again.");
      }
      $(".btn-create").prop("disabled", false).text("Create Account");
    },
  });
}

function showSuccess(msg) {
  const el = $(
    '<div style="color:#137333;font-size:14px;text-align:center;margin-top:12px;">✓ ' +
      msg +
      "</div>",
  );
  $(".card").append(el);
}
