
$(document).ready(function () {
  let token = localStorage.getItem("token");
    console.log(token);
    if(token){
        window.location.replace("./home.html");
    }

  $("#showSignup").click(function () {
    $("#left-panel")
      .removeClass("overlay-section text-white")
      .addClass("bg-light");

    $("#rightPanel")
      .removeClass("bg-light")
      .addClass("overlay-section text-white");

    $("#signup-info").fadeOut(300, function () {
      $("#signupForm").removeClass("d-none").hide().fadeIn(300);
    });

    $("#loginForm").fadeOut(300, function () {
      $("#login-info").removeClass("d-none").hide().fadeIn(300);
    });
  });

  $("#showLogin").click(function () {
    $("#rightPanel")
      .removeClass("overlay-section text-white")
      .addClass("bg-light");

    $("#left-panel")
      .removeClass("bg-light")
      .addClass("overlay-section text-white");

    $("#signupForm").fadeOut(300, function () {
      $("#signup-info").fadeIn(300);
    });

    $("#login-info").fadeOut(300, function () {
      $("#loginForm").fadeIn(300);
    });
  });
});
const emailRegex = /^[a-zA-Z]+[a-zA-Z0-9+#$.]+@[a-zA-Z]{3,}\.[a-zA-Z]{2,}/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const accountRegex = /^[0-9]{9,18}$/;
const regexName = /^[A-Za-z]+$/;

function showError(id, message) {
  $(`#${id}`).text(message);
}

function login() {
  
  let email = $("#loginEmail").val();

  let password = $("#loginPassword").val();

  $("#loginBtn").prop("disabled", true);

  $(".text-danger").text("");

  if (email === "" || !emailRegex.test(email)) {
    showError("loginEmailError", "Enter valid email");

    $("#loginBtn").prop("disabled", false);

    return;
  }

  if (password === "" || password.length < 6) {
    showError("loginPasswordError", "Password must be at least 6 characters");

    $("#loginBtn").prop("disabled", false);

    return;
  }


  $.ajax({
    type: "POST",
    url: "./api/php-scripts/login.php",
    data: {
      email,
      password,
    },
    dataType: "json",
    success: function (res) {
      if (!res.status) {
         $("#loginBtn").prop("disabled", false);
        Swal.fire({
          icon: "error",
          title: "login Failed",
        });
        Object.keys(res.data).forEach((key) => {
          $(`#${key}Error`).text(res.data[key]);
        });

       
      } else {
        console.log(res.data);
        localStorage.setItem('token',res.data.token);
        console.log("Stored:", localStorage.getItem("token"));
        if (res.data.isAdmin) {
          window.location.replace("./adminDashboard.html");
          return;
        } else {
              window.location.replace("./home.html");
        }
      }
    },
    error: function (err) {
      Swal.fire({
        icon: "error",
        text: "Something went wrong! Try login again",
      });
    },
  });
}

function register() {
  $("#signupBtn").prop("disabled", true);

  $(".text-danger").text("");

  const data = {
    firstName: $("#firstName").val(),

    lastName: $("#lastName").val(),

    email: $("#email").val(),

    phone: $("#phone").val(),

    password: $("#password").val(),

    confirmPassword: $("#confirmPassword").val(),

    termsCheck: $("#termsCheck").is(":checked"),
  };

  if (!registerValidations(data)) {
    $("#signupBtn").prop("disabled", false);

    return;
  }

  $.ajax({
    type: "POST",

    url: "./api/php-scripts/registration.php",

    dataType: "json",

    data: {
      data,
    },
    success: function (res) {
      if (!res.status) {
        Swal.fire({
          icon: "error",
          text: res.message,
          title: "Registration Failed",
        });
        Object.keys(res.data).forEach((key) => {
          $(`#${key}Error`).text(res.data[key]);
        });

        $("#signupBtn").prop("disabled", false);
      } else {
        Swal.fire({
          icon: "success",
          text: res.message,
          title: "Registration Successful",
        });
       window.location.replace("./index.html"); 
      }
    },
  });
}

function registerValidations(data) {
  if (
    data.firstName === "" ||
    data.firstName.length < 2 ||
    !regexName.test(data.firstName)
  ) {
    showError(
      "firstNameError",
      "First name should be at least 2 characters and valid",
    );

    return false;
  }

  if (
    data.lastName === "" ||
    data.lastName.length < 2 ||
    !regexName.test(data.lastName)
  ) {
    showError("lastNameError", "Last name should be at least 2 characters");

    return false;
  }

  if (data.email === "" || !emailRegex.test(data.email)) {
    showError("emailError", "Enter valid email");

    return false;
  }

  if (data.phone === "" || !phoneRegex.test(data.phone)) {
    showError("phoneError", "Enter valid phone number");

    return false;
  }


  if (data.password === "" || data.password.length < 6) {
    showError("passwordError", "Password must be at least 6 characters");

    return false;
  }

  if (data.password !== data.confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match");

    return false;
  }

  if (!data.termsCheck) {
    Swal.fire({
      icon: "warning",
      title: "Terms Required",
      text: "Please accept terms and conditions",
    });

    return false;
  }

  return true;
}
