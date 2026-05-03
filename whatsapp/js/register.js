// PASSWORD TOGGLE
$(document)
.off("click", "#togglePassword")
.on("click", "#togglePassword", function () {
  let input = $("#password");
  let icon = $(this).find("i");

  if (input.attr("type") === "password") {
    input.attr("type", "text");
    icon.removeClass("bi-eye").addClass("bi-eye-slash");
  } else {
    input.attr("type", "password");
    icon.removeClass("bi-eye-slash").addClass("bi-eye");
  }
});


$(document)
.off("click", "#registerBtn")
.on("click", "#registerBtn", function () {

  let data = {
    username: $("#username").val().trim(),
    email: $("#email").val().trim(),
    phone: $("#phone").val().trim(),
    password: $("#password").val()
  };

  if (!data.username || !data.email || !data.phone || !data.password) {
    $("#message").html("<span class='text-danger'>All fields are required</span>");
    return;
  }
  $.ajax({
    url: "api/auth/register.php", 
    method: "POST",
    data: data,
    dataType: "json",
    success: function (response) {
        
        if (response.status) {
          loadPage("login");
        } else {
          $("#message").html("<span class='text-danger'>" + response.message + "</span>");
        }
    },
    error: function () {
      $("#message").html("<span class='text-danger'>Request failed</span>");
    }
  });

});

$(document)
.off("click", "#goLogin")
.on("click", "#goLogin", function (e) {
  e.preventDefault(); // stop page jump
  loadPage("login");
});


let typingTimer;
const delay = 400; 

$(document).on("input", "#username", function () {

  clearTimeout(typingTimer);

  const username = $(this).val().trim();

  if (!username) {
    clearLoginMessage();
    return;
  }

  if (username.length < 3) {
    showLoginMessage("Minimum 3 characters", "danger");
    return;
  }

  typingTimer = setTimeout(() => {

    $.ajax({
      url: "/api/auth/check-field.php",
      method: "GET",
      data: {
        field: "username",
        value: username
      },
      success: function (res) {
        

        if (res.data.exists) {
            console.log("hi");
          showMessage("Username already taken", "danger");
        } else {
          showMessage("Username available", "success");
        }

      }
    });

  }, delay);

});

function showMessage(msg, type = "danger") {
  $("#usernameMessage")
    .removeClass("text-danger text-success")
    .addClass("text-" + type)
    .text(msg)
    .show();
}

function clearMessage() {
  $("#usernameMessage").text("").hide();
}