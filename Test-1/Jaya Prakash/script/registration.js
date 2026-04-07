const mailRegex = /^[a-zA-Z0-9+-.#$]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;

$(document).ready(function () {
  $("#registerBtn").click(function (e) {
    e.preventDefault();
    clearErrors();

    let fName = $("#fName");
    let lName = $("#lName");
    let email = $("#email");
    let number = $("#phNumber");
    let panId = $("#panId");
    let dob = $("#dob");
    let password = $("#password");
    let conformPassword = $("#conformPassword");

    if (fName.val().length < 4 || fName.val().length > 30) {
      $("#firstNameError").removeClass("d-none");
      return;
    }

    if (lName.val().length < 4 || lName.val().length > 30) {
      $("#lastNameError").removeClass("d-none");
      return;
    }

    if (!mailRegex.test(email.val())) {
      $("#emailError").removeClass("d-none");
      return;
    }

    if (number.val().length !== 10 || isNaN(number.val())) {
      $("#numError").removeClass("d-none");
      return;
    }

    if (!panRegex.test(panId.val())) {
      $("#panError").removeClass("d-none");
      return;
    }

    if (!dob.val()) {
      $("#dobError").text("Please select your date of birth").removeClass("d-none");
      return;
    }

    let today = new Date();
    let birthDate = new Date(dob.val());

    if (birthDate > today) {
      $("#dobError").text("DOB cannot be in the future").removeClass("d-none");
      return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      $("#dobError").text("You must be at least 18 years old").removeClass("d-none");
      return;
    }

    if (password.val().length < 6 || password.val().length > 20) {
      $("#passwordError").removeClass("d-none");
      return;
    }

    if (password.val() !== conformPassword.val()) {
      $("#cpasswordError").removeClass("d-none");
      return;
    }

    window.location.href = "../templates/login.html";
  });
});

function clearErrors() {
  $("#firstNameError").addClass("d-none");
  $("#lastNameError").addClass("d-none");
  $("#emailError").addClass("d-none");
  $("#numError").addClass("d-none");
  $("#panError").addClass("d-none");
  $("#dobError").addClass("d-none").text("");
  $("#passwordError").addClass("d-none");
  $("#cpasswordError").addClass("d-none");
}