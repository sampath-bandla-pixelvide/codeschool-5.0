$(document).ready(function () {
  console.log("JS ok ");
  for (let i = 1; i <= 31; i++) {
    $("#day").append(`<option value="${i}">${i}</option>`);
  }
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  months.forEach((m, i) => {
    $("#month").append(`<option value="${i + 1}">${m}</option>`);
  });
  let currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1876; y--) {
    $("#year").append(`<option value="${y}">${y}</option>`);
  }
  ["Male", "Female", "Custom"].forEach((g) => {
    $("#gender").append(`<option value="${g}">${g}</option>`);
  });
  $("#submitBtn").click(function (e) {
    e.preventDefault();

    let firstName = $("#firstName").val()?.trim() || "";
    let lastName = $("#lastName").val()?.trim() || "";
    let day = $("#day").val();
    let month = $("#month").val();
    let year = $("#year").val();
    let gender = $("#gender").val();
    let contact = $("#contact").val()?.trim() || "";
    let password = $("#password").val()?.trim() || "";

    console.log("Password:", password);
    let valid = true;
    $(
      "#nameError, #dobError, #genderError, #contactError, #passwordError",
    ).text("");

    if (!firstName || !lastName) {
      $("#nameError").text("Please enter your full name");
      valid = false;
    }

    if (day === "Day" || month === "Month" || year === "Year") {
      $("#dobError").text("Please select your date of birth");
      valid = false;
    }

    if (gender === "Select your gender") {
      $("#genderError").text("Please select your gender");
      valid = false;
    }

    if (!contact) {
      $("#contactError").text("Enter email or mobile number");
      valid = false;
    }

    if (!password) {
      $("#passwordError").text("Please enter your password");
      valid = false;
    } else if (password.length < 6) {
      $("#passwordError").text("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) return;
    $.ajax({
      url: "/api/register.php",
      type: "POST",
      data: {
        first_name: firstName,
        last_name: lastName,
        day: day,
        month: month,
        year: year,
        gender: gender,
        contact: contact,
        password: password,
      },
      success: function (res) {
        try {
          let response = JSON.parse(res);
          if (response.status === "error") {
            let errors = response.errors;
            if (errors.name) $("#nameError").text(errors.name);
            if (errors.dob) $("#dobError").text(errors.dob);
            if (errors.gender) $("#genderError").text(errors.gender);
            if (errors.contact) $("#contactError").text(errors.contact);
            if (errors.password) $("#passwordError").text(errors.password);
            return;
          }
        } catch (e) {}
        if (res === "success") {
          alert("Account created successfully");
          window.location.href = "index.html";
        } else if (res === "exists") {
          $("#contactError").text("Email or mobile already exists");
        } else {
          alert("Something went wrong");
        }
      },
    });
  });
});
