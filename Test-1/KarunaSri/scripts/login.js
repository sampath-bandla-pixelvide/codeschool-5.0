console.log("Hello");

$(document).on("submit", "#loginForm", handleLogin);

function handleLogin(e) {
  e.preventDefault();

  let username = $("#username").val();
  let password = $("#password").val();

  let usernameIn = document.getElementById("username");
  let passwordIn = document.getElementById("password");

  let userNameError = document.querySelector(".usernameError");
  let passwordError = document.querySelector(".passwordError");
  console.log("User details" + username, password);

  const isUsernameValid = validateDetails(
    username,
    3,
    15,
    usernameIn,
    userNameError,
    "Username",
  );

  const isPasswordValid = validateDetails(
    password,
    3,
    15,
    passwordIn,
    passwordError,
    "Password",
  );

  if (!isUsernameValid || !isPasswordValid) {
    return;
  }

  loginAPI(username, password);
}

function validateDetails(value, min, max, inputEl, errorEl, fieldName) {
  inputEl.classList.remove("is-invalid");
  errorEl.textContent = "";

  if (!value) {
    inputEl.classList.add("is-invalid");
    errorEl.textContent = `${fieldName} is required`;
    return false;
  }

  if (value.length < min || value.length > max) {
    inputEl.classList.add("is-invalid");
    errorEl.textContent = `${fieldName} must be ${min}-${max} characters`;
    return false;
  }

  inputEl.classList.remove("is-invalid");
  return true;
}

async function loginAPI(username, password) {
  $.ajax({
    url: "https://dummyjson.com/user/login",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      username: username,
      password: password,
      expiresInMins: 30,
    }),
    success: (data) => {
      console.log("Response data  ", data);
      let token = data.accessToken;
      let name = data.username;
      localStorage.setItem("token", token);
      localStorage.setItem("user", name);
      localStorage.setItem("loggedIn", "true");

      console.log("Calling sweet alert!");
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Login Successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      $("#loginModal").modal("hide");

      $("#username").val("");
      $("#password").val("");

      setTimeout(() => {
        location.reload();
      }, 1500);
    },
    error: (err) => {
      console.error("Login failed:", err);

      Swal.fire({
        position: "top-center",
        icon: "error",
        title: "Invalid credentials!",
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });
}
