$(document).ready(function () {
  // load components
  $("#header").load("./components/header.html", function () {
    updateAuthUI();
  });
  $("#footer").load("./components/footer.html");
  $("#modals").load("./components/auth-modal.html");

  // default page
  $("#main-content").load("./pages/home.html");

  $("#products").load("./pages/products.html");
});

function updateAuthUI() {
  const token = localStorage.getItem("token");

  if (token) {
    $("#login-link-item").addClass("d-none");
    $("#register-link-item").addClass("d-none");
    $("#logout-link-item").removeClass("d-none");
  } else {
    $("#login-link-item").removeClass("d-none");
    $("#register-link-item").removeClass("d-none");
    $("#logout-link-item").addClass("d-none");
  }
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loggedIn");

  Swal.fire({
    icon: "success",
    title: "Logged out successfully!",
    timer: 1500,
    showConfirmButton: false,
  }).then(() => {
    location.reload();
  });
}

// navigation loader
function loadPage(page) {
  $("#main-content").load(`./pages/${page}.html`);
}

function showInlineError(fieldId, message) {
  $(`#error-${fieldId}`).text(message);
  $(`#${fieldId}`).addClass("is-invalid");
}

function clearErrors() {
  $(".error-msg").text("");
  $(".form-control").removeClass("is-invalid");
}
