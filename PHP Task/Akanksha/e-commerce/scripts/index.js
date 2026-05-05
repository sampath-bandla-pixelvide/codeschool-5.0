$(document).ready(() => {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "dashboard.html";
  }
  let url = new URL(window.location);
  let registered = url.searchParams.get("registered");
  if (registered) {
    Swal.fire("success", "Registered Successfully", "success");
    url.searchParams.delete("registered");
    window.history.replaceState({}, "", url.toString());
  }
});

function login() {
  const email = $("#email").val();
  const password = $("#password").val();

  $.ajax({
    method: "POST",
    url: "/api/login.php",
    data: {
      email,
      password,
    },
    success: (rawRes) => {
      const res = JSON.parse(rawRes);
      if (!res.status) {
        Swal.fire("Error", res.message, "warning");
        return;
      }
      console.log(res);

      const role = res.data.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_id", res.data.id);
      localStorage.setItem("role", role);
      //window.location.href = "/../dashboard.html";

      if (role === "admin") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "user_dashboard.html";
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
}
