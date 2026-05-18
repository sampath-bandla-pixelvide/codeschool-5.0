$(document).ready(() => {
  const existingToken = localStorage.getItem("token");
  const existingRole  = localStorage.getItem("role");
  if (existingToken) {
    if (existingRole === "admin") {
      window.location.replace("./admin.html");
    } else {
      window.location.replace("./movies.html");
    }
    return;
  }
  emptyText();
  $("#loginForm").submit((e) => {
    e.preventDefault();
    const email    = $("#floatingInput").val();
    const password = $("#floatingPassword").val();
    let flag = true;
    if (!validateEmail(email)) {
      $("#emailError").text("Enter a valid email");
      flag = false;
    }
    if (!validatePassword(password)) {
      $("#passwordError").text("Enter a valid password");
      flag = false;
    }
    function validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
    function validatePassword(password) {
      const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
      return regex.test(password);
    }
    if (!flag) return;
    $.ajax({
      type: "POST",
      url: "./api/index.php",
      data: { email, password },
      dataType: "json",
      success: function (response) {
        if (response && response.status) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user",  response.data.first_name);
          localStorage.setItem("role",  response.data.role || "user");
          Swal.fire({
            icon: "success",
            title: "Welcome back!",
            text: "Logged in successfully.",
            confirmButtonColor: "#e94560",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            if (response.data.role === "admin") {
              window.location.replace("./admin.html");
            } else {
              window.location.replace("./movies.html");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login failed",
            text: response?.message || "Invalid credentials.",
            confirmButtonColor: "#e94560",
          }).then(() => { emptyText(); });
        }
      },
      error: function (xhr) {
        let msg = "Could not reach server.";
        try { const r = JSON.parse(xhr.responseText); if (r.message) msg = r.message; } catch (ignore) {}
        Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#e94560" })
          .then(() => { emptyText(); });
      },
    });
  });
  function emptyText() {
    $("#passwordError").text("");
    $("#emailError").text("");
    $("#floatingInput").val("");
    $("#floatingPassword").val("");
  }
});
