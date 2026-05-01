$(document).ready(() => {
  $("#passwordBtn").on("click", () => {
    window.location.replace("../index.html");
  });

  $("#passwordBtnNew").on("click", () => {
    window.location.replace("../index.html");
  });

  $("#signUpBtn").on("click", () => {
    window.location.replace("../register.html");
  });

  $("#loginForm").on("click", (e) => {
    e.preventDefault();

    const email = $("#floatingInput").val();

    let flag = false;

    if (!isValidEmail(email)) {
      emailError.text("Please enter a valid email address!");
      emailEl.addClass("is-invalid");
      flag = true;
    }

    function isValidEmail(email) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    }

    if(flag){
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/generateOtp.php",
      data: { email },
      dataType: "json",
      success: function (response) {
        if (!response) {
          Swal.fire({
            icon: "error",
            text: response.message,
            background: "#1e1e1e",
            color: "#fff",
            confirmButtonColor: "#e50914",
          });
          return;
        }
        console.log(response);
        $("#floatingEmail").val(email);
        $("#loginDiv").addClass("d-none");
        $("#otpDiv").removeClass("d-none");
        $(document).on("click", "#verifyOtp", () => {
          const otp = $("#floatingOtp").val();
          $.ajax({
            type: "POST",
            url: "../api/otpFetch.php",
            data: { email, otp },
            dataType: "json",
            success: function (response) {
              if (response.status) {
                const name = response.data.first_name;
                localStorage.setItem("user", name);
                localStorage.setItem("token", response.data.token);
                window.location.replace("../home.html");
              }
            },
          });
        });
      },
      error: function () {
        Swal.fire({
          icon: "error",
          text: "Can not login",
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#e50914",
        });
      },
    });
  });
});
