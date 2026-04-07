$(document).ready(function () {
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    let firstname = $("#firstname");
    let lastname = $("#lastname");
    let email = $("#email");
    let phone = $("#phone");
    let dob = $("#dob");
    let pan = $("#pan");
    let password = $("#password");

    $("input").removeClass("is-invalid is-valid");
    $(".error").text("");

    if (firstname.val().length < 3 || firstname.val().length > 15) {
      showError(firstname, "3-15 characters required");
      isValid = false;
    } else {
      showSuccess(firstname);
    }

    if (lastname.val().length < 3 || lastname.val().length > 15) {
      showError(lastname, "3-15 characters required");
      isValid = false;
    } else {
      showSuccess(lastname);
    }

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.val())) {
      showError(email, "Invalid email");
      isValid = false;
    } else {
      showSuccess(email);
    }

    let phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone.val())) {
      showError(phone, "Invalid Indian number");
      isValid = false;
    } else {
      showSuccess(phone);
    }

    let today = new Date();
    let birthDate = new Date(dob.val());
    let age = today.getFullYear() - birthDate.getFullYear();

    if (age < 18) {
      showError(dob, "Must be 18+");
      isValid = false;
    } else {
      showSuccess(dob);
    }

    let panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(pan.val())) {
      showError(pan, "Invalid PAN format");
      isValid = false;
    } else {
      showSuccess(pan);
    }

    let passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passPattern.test(password.val())) {
      showError(password, "Min 8 chars, upper, lower, number, special char");
      isValid = false;
    } else {
      showSuccess(password);
    }

    if (isValid) {
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstname.val(),
          lastname: lastname.val(),
          email: email.val(),
          dob: dob.val(),
          pan: pan.val(),
          password: password.val(),
        }),
      };

      fetch("https://dummyjson.com/auth/login", options);

      Swal.fire({
        icon: "success",
        title: "Registration Successful !!",
        text: "Redirecting to login page...",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.href = "./login.html";
      });

      $("#registerForm")[0].reset();

      $("input").removeClass("is-valid");
    }
  });
});

function showError(input, message) {
  input.addClass("is-invalid");
  input.next(".error").text(message);
}

function showSuccess(input) {
  input.addClass("is-valid");
}
