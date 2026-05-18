$(document).ready(function () {
  $("#registerForm input").on("input change", function () {
    $(this).next(".error").text("");
  });
  $("#registerForm").submit(function (e) {
    e.preventDefault();

    $(".error").text("");

    let firstName = $("#firstName").val().trim();
    let lastName = $("#lastName").val().trim();
    let email = $("#email").val().trim();
    let phone = $("#phone").val().trim();
    let pan = $("#pan").val().trim().toUpperCase();
    let dob = $("#dob").val();
    let password = $("#password").val().trim();
    let conformpass = $("#conformpass").val().trim();

    let isValid = true;

    const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegx = /^[6-9][0-9]{9}$/;
    const panRegx = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (firstName === "") {
      $("#firstName").next(".error").text("First name is required");
      isValid = false;
    } else if (firstName.length < 3) {
      $("#firstName")
        .next(".error")
        .text("First name must be at least 3 characters");
      isValid = false;
    }

    if (lastName === "") {
      $("#lastName").next(".error").text("Last name is required");
      isValid = false;
    } else if (lastName.length < 3) {
      $("#lastName")
        .next(".error")
        .text("Last name must be at least 3 characters");
      isValid = false;
    }

    console.log("Email value:", email);
    console.log("Email valid:", emailRegx.test(email));

    if (email === "") {
      $("#email").next(".error").text("Email is required");
      isValid = false;
    } else if (!emailRegx.test(email)) {
      $("#email").next(".error").text("Invalid email format");
      isValid = false;
    }

    if (phone === "") {
      $("#phone").next(".error").text("Phone is required");
      isValid = false;
    } else if (!phoneRegx.test(phone)) {
      $("#phone")
        .next(".error")
        .text("Mobile number must start with 6-9 and contain 10 digits");
      isValid = false;
    }
    if (dob === "") {
      $("#dob").next(".error").text("Date of birth is required");
      isValid = false;
    }

    if (pan === "") {
      $("#pan").next(".error").text("PAN is required");
      isValid = false;
    } else if (!panRegx.test(pan)) {
      $("#pan").next(".error").text("Invalid PAN format");
      isValid = false;
    }

    if (password === "") {
      $("#password").next(".error").text("Password is required");
      isValid = false;
    } else if (password.length < 6 || password.length > 25) {
      $("#password").next(".error").text("Password must be 6 to 25 characters");
      isValid = false;
    }

    if (conformpass === "") {
      $("#conformpass").next(".error").text("Confirm password is required");
      isValid = false;
    } else if (password !== conformpass) {
      $("#conformpass").next(".error").text("Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      type: "POST",
      url: "api/register.php",
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        pan: pan,
        dob: dob,
        password: password,
      },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          Swal.fire("Success", response.message, "success");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Server error", "error");
      },
    });
  });
});
