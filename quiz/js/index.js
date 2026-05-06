$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (token) {
    window.location.replace("pages/dashboard.html");
  }
});
$("#showRegister").click(function (e) {
  e.preventDefault();
  $("#loginForm").hide();
  $("#registerForm").show();
});
$("#showLogin").click(function (e) {
  e.preventDefault();
  $("#registerForm").hide();
  $("#loginForm").show();
});

$("#registerBtn").click(function () {
  const name = $("#regName").val().trim();
  const email = $("#regEmail").val().trim();
  const password = $("#regPassword").val().trim();
  if (!name || !email || !password) {
    $("#registerError").text("All fields are required");
    return;
  }
  $.ajax({
    url:"/api/auth/register.php",
    method:"POST",
    dataType:"json",
    data:{
        name,email,password
    },
    success:function(res){
        if(res.status){
            $("#showLogin").click();   
        }
        else $("#registerError").text(res.message);
    }
  })
});

$("#loginBtn").click(function () {

  const email = $("#loginEmail").val().trim();
  const password = $("#loginPassword").val().trim();

  if (!email || !password) {
    $("#loginError").text("Email and password required");
    return;
  }

  $.ajax({
    url: "/api/auth/login.php",
    method: "POST",
    data:{
      email,
      password
    },
    success: function (res) {
      if (!res.status) {
        $("#loginError").text(res.message);
        return;
      }

      localStorage.setItem("token", res.data.token);
      window.location.replace("pages/dashboard.html");
    },
    error: function () {
      Swal.fire("Error", "All fields are required!", "error");
    }
  });

});
