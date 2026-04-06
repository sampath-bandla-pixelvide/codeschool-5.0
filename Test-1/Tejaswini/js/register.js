$(document).ready(function () {
  $("#registerBtn").click(function () {
    let username = $("#username").val();
    let email = $("#email").val();
    let dob = $("#dob").val();
    let password = $("#password").val();
    let phone = $("#phone").val();
    let pan = $("#pan").val();

    // remove previous erroe text
    $("#usernameError").text("");
    $("#emailError").text("");
    $("#dobError").text("");
    $("#passwordError").text("");
    $("#phoneError").text("");
    $("#panError").text("");

    if(validateUser(username, email, dob, password, phone, pan)) location.href="/pages/login.html";
  });
  function validateUser(username, email, dob, password, phone, pan) {
    let isValid = true;
    if (username.length < 3) {
      $("#usernameError").text("Username must be at least 3 characters");
      isValid = false;
    }
    // email
    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      $("#emailError").text("Enter a valid email");
      isValid = false;
    }

    // dob
    if (dob === "") {
      $("#dobError").text("Select your date of birth");
      isValid = false;
    }

    //pattern
    if (phone.length !== 10) {
      $("#phoneError").text("Phone number must be 10 digits");
      isValid = false;
    }

    // pan (India format: ABCDE1234F)
    let panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan.match(panPattern)) {
      $("#panError").text("Enter valid PAN (e.g., ABCDE1234F)");
      isValid = false;
    }

    // password
    if (password.length < 6) {
      $("#passwordError").text("Password must be at least 6 characters");
      isValid = false;
    } else {
      let hasUpper = false;
      let hasDigit = false;

      for (let char of password) {
        if (char >= "A" && char <= "Z") {
          hasUpper = true;
        } else if (char >= "0" && char <= "9") {
          hasDigit = true;
        }
      }

      if (!hasUpper && !hasDigit) {
        $("#passwordError").text(
          "Password must include at least 1 uppercase letter and 1 number",
        );
        isValid = false;
      } else if (!hasUpper) {
        $("#passwordError").text(
          "Password must include at least 1 uppercase letter",
        );
        isValid = false;
      } else if (!hasDigit) {
        $("#passwordError").text("Password must include at least 1 number");
        isValid = false;
      }
    }

    if (isValid) {
      let user = {
        username: username,
        email: email,
        dob: dob,
        password: password,
        phone: phone,
        pan: pan,
      };
      Swal.fire("Success!", "Registration Successful!", "success");
      
      console.log(user);
    }
    return isValid;
  }
});
