$(document).ready(function () {
  $("#registerBtn").on("click", function (e) {
    console.log("clicked");
    e.preventDefault();

    let inputUser = $("#UsernameInput");
    let passWord = $("#Password");
    let Pan = $("#PanInput");
    let Email = $("#EmailInput");
    let confirmPwd = $("#confirmPassword");
    let Dob = $("#DateofBirth")

    let username = inputUser.val();
    let password = passWord.val();
    let email = Email.val();
    let pan = Pan.val();
    let confirm = confirmPwd.val();
    let dob = Dob.val();

    function check(password, confirm) {
      if (password === confirm) {
        $("#confirm").addClass("d-none");
        return true;
      } else {
        $("#confirm").text("Passwords do not match").removeClass("d-none");
        return false;
      }
    }

    if (
      !(
        SemiValidate(inputUser, 3, 20, "Username") &&
        SemiValidate(passWord, 8, 15, "Password") &&
        EmailValidate(Email, "Email") &&
        PanValidate(Pan, "PanNo") &&
        check(password, confirm) && 
        Dob(dob,"")
      )
    ) {
      console.log("not success");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "invalid",
      });
      return false;
    } else {
      $.ajax({
        type: "POST",
        url: "https://dummyjson.com/users/add",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          username: username,
          password: password,
          email: email,
          pan:pan,
          dob:dob
        }),
        success: function (res) {
          console.log(res);
          window.location.href = "./Login.html";
        },
        error: function (err) {
          console.log(err);
        },
      });
    }
  });
  function SemiValidate(data, min, max, fieldId) {
    let value = $(data).val();

    if (value.length > max) {
      $(data).addClass("is-invalid");
      $(`#${fieldId}`)
        .text(`${fieldId} should not exceed ${max} characters`)
        .removeClass("d-none");
      return false;
    } else if (value.length < min) {
      $(data).addClass("is-invalid");
      $(`#${fieldId}`)
        .text(`${fieldId} should be at least ${min} characters`)
        .removeClass("d-none");
      return false;
    } else {
      $(data).removeClass("is-invalid");
      $(`#${fieldId}`).addClass("d-none");
      return true;
    }
  }

  function EmailValidate(data, fieldId) {
    let email = $(data).val();
    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (pattern.test(email)) {
      $(data).removeClass("is-invalid");
      $(`#${fieldId}`).addClass("d-none");
      return true;
    } else {
      $(data).addClass("is-invalid");
      $(`#${fieldId}`).text("Enter a valid email").removeClass("d-none");
      return false;
    }
  }

  function PanValidate(data, fieldId) {
    let pan = $(data).val().toUpperCase();
    let pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (pattern.test(pan)) {
      $(data).removeClass("is-invalid");
      $(`#${fieldId}`).addClass("d-none");
      return true;
    } else {
      $(data).addClass("is-invalid");
      $(`#${fieldId}`)
        .text("Enter valid PAN (ABCDE1234F)")
        .removeClass("d-none");
      return false;
    }
  }
   function DOb(dob){
    if (dob === "") {
      $("#dobError").text("Select DOB");
      $("#DateofBirth").addClass("is-invalid");
      isValid = false;
    } else {
      $("#DateofBirth").addClass("is-valid");
    }
   }
});
