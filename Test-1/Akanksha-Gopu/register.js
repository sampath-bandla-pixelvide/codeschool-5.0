$(document).ready(function () {
  $("#signIn").click(function (e) {
    e.preventDefault();

    let user = $("#user").val();
    let email = $("#email").val();
    let password = $("#password").val();
    let dob = $("#dob").val();
    let contact = $("#phno").val();

    let isUserValid = validate(user, 3, 12, "#usermsg");
    let isPassValid = validate(password, 3, 12, "#passmsg");
    let isEmailValid = validateEmail(email, "#emailmsg");
    let isContactValid = validateContact(contact, "#contactmsg");

    if (isUserValid && isPassValid && isEmailValid && isContactValid) {
      getData(user, email, password, dob, contact);
    }
  });
});

function validate(value, min, max, msgSelector) {
  let message = $(msgSelector);
  message.text("");

  if (value.length <= min) {
    message.text(`Should have more than ${min} characters`);
    return false;
  } else if (value.length > max) {
    message.text(`Should have less than ${max} characters`);
    return false;
  }

  return true;
}

function validateEmail(email, msgSelector) {
  let message = $(msgSelector);
  message.text("");

  let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(email)) {
    message.text("Enter valid email");
    return false;
  }

  return true;
}

function validateContact(contact, msgSelector) {
  let message = $(msgSelector);
  message.text("");

  let pattern = /^[0-9]{10}$/;

  if (!pattern.test(contact) && !contact.length < 10) {
    message.text("Enter valid 10-digit number");
    return false;
  }

  return true;
}

function getData(user, email, password, dob, contact) {
  $.ajax({
    url: "https://dummyjson.com/auth/login",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      username: user,
      email: email,
      password: password,
      birthdate: dob,
      phone: contact,
      expiresInMins: 30,
    }),

    success: function (data) {
      console.log(data);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data));

      if (localStorage.getItem("accessToken")) {
        Swal.fire({
          title: "Registration Success!",
          text: "Go To Home page!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.replace("home.html");
        });
      }
    },

    error: function (err) {
      Swal.fire({
        title: "Error!",
        text: "Invalid",
        icon: "error",
      });
    },
  });
}
