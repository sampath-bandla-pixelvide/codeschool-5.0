$(document).ready(function (){
  token = localStorage.getItem("token");
  if (token) {
  window.location.href = "./NewsPage.html";
}
  $("#loginBtn").click(function () {
    console.log("clicked")
     let inputUser = $("#inputUsername");
    let passWord = $("#inputPassword");
    console.log("jquery is working");
    let username = inputUser.val();
    let password = passWord.val();
   
    
    if (
    
    Validate(inputUser, 3, 20, "Username") &&
    Validate(passWord, 8, 15, "Password")
  ) {

    $.ajax({
      type: "POST",
      url: "https://dummyjson.com/auth/login",
      dataType:"json",
      data: {
        username,
        password
      },
      success: function (res) {
        console.log(res);
          localStorage.setItem("token", res.accessToken);
          window.location.href = "./NewsPage.html";
      },
      error: function (err) {
        console.log(err);
         console.log("invalid Credentials");
         $("#credentialsValidate").text(`Invalid Credentials`);
         $("#credentialsValidate").removeClass("d-none");
          $("#credentialsValidate").addClass("mb-1 fw-bold text-center");

      },
    });
  
}

  });
   function Validate(data, min, max, fieldId) {
  let value = $(data).val();
  if (value.length > max) {
    $(data).addClass("is-invalid");
    $(`#${fieldId}`).text(`${fieldId} should not be above ${max} characters`).removeClass("d-none");
    return false;
  }
  else if (value.length < min) {
    $(data).addClass("is-invalid");
   $(`#${fieldId}`).text(`${fieldId} should be ${min} characters`).removeClass("d-none") ;
    return false;
  } else {
    $(data).removeClass("is-invalid")
    $(`#${fieldId}`).addClass("d-none");
    return true;
  }}
});