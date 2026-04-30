$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to access profile",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  

  loadProfile();

  function loadProfile() {
    $.ajax({
      url: "api/get_profile.php",
      method: "POST",
      data: { token: token },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }

        let user = response.data;

        $("#name").val(user.name);
        $("#email").val(user.email);
        $("#phone").val(user.phone);
      },

      error: function () {
        Swal.fire("Error", "Failed to load profile", "error");
      },
    });
  }

  $("#updateProfileBtn").click(function () {
    let name = $("#name").val().trim();
    let email = $("#email").val().trim();
    let phone = $("#phone").val().trim();

    $("#nameError").text("");
    $("#emailError").text("");
    $("#phoneError").text("");

    let isValid = true;

    if (name === "") {
      $("#nameError").text("Name is required");
      isValid = false;
    } else if (name.length < 3) {
      $("#nameError").text("Name must be at least 3 characters");
      isValid = false;
    }

    if (email === "") {
      $("#emailError").text("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#emailError").text("Enter valid email");
      isValid = false;
    }

    if (phone === "") {
      $("#phoneError").text("Phone is required");
      isValid = false;
    } else if (!/^[6-9][0-9]{9}$/.test(phone)) {
      $("#phoneError").text("Enter valid 10-digit number starting with 6-9");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      url: "api/update_profile.php",
      method: "POST",
      data: {
        name: name,
        email: email,
        phone: phone,
        token: token,
      },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }

        Swal.fire("Success", "Profile updated successfully", "success");
      },

      error: function () {
        Swal.fire("Error", "Update failed", "error");
      },
    });
  });
});
