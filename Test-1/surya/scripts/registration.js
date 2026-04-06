$(document).ready(function () {
  $("#register").click(function () {
    $("small").text("");
    $(".form-control").removeClass("is-valid is-invalid");

    let email = $("#email").val();
    let password = $("#password").val();
    let phone = $("#PhoneNumber").val();
    let dob = $("#DateofBirth").val();
    let pan = $("#panNumber").val();

    let isValid = true;

    if (email === "") {
      $("#emailError").text("Email is required");
      $("#email").addClass("is-invalid");
      isValid = false;
    } else if (!email.includes("@") || !email.includes(".")) {
      $("#emailError").text("Enter valid email");
      $("#email").addClass("is-invalid");
      isValid = false;
    } else {
      $("#email").addClass("is-valid");
    }

    if (password === "") {
      $("#passwordError").text("Password is required");
      $("#password").addClass("is-invalid");
      isValid = false;
    } else if (password.length < 6) {
      $("#passwordError").text("Minimum 6 characters");
      $("#password").addClass("is-invalid");
      isValid = false;
    } else {
      $("#password").addClass("is-valid");
    }

    if (phone === "") {
      $("#phoneError").text("Phone is required");
      $("#PhoneNumber").addClass("is-invalid");
      isValid = false;
    } else if (phone.length !== 10 || isNaN(phone)) {
      $("#phoneError").text("Enter 10 digit number");
      $("#PhoneNumber").addClass("is-invalid");
      isValid = false;
    } else {
      $("#PhoneNumber").addClass("is-valid");
    }

    if (dob === "") {
      $("#dobError").text("Select DOB");
      $("#DateofBirth").addClass("is-invalid");
      isValid = false;
    } else {
      $("#DateofBirth").addClass("is-valid");
    }

    if (pan === "") {
      $("#panError").text("PAN is required");
      $("#panNumber").addClass("is-invalid");
      isValid = false;
    } else if (pan.length !== 10) {
      $("#panError").text("PAN must be 10 characters");
      $("#panNumber").addClass("is-invalid");
      isValid = false;
    } else {
      $("#panNumber").addClass("is-valid");
    }

    if (isValid) {
      //   alert("Registration is Successful");

      let user = {
        email: email,
        password: password,
        phone: phone,
        dob: dob,
        pan: pan,
      };

      localStorage.setItem("user", user);
    }

    Swal.fire({
      title: "Registration Successful!",
      icon: "success",
      draggable: true,
    }).then(() => {
      window.location.href = "./dashboard.html";
    });
  });

  
  $("#login").click(function(){
    window.location.href="./login.html";
  });
});
