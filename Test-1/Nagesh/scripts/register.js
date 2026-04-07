$(document).ready(function () {

  $("#registerBtn").click(function (e) {

    e.preventDefault(); 

    let name = $("#name").val().trim();
    let email = $("#email").val().trim();
    let phone = $("#phone").val().trim();
    let dob = $("#dob").val();
    let pan = $("#pan").val().trim();
    let password = $("#password").val().trim();

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phonePattern = /^[0-9]{10}$/;
    let panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    let passwordPattern = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

    $("#nameError, #emailError, #phoneError, #dobError, #panError, #passwordError").text("");

    let isValid = true;

    if (name === "") {
      $("#nameError").text("Name should not be empty");
      isValid = false;
    } else if (name.length < 4 || name.length > 12) {
      $("#nameError").text("Name should be 4–12 characters");
      isValid = false;
    }

    if (!emailPattern.test(email)) {
      $("#emailError").text("Invalid email");
      isValid = false;
    }

    if (!phonePattern.test(phone)) {
      $("#phoneError").text("Enter valid 10-digit number");
      isValid = false;
    }

    if (dob === "") {
      $("#dobError").text("Select date of birth");
      isValid = false;
    } else {
      let birthDate = new Date(dob);
      let today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        $("#dobError").text("Age must be 18+");
        isValid = false;
      }
    }

    if (!panPattern.test(pan)) {
      $("#panError").text("Invalid PAN (ABCDE1234F)");
      isValid = false;
    }

    if (password === "") {
      $("#passwordError").text("Password should not be empty");
      isValid = false;
    } else if (!passwordPattern.test(password)) {
      $("#passwordError").text("Min 6 chars, 1 uppercase, 1 number");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      type: "POST",
      url: "https://dummyjson.com/users/add",
      contentType: "application/json",
      data: JSON.stringify({
        name: name,  // Nagesh
        email: email, //nagesh@gmail.com
        phone: phone, // 9381556586
        birthDate: dob,  // 15-07-2002
        password: password // Nag123
      }),

      success: function (response) {

        let users = JSON.parse(localStorage.getItem("users")) || [];

        users.push({
          username: name,
          password: password
        });

        localStorage.setItem("users", JSON.stringify(users));

        Swal.fire({
          title: "Success!",
          text: "Registered Successfully",
          icon: "success"
        }).then(() => {
          window.location.href = "login.html";
        });

      },

      error: function () {
        Swal.fire({
          title: "Error!",
          text: "Registration Failed",
          icon: "error"
        });
      }

    });

  });

});