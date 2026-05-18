$(document).ready(function () {
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    let name = $("#name").val().trim();
    let phone = $("#phone").val().trim();
    let email = $("#email").val().trim();
    let password = $("#password").val().trim();
    let terms = $("#terms").is(":checked");
    let confirmPassword = $("#confirmPassword").val().trim();

    $(".text-danger").text("");

    if (name.length < 3) {
      $("#nameError").text("Name must be atleast 3 characters");
      isValid = false;
    }
    let phone_regex = /^[0-9]{10}$/;
    if (!phone_regex.test(phone)) {
      $("#phoneError").text("Enter valid 10 digits phone number");
      isValid = false;
    }
    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      $("#emailError").text("Enter a valid email address");
      isValid = false;
    }
    if (password.length < 6) {
      $("#passwordError").text("Password must be at least 6 characters");
      isValid = false;
    }

    if (password !== confirmPassword) {
      $("#confirmPasswordError").text("Passwords do not match");
      isValid = false;
    }
    if (!terms) {
      $("#termsError").text("You must accept Terms & Conditions");
      isValid = false;
    }

    if (isValid) {
      let formData = {
        name: name,
        phone: phone,
        email: email,
        password: password,
        role: "student",
      };

      $.ajax({
        url: "api/register.php",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),

        success: function (response) {
          try {
            let res =
              typeof response === "string" ? JSON.parse(response) : response;
            if (res.status === "success") {
              swal
                .fire({
                  icon: "success",
                  title: "Registration Successful",
                  text: "Redirecting to login Page...",
                  confirmButtonText: "Go to Login",
                })
                .then((result) => {
                  if (result.isConfirmed) {
                    window.location.href = "Login.html";
                  }
                });
            } else {
              swal.fire({
                icon: "error",
                title: "Registration failed",
                text: res.message || "something went wrong",
              });
            }
          } catch (e) {
            swal.fire({
              icon: "error",
              title: "Server Error",
              text: "Invalid response from server",
            });
          }
        },
        error: function () {
          swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Something went wrong. Please try again.",
          });
        },
      });
    }
  });
});
