$(document).ready(function () {
  $("#backBtn").click(function () {
    window.location.href = "UserDashboard.html";
  });

  let imagesArray = [];

  function clearErrors() {
    $(".error").text("");
  }

  function validateForm() {
    clearErrors();

    let isValid = true;

    let title = $("#title").val().trim();
    let description = $("#description").val().trim();
    let location = $("#location").val().trim();
    let contact = $("#contact").val().trim();

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phoneRegex = /^[0-9]{10}$/;

    // title
    if (title === "") {
      $("#titleError").text("Title is required");
      isValid = false;
    } else if (title.length < 3) {
      $("#titleError").text("Minimum 3 characters required");
      isValid = false;
    }

    // description
    if (description === "") {
      $("#descriptionError").text("Description is required");
      isValid = false;
    } else if (description.length < 10) {
      $("#descriptionError").text("Minimum 10 characters required");
      isValid = false;
    }

    // location
    if (location === "") {
      $("#locationError").text("Location is required");
      isValid = false;
    } else if (location.length < 3) {
      $("#locationError").text("Invalid location");
      isValid = false;
    }

    // contact
    if (contact === "") {
      $("#contactError").text("Contact is required");
      isValid = false;
    } else if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
      $("#contactError").text("Enter valid email or 10 digit phone");
      isValid = false;
    }

    // images
    if (imagesArray.length === 0) {
      $("#imageError").text("Please upload at least one image");
      isValid = false;
    }

    return isValid;
  }

  $("#images").on("change", function () {
    $("#preview").html("");
    $("#imageError").text("");
    imagesArray = [];

    let files = this.files;

    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();

      reader.onload = function (e) {
        imagesArray.push(e.target.result);

        $("#preview").append(`
                    <img src="${e.target.result}" class="preview-img">
                `);
      };

      reader.readAsDataURL(files[i]);
    }
  });

  $("input, textarea").on("keyup", function () {
    $(this).next(".error").text("");
  });

  $("#itemForm").submit(function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    let user = JSON.parse(localStorage.getItem("user"));

    let data = {
      user_id: user.id,
      role: user.role,
      type: $("#type").val(),
      title: $("#title").val(),
      description: $("#description").val(),
      category: $("#category").val(),
      location: $("#location").val(),
      contact: $("#contact").val(),
      images: imagesArray,
    };

    $.ajax({
      url: "api/addItem.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        if (res.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Posted Successfully",
            text: "Item posted successfully",
          }).then(() => {
            window.location.href = "UserDashboard.html";
          });
        } else {
          alert(res.message);
        }
      },
    });
  });
});
