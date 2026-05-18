$("#registerForm").submit(function (e) {
  e.preventDefault();

  let first_name = $("#firstName").val();
  let last_name = $("#lastName").val();
  let phone_number = $("#phone_number").val();
  let email = $("#email").val();
  let password = $("#password").val();
  let confirm_password = $("#confirmPassword").val();

  let isValid = true;

  const emailPattern = /^[a-zA-Z]+[a-zA-Z0-9+#$.]+@[a-zA-Z]{3,}\.[a-zA-Z]{2,}/;
  const phonePattern = /^[6-9][0-9]{9}$/;

  $("small").text("");

  if (first_name === "") {
    $("#firstNameErr").text("First name is required");
    isValid = false;
  }

  if (phone_number === "") {
    $("#phoneErr").text("Phone number is required");
    isValid = false;
  } else if (!phonePattern.test(phone_number)) {
    $("#phoneErr").text("Phone number must be 10 digits");
    isValid = false;
  }

  if (email === "") {
    $("#emailErr").text("Email is required");
    isValid = false;
  } else if (!emailPattern.test(email)) {
    $("#emailErr").text("Invalid email");
    isValid = false;
  }

  if (password === "") {
    $("#passwordErr").text("Password is required");
    isValid = false;
  } else if (password.length < 6) {
    $("#passwordErr").text("Password minimum 6 characters");
    isValid = false;
  }

  if (confirm_password === "") {
    $("#confirmPasswordErr").text("Confirm password required");
    isValid = false;
  } else if (password !== confirm_password) {
    $("#confirmPasswordErr").text("Passwords do not match");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  $.ajax({
    url: "api/register.php",
    method: "POST",
    dataType: "json",
    data: {
      first_name: first_name,
      last_name: last_name,
      phone_number: phone_number,
      email: email,
      password: password,
    },
    success: function (response) {
      if (response.status) {
        console.log(response);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message,
        }).then( () => {

          $("#registerForm")[0].reset();

          window.location.href = "index.html";
        });

      } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
        });
    }
    },
  });
});

