$(document).ready(function () {
  function calculateAge(dob) {
  let birthDate = new Date(dob);
  let today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  let monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 || 
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

  function validateForm(data) {
    let errors = {};

    if (!data.fname) errors.fname = "First name required";
    if (!data.lname) errors.lname = "Last name required";

    let phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(data.phone)) errors.phone = "Invalid phone";

    if (!data.dob) {
      errors.dob = "DOB required";
    } else {
      let age = calculateAge(data.dob);
      if (age < 18) errors.dob = "Must be 18+";
    }

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) errors.email = "Invalid email";

    if (data.username.length < 4) errors.username = "Min 4 chars";
 
    let passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passPattern.test(data.password)) {
      errors.password = "Min 8 chars, include A-Z, a-z, 0-9, special char";
    }

    return errors;
  }

  $("#registerForm").submit(function (e) {
    e.preventDefault();

    $(".error").text("");

    let data = {
      fname: $("#fname").val().trim(),
      lname: $("#lname").val().trim(),
      phone: $("#phone").val().trim(),
      dob: $("#dob").val(),
      email: $("#email").val().trim(),
      username: $("#username").val().trim(),
      password: $("#password").val().trim(),
    };

    let errors = validateForm(data);

    if (Object.keys(errors).length > 0) {
      if (errors.fname) $("#fnameErr").text(errors.fname);
      if (errors.lname) $("#lnameErr").text(errors.lname);
      if (errors.phone) $("#phoneErr").text(errors.phone);
      if (errors.dob) $("#dobErr").text(errors.dob);
      if (errors.email) $("#emailErr").text(errors.email);
      if (errors.username) $("#userErr").text(errors.username);
      if (errors.password) $("#passErr").text(errors.password);
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    swal
      .fire({
        title: "Success!",
        text: "Registration completed",
        icon: "success",
      })
      .then(() => {
        window.location.href = "NewsDashboard.html";
      });
  });
});
