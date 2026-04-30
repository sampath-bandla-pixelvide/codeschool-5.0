$(document).on("submit", "#registerForm", handleRegister);

function handleRegister(e) {
  e.preventDefault();
  clearErrors();

  const user = {
    name: $("#reg-name").val().trim(),
    email: $("#reg-email").val().trim(),
    password: $("#reg-password").val(),
    mobile: $("#reg-mobile").val().trim(),
    pan: $("#reg-pan").val().trim(),
    dob: $("#reg-dob").val(),
  };

  if (!validateRegister(user)) return;

  // store in localStorage
  localStorage.setItem("user", JSON.stringify(user));

  Swal.fire({
    icon: "success",
    title: "Registered Successfully!",
    timer: 1500,
    showConfirmButton: false,
  });

  $("#registerModal").modal("hide");
  $("#registerForm")[0].reset();
}

function validateRegister(user) {
  let isValid = true;

  // name
  if (!user.name) {
    showInlineError("reg-name", "Name is required");
    isValid = false;
  } else if (user.name.length < 3) {
    showInlineError("reg-name", "Name must be at least 3 characters");
    isValid = false;
  }

  // email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email) {
    showInlineError("reg-email", "Email is required");
    isValid = false;
  } else if (!emailRegex.test(user.email)) {
    showInlineError("reg-email", "Invalid email address");
    isValid = false;
  }

  // password
  if (!user.password) {
    showInlineError("reg-password", "Password is required");
    isValid = false;
  } else if (user.password.length < 6) {
    showInlineError("reg-password", "Password must be at least 6 characters");
    isValid = false;
  }

  // mobile
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!user.mobile) {
    showInlineError("reg-mobile", "Mobile number is required");
    isValid = false;
  } else if (!mobileRegex.test(user.mobile)) {
    showInlineError(
      "reg-mobile",
      "Invalid mobile number (10 digits starting with 6-9)"
    );
    isValid = false;
  }

  // PAN
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
  if (!user.pan) {
    showInlineError("reg-pan", "PAN number is required");
    isValid = false;
  } else if (!panRegex.test(user.pan)) {
    showInlineError("reg-pan", "Invalid PAN format (e.g., ABCDE1234F)");
    isValid = false;
  }

  // DOB
  if (!user.dob) {
    showInlineError("reg-dob", "Date of Birth is required");
    isValid = false;
  }

  return isValid;
}
