$(document).ready(function () {
  if (localStorage.getItem("token")) {
    window.location.href = "chat.html";
  }

  const email = sessionStorage.getItem("pendingEmail");

  if (!email) {
    window.location.href = "index.html";
    return;
  }

  $("#displayEmail").text(email);

  $("#lastName").on("keydown", function (e) {
    if (e.key === "Enter") submitRegister();
  });
});

function submitRegister() {
  const email = sessionStorage.getItem("pendingEmail");
  const first_name = $("#firstName").val().trim();
  const last_name = $("#lastName").val().trim();

  clearError("nameError");

  if (!first_name || !last_name) {
    showError("nameError", "First name and last name are required.");
    return;
  }

  $("#registerBtn").prop("disabled", true).text("Creating account…");

  $.ajax({
    url: "api/complete_register.php",
    method: "POST",
    dataType: "json",
    data: { email, first_name, last_name },
    success: function (res) {
      if (res.status) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.removeItem("pendingEmail");
        window.location.href = "chat.html";
      } else {
        showError("nameError", res.message || "Registration failed.");
        $("#registerBtn").prop("disabled", false).text("Next");
      }
    },
    error: function () {
      showError("nameError", "Server error. Please try again.");
      $("#registerBtn").prop("disabled", false).text("Next");
    },
  });
}
function showError(id, msg) {
  $("#" + id).text(msg);
}
function clearError(id) {
  $("#" + id).text("");
}
