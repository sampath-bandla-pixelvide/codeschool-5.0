$(document).ready(function () {
  $("#loginBtn").click(function () {
    let username = $("#username").val().trim();
    let password = $("#password").val().trim();

    $("#userError").text("");
    $("#passError").text("");

    let isValid = true;

    if (username.length < 3) {
      $("#userError").text("Username must contain more than 3 characters");
      isValid = false;
    }

    if (password.length < 3) {
      $("#passError").text("Password must contain more than 3 characters");
      isValid = false;
    }

    if (!isValid) return;

    let storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      Swal.fire({
        title: "No Account Found",
        text: "Please register first",
        icon: "warning",
      });
      return;
    }

    if (username === storedUser.username && password === storedUser.password) {
      localStorage.setItem("isLoggedIn", "true");

      Swal.fire({
        title: "Login Success!",
        text: "Redirecting...",
        icon: "success",
      }).then(() => {
        window.location.href = "NewsDashboard.html";
      });
    } else {
      Swal.fire({
        title: "Login Failed",
        text: "Invalid Username or Password",
        icon: "error",
      });
    }
  });
});

// $(document).ready(function () {
//   $("#loginBtn").click(function () {
//     let username = $("#username").val().trim();
//     let password = $("#password").val().trim();

//     $("#userError").text("");
//     $("#passError").text("");

//     let isValid = true;
//     if (username.length < 3) {
//       $("#userError").text("Username must contain more than 3 characters");
//       isValid = false;
//     } else if (username.length > 12) {
//       $("#userError").text("Username must be less than 12 characters");
//       isValid = false;
//     }
//     if (password.length < 3) {
//       $("#passError").text("Password must contain more than 3 characters");
//       isValid = false;
//     } else if (password.length > 12) {
//       $("#passError").text("Password must be less than 12 characters");
//       isValid = false;
//     }
//     if (isValid) {
//       $.ajax({
//         url: "https://dummyjson.com/auth/login",
//         method: "POST",
//         contentType: "application/json",
//         data: JSON.stringify({
//           username: username,
//           password: password,
//         }),

//         success: function (data) {
//           localStorage.setItem("user", JSON.stringify(data));
//           Swal.fire({
//             title: "login success!",
//             text: "Move to home page",
//             icon: "success",
//           }).then(() => {
//             window.location.href = "NewsDashboard.html";
//           });
//         },

//         error: function () {
//           Swal.fire({
//             title: "Login failed",
//             text: "Invalid Credentials..!",
//             icon: "error",
//           });
//         },
//       });
//     }
//   });
// });
