$(document).ready(function () {
  const token = localStorage.getItem("token");
  if (token) {
    $.ajax({
      type: "POST",
      url: "./api/php-scripts/user.php",
      dataType: "json",
      headers: { Authorization: "Bearer " + token },
     
       success: function (res) {
  if (res.status) {
    let user = res.data;
    if (user.role_id === 1) {
      window.location.replace("./admin.html");
    } else {
      window.location.replace("./home.html");
    }
  } else {
    localStorage.removeItem("token");
    window.location.replace("./index.html");
  }
}
      ,
      error: function () {
        localStorage.removeItem("token");
        window.location.replace("./index.html");
      },
    });
  }

  $(".emailForm").submit((e) => {
    e.preventDefault();
    let email = $("#email").val();
    $("#email").removeClass("is-invalid");
    $("#emailError").text("").addClass("d-none");

    if (!isValidEmail(email)) {
      $("#emailError")
        .text("Please enter a valid email address!")
        .removeClass("d-none");
      $("#email").addClass("is-invalid");
      return;
    }

    $.ajax({
      type: "POST",
      url: "./api/php-scripts/email.php",
      dataType: "json",
      data: { email },
      success: function (res) {
        if (res.status) {
          
          $("form").removeClass("emailForm");
          $("form").addClass("passwordForm");
          $(".form-floating").html(`<div class="form-floating m-3">
            <input type="hidden" id="email" value="${email}" />
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                  />
                  <label for="password" class="form-label text-dark"
                    >Password</label>
                </div>
            <p id="passwordError" class="d-none text-danger m-0"></p>`);
          $("button").text("Login");
        } else {
          Swal.fire("Oops...", res.message, "error");
          $("#emailError").text(res.message).removeClass("d-none");
          $("#email").addClass("is-invalid");
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  });

  $(document).on("submit", ".passwordForm", function (e) {
    e.preventDefault();
    let email = $("#email").val();
    let password = $("#password").val();
    $("#password").removeClass("is-invalid");
    $("#passwordError").text("").addClass("d-none");

    if (!isValidPassword(password)) {
      $("#passwordError")
        .html(
          `
        • Must be 5–20 characters <br>
        • Must include uppercase, lowercase<br>
        • Must include special character
      `,
        )
        .removeClass("d-none");
      $("#password").addClass("is-invalid");
      return;
    }

    $.ajax({
      type: "POST",
      url: "./api/php-scripts/index.php",
      dataType: "json",
      data: { email, password },
      success: function (res) {
       console.log(res.data);
          if (res.status) {

            localStorage.setItem("token", res.data.token);
            if (res.data.role_id === 1) {
              window.location.replace("./admin.html");
            } else {
              window.location.replace("./home.html");
            }
        } else {
          Swal.fire("Oops...", res.message, "error");
          $("#password").addClass("is-invalid");
          $("#passwordError").text(res.message).removeClass("d-none");
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  });

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function isValidPassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{5,20}$/;
    return regex.test(password);
  }
});
