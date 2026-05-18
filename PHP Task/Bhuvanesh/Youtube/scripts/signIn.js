$(document).ready(function () {
  
    $("#emailForm").on('submit',function(e){
         e.preventDefault(); 
        emailChecks();
    })

  function emailChecks() {
    let email = $("#email").val();
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "./api/php-scripts/emailCheck.php",
      data: {
        email
      },
      success: function (res) {
        if (!res.status) {
           if (res.message === 'DatabaseError! Try again Later') {
            Swal.fire("Error", res.message, "error").then(() => {
              window.location.href = "./index.html";
            });
          }
        } else {
          Swal.fire({
            title: "Success",
            text: `OTP: ${res.data.otp}`,
            icon: "success",
          }).then(() => {
            localStorage.setItem("temp_token", res.data.temp_token);
            window.location.href = "./otp.html";
          });
        }
      },
      error: function (err) {
        console.log(err.responseText);
      },
    });
  }
 
});
