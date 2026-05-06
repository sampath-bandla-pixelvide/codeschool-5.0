$(document).ready(function () {
  $("#loginBtn").click(function (e) {
    e.preventDefault();
    let contact = $("#emailInput").val().trim();
    let password = $("#passwordInput").val().trim();
    $("#emailError").hide();
    $("#passwordError").hide();
    if (!contact) {
      $("#emailError").text("Please enter email or mobile").show();
      return;
    }
    if (!password) {
      $("#passwordError").text("Please enter password").show();
      return;
    }
    $.ajax({
      url: "api/index.php",
      type: "POST",
      data: {
        contact: contact,
        password: password
      },
      success: function (res) {
        console.log("SERVER:", res);

        if (res === "email_error") {
          $("#emailError").show();
        } 
        else if (res === "password_error") {
          $("#passwordError").show();
        } 
        else if (res === "success") {
          window.location.href = "dashboard.html";
        } 
        else {
          alert("Something went wrong");
        }
      },
      error: function () {
        alert("Server error");
      }
    });

  });
});
