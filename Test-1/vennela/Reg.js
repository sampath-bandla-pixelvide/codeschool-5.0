$(document).ready(function () {

  $("form").submit(function (e) {
    e.preventDefault();

    let username = $("#username").val().trim();
    let email = $("#email").val().trim();
    let phone = $("#phone").val().trim();
    let password = $("#password").val().trim();
    let dob = $("#dob").val();
    let age = $("#age").val().trim();
    if (username.length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Enter valid email");
      return;
    }
    let Phonenumber = phone.replace(/[^\d]/g, "");
    if (Phonenumber.length !== 12) {
      alert("Phone must be 12 digits");
      return;
    }
    if (password.length < 5) {
      alert("Password must be at least 5 characters");
      return;
    }
    if (dob === "") {
      alert("Select Date of Birth");
      return;
    }
    if (age === "" || age < 1 || age > 100) {
      alert("Enter valid age");
      return;
    }
    $.ajax({
      url: "https://dummyjson.com/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        username: username,
        password: password,
        email: email,
        phone: phone,
        dob: dob,
        age: age
      }),

      success: function (response) {
        localStorage.setItem("token", response.token);
        Swal.fire({
          title: "Sign-Up Successful",
          text: "Welcome",
          icon: "success"
        }).then(() => {
          window.location.href = "home.html";
        });
      },

      error: function (err) {
        console.log("error:", err);
        Swal.fire({
          title: "Login Failed",
          text: "Invalid Credentials",
          icon: "error"
        });
      }
    });

  });

});