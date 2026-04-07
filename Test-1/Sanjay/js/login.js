$(document).ready(function () {
  let userName = $("#floatingUsername");
  let password = $("#floatingPassword");
  let loginBtn = $("#loginBtn");

  let passwordErrorMsg = $("#errPasswd");
  let userErrorMsg = $("#errUsername");

  function checkValidLogin() {
    fetch("https://dummyjson.com/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.ok) {
        window.location.replace("./home.html");
      }
    });
  }

  function checkValidity(element, min, max, errMsg) {
    let value = element.val();

    if (value.length < min) {
      errMsg.text(`The minimum length must be atleast ${min}`);
      element.addClass("is-invalid");
      return false;
    } else if (value.length > max) {
      errMsg.text(`The maximum length must be atmost ${max}`);
      element.addClass("is-invalid");
      return false;
    }

    return true;
  }

  function checkDetails() {
    passwordErrorMsg.text("");
    userErrorMsg.text("");
    userName.removeClass("is-invalid");
    password.removeClass("is-invalid");

    let userValid = checkValidity(userName, 3, 20, userErrorMsg);
    let passwdValid = checkValidity(password, 3, 20, passwordErrorMsg);

    if (userValid && passwdValid) {
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName.val(),
          password: password.val(),
        }),
      };

      fetch("https://dummyjson.com/auth/login", options)
        .then(async (response) => {
          if (!response.ok) {
            userName.val("");
            password.val("");

            Swal.fire({
              icon: "error",
              title: "Invalid Credentials",
              text: "Please try again!",
            });

            return;
          }

          let jsonData = await response.json();
          localStorage.setItem("token", jsonData.accessToken);

          window.location.replace("./home.html");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }

  loginBtn.on("click", checkDetails);

  checkValidLogin();
});
