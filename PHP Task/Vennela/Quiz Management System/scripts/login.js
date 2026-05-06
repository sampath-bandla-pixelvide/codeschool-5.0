function validateName(name) {
  if (!name) return "Name is required";
  if (name.length < 3) return "Name must be at least 3 characters";
  return "";
}
function validateEmail(email) {
  if (!email) return "Email is required";
  let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Invalid email format";
  return "";
}
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 6) return "Minimum 6 characters required";
  return "";
}
$(document).ready(function () {

  $("#loginForm").submit(function (e) {
    e.preventDefault();
    let name = $("#name").val().trim();
    let email = $("#email").val().trim();
    let password = $("#password").val().trim();

    $("#nameError, #emailError, #passwordError").text("");

    let nameError = validateName(name);
    let emailError = validateEmail(email);
    let passwordError = validatePassword(password);

    if (nameError) $("#nameError").text(nameError);
    if (emailError) $("#emailError").text(emailError);
    if (passwordError) $("#passwordError").text(passwordError);
    if (nameError || emailError || passwordError) return;

    $.ajax({
      url: "api/login.php",
      type: "POST",
      headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
      dataType: "json",
      data: { email, password },
      success: function (res) {
        console.log("login:", res);
        if (!res.status) {
          alert(res.message);
          return;
        }
        let role = res.data.role;
        console.log(role);
        localStorage.setItem("token", res.data.token);
      
          if (role === "admin") {
            // console.log("admin")
    window.location.href = "dashboard.html";
  } else {
    window.location.href = "user-dashboard.html";
  }
      },
      error: function (err) {
        console.log("ajax error:", err.responseText);
        alert("Server error");
      }
    });
  });
});
