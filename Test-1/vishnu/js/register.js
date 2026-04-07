$(document).ready(function () {
  $("#register").click(function () {
    let firstName = $("#firstName").val().trim();
    let lastName = $("#lastName").val().trim();
    let dob = $("#dob").val();
    let email = $("#email").val().trim();
    let phone = $("#phone").val().trim();
    let pan = $("#pan").val().trim().toUpperCase();
    let username = $("#username").val().trim();
    let password = $("#regPassword").val().trim();
    let valid = true;
    let panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (firstName === "") {
      $("#firstError").text("First name is required");
      valid = false;
    } else {
      $("#firstError").text("");
    }
    if (lastName === "") {
      $("#lastError").text("Last name is required");
      valid = false;
    } else {
      $("#lastError").text("");
    }
    if (dob === "") {
      $("#dobError").text("Date of birth is required");
      valid = false;
    } else {
      $("#dobError").text("");
    }
    if (email === "") {
      $("#emailError").text("Email is required");
      valid = false;
    }
    if (!email.includes("@")) {
      $("#emailError").text("Enter valid email");
      valid = false;
    }
    if (email !== "" && email.includes("@")) {
      $("#emailError").text("");
    }
    if (phone === "") {
      $("#phoneError").text("Phone number is required");
      valid = false;
    }
    if (phone.length !== 10) {
      $("#phoneError").text("Phone must be 10 digits");
      valid = false;
    }
    if (phone !== "" && phone.length === 10) {
      $("#phoneError").text("");
    }
    if (pan === "") {
      $("#panError").text("PAN is required");
      valid = false;
    }
    if (!panRegex.test(pan)) {
      $("#panError").text("Invalid PAN format (ABCDE1234F)");
      valid = false;
    }
    if (pan !== "" && panRegex.test(pan)) {
      $("#panError").text("");
    }
    if (username === "") {
      $("#userError").text("Username is required");
      valid = false;
    }
    if (username.length < 3) {
      $("#userError").text("Min 3 characters");
      valid = false;
    }
    if (username.length > 24) {
      $("#userError").text("Max 24 characters");
      valid = false;
    }
    if (username !== "" && username.length >= 3 && username.length <= 24) {
      $("#userError").text("");
    }
    if (password === "") {
      $("#passError").text("Password is required");
      valid = false;
    }
    if (password.length < 8) {
      $("#passError").text("Min 8 characters");
      valid = false;
    }
    if (password.length > 26) {
      $("#passError").text("Max 26 characters");
      valid = false;
    }
    if (password !== "" && password.length >= 8 && password.length <= 26) {
      $("#passError").text("");
    }
    if (valid) {

  $.ajax({
    type: "POST",
    url: "https://dummyjson.com/users/add",
    contentType: "application/json",
    data: JSON.stringify({
      firstName: firstName,
      lastName: lastName,
      birthDate: dob,
      email: email,
      phone: phone,
      username: username,
      password: password,
      panNumber: pan 
    }),

    success: function (response) {
      alert("Registration successful ");

      console.log("Response:", response);
      $("#firstName").val("");
      $("#lastName").val("");
      $("#dob").val("");
      $("#email").val("");
      $("#phone").val("");
      $("#pan").val("");
      $("#username").val("");
      $("#regPassword").val("");
    },

    error: function () {
      alert("Something went wrong ");
    }

  });

}
  });
});
