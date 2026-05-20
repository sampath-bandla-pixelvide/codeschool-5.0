$(document).ready(function () {
  // Password toggle
  $("#togglePassword").click(function () {
    const input = $("#passwordInput");
    const icon = $(this).find("i");
    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("bi-eye").addClass("bi-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("bi-eye-slash").addClass("bi-eye");
    }
  });

  // Login submission
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    const btn = $("#loginBtn");
    const originalText = btn.html();

    btn
      .prop("disabled", true)
      .html(
        '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...',
      );

    const data = {
      email: $('input[name="email"]').val(),
      password: $('input[name="password"]').val(),
    };

    App.apiRequest("auth/login", "POST", data)
      .then((response) => {
        if (response.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          App.showToast("success", "Login successful!");
          setTimeout(() => (window.location.href = "dashboard.html"), 1000);
        } else {
          App.showToast("error", response.message);
          btn.prop("disabled", false).html(originalText);
        }
      })
      .catch((err) => {
        const msg = err.responseJSON
          ? err.responseJSON.message
          : "Server connection failed";
        App.showToast("error", msg);
        btn.prop("disabled", false).html(originalText);
      });
  });
});
