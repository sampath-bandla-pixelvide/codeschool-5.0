console.log("js loaded");

$(document).ready(function () {
  populateDays();

  window.toggleDropdown = function (id, event) {
    event.stopPropagation();
    $(".dropdown-list")
      .not("#" + id)
      .hide();
    $("#" + id).toggle();
    $("#dobError").hide();
  };

  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  window.selectItem = function (type, value) {
    $("#" + type + "Text").text(value);
    $("#" + type + "List").hide();

    if (type === "month") {
      $("#month").val(monthMap[value]);
    } else {
      $("#" + type).val(value);
    }

    if (type === "month" || type === "year") {
      populateDays();
    }
  };

  const months = Object.keys(monthMap);

  months.forEach((m) => {
    $("#monthList").append(
      `<div class="dropdown-item" onclick="selectItem('month','${m}')">${m}</div>`,
    );
  });

  const currentYear = new Date().getFullYear();

  for (let i = currentYear; i >= 1876; i--) {
    $("#yearList").append(
      `<div class="dropdown-item" onclick="selectItem('year','${i}')">${i}</div>`,
    );
  }

  function populateDays() {
    let month = $("#month").val();
    let year = $("#year").val();

    let days = 31;

    if (month && year) {
      days = new Date(year, month, 0).getDate();
    }

    $("#dayList").empty();

    for (let i = 1; i <= days; i++) {
      $("#dayList").append(
        `<div class="dropdown-item" onclick="selectItem('day','${i}')">${i}</div>`,
      );
    }
  }

  $(document).click(function () {
    $(".dropdown-list").hide();
  });

  function validateDOB() {
    let m = $("#month").val();
    let d = $("#day").val();
    let y = $("#year").val();

    if (!m || !d || !y) {
      $("#dobError")
        .text("Select your birthday. You can change this later.")
        .show();
      return false;
    }

    let date = new Date(`${y}-${m}-${d}`);

    if (
      date.getFullYear() != y ||
      date.getMonth() + 1 != parseInt(m) ||
      date.getDate() != parseInt(d)
    ) {
      $("#dobError")
        .text(
          "It looks like you entered the wrong info.Please be sure to use your real birthday.",
        )
        .show();
      return false;
    }

    let today = new Date();
    let age = today.getFullYear() - date.getFullYear();

    if (age < 13) {
      $("#dobError")
        .text(
          "It looks like you entered the wrong info.Please be sure to use your real birthday.",
        )
        .show();
      return false;
    }

    return true;
  }

  function setError(inputId, errorId, message) {
    let input = $("#" + inputId);
    let label = input.next("label");

    $("#" + errorId).text(message);

    input.addClass("input-error");
    label.addClass("label-error");
  }

  function clearError(inputId, errorId) {
    let input = $("#" + inputId);
    let label = input.next("label");

    $("#" + errorId).text("");

    input.removeClass("input-error");
    label.removeClass("label-error");
  }

  $("#signupForm").submit(function (e) {
    e.preventDefault();

    let contact = $("#email").val().trim();
    let password = $("#password").val().trim();
    let username = $("#username").val().trim();

    let valid = true;

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phonePattern = /^[6-9]\d{9}$/;

    if (
      !contact ||
      (!emailPattern.test(contact) && !phonePattern.test(contact))
    ) {
      setError(
        "email",
        "emailError",
        "Please enter a valid email address or mobile number",
      );
      valid = false;
    } else {
      clearError("email", "emailError");
    }

    let strongPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!password) {
      setError(
        "password",
        "passwordError",
        "Enter a combination of at least six numbers, letters and punctuation marks(like ! and &.",
      );
      valid = false;
    } else if (!strongPassword.test(password)) {
      setError(
        "password",
        "passwordError",
        "this password is too easy guess, please create a new one",
      );
      valid = false;
    } else {
      clearError("password", "passwordError");
    }

    let instaRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{3,30}$/;

    if (!username) {
      setError(
        "username",
        "usernameError",
        "Please select a username for your account.",
      );
      valid = false;
    } else if (!instaRegex.test(username)) {
      setError("username", "usernameError", "Invalid username format");
      valid = false;
    } else {
      clearError("username", "usernameError");
    }

    if (!validateDOB()) valid = false;

    if (!valid) return;

    $.ajax({
      url: "api/signup.php",
      method: "POST",
      data: $("#signupForm").serialize(),
      success: function (res) {
        console.log("raw", res);
        let response;
        try {
          response = typeof res === "string" ? JSON.parse(res) : res;
        } catch (e) {
          console.error("JSON ERROR:", res);
          return;
        }



        if (response.status === "success") {
          console.log("OTP:", response.otp);

          setTimeout(() => {
            window.location.href =
              window.location.href = `registerConfirm.html?contact=${encodeURIComponent(contact)}`;
          }, 2000);

        } else {
          alert(response.message);
        }
      },
    });
  });

  $("input").on("input", function () {
    let id = $(this).attr("id");
    clearError(id, id + "Error");
  });
});
