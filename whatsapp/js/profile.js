$(document).on("click", "#profileBtn", function () {
  $("#chatListPanel").addClass("d-none");
  $("#newChatPanel").addClass("d-none");

  $("#profilePanel").removeClass("d-none");
  loadProfilePanel();
});

$(document).on("click", "#backToChatsFromProfile", function () {
  $("#profilePanel").addClass("d-none");

  $("#chatListPanel").removeClass("d-none");
});

$(document).on("click", "#logoutBtn", function () {
  $.ajax({
    url: "/api/auth/logout.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {
        console.log(res);

      // clear token AFTER backend update
      localStorage.removeItem("token");

      window.location.href = "/index.html";
    }
  });
});

$(document).on("click", "#chatTabBtn", function () {
  $("#chatListPanel").removeClass("d-none");
  $("#newChatPanel").addClass("d-none");

  $("#editProfilePanel").addClass("d-none");
  $("#profilePanel").addClass("d-none");
});

$(document).on("click", "#editProfileBtn", function () {
  $("#profilePanel").addClass("d-none");
  $("#editProfilePanel").removeClass("d-none");

  loadProfileData();
});


$(document).on("click", "#backToProfile", function () {

  $("#editProfilePanel").addClass("d-none");
  $("#profilePanel").removeClass("d-none");
  loadProfilePanel();
});

// Click pencil → enable editing
$(document).on("click", "#editNameBtn", function () {
  let currentName = $("#nameDisplay").text();

  $("#nameDisplay").addClass("d-none");

  $("#nameInput").removeClass("d-none").val(currentName).focus();
});

$(document).on("keydown", "#nameInput", function (e) {
  if (e.key === "Enter") {
    let newName = $(this).val().trim();

    if (!newName) return;

    // UI update
    $("#nameDisplay").text(newName).removeClass("d-none");
    $("#nameInput").addClass("d-none");

    updateNameAPI(newName);
  }
});
$(document).on("click", "#changePasswordBtn", function () {
  $("#changePasswordSection").toggleClass("d-none");

  // reset fields
  $("#newPassword").val("");
  $("#confirmPassword").val("");
  $("#passwordMsg").text("");
});
$(document).on("click", "#savePasswordBtn", function () {
  let newPass = $("#newPassword").val().trim();
  let confirmPass = $("#confirmPassword").val().trim();

  if (!newPass || !confirmPass) {
    $("#passwordMsg")
      .text("Please fill both fields")
      .css("color", "red");
    return;
  }

  if (newPass !== confirmPass) {
    $("#passwordMsg")
      .text("Passwords do not match ")
      .css("color", "red");
    return;
  }


  $.ajax({
    url: "/api/auth/change-password.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: {
      password: newPass,
    },
    success: function (res) {
        // console.log(newPass);
      if (res.status) {
        $("#passwordMsg")
          .text("Password updated successfully ")
          .css("color", "green");

        $("#newPassword").val("");
        $("#confirmPassword").val("");
        $("#changePasswordSection").toggleClass("d-none");
      } else {
        $("#passwordMsg")
          .text(res.message)
          .css("color", "red");
      }
    },
  });
});

function loadProfilePanel() {
  $.ajax({
    url: "/api/auth/me.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {
      if (res.status) {
        const u = res.data;

        $("#profileName").text(u.username);

        if (u.profile_picture) {
            //left-bottomm icon
            $("#profileImg")
      .attr("src", u.profile_picture)
      .removeClass("d-none");

    $("#defaultProfileIcon").addClass("d-none");

          $("#profileAvatar").html(`
            <img src="${u.profile_picture}" 
                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
          `);
        } else {
          
          let initial = u.username.charAt(0).toUpperCase();
          $("#profileAvatar").text(initial);
        }
      }
    },
  });
}

// in edit
function loadProfileData() {
  $.ajax({
    url: "/api/auth/me.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        const u = res.data;
        $("#nameDisplay").text(u.username);
        if (u.profile_picture) {
          $("#editProfileImg").attr("src", u.profile_picture);
        } else {
          $("#editProfileImg").attr("src", "https://via.placeholder.com/120");
        }
      }
    },
  });
}
// shows img on frontend before upload
$(document).on("change", "#profileInput", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      $("#editProfileImg").attr("src", e.target.result);
    };

    reader.readAsDataURL(file);
  }
});

$(document).on("click","#saveProfileBtn",function(){
    let formData = new FormData();
    let name = $("#nameInput").is(":visible")
    ? $("#nameInput").val().trim()
    : $("#nameDisplay").text();

  formData.append("name", name);
  let file = $("#profileInput")[0].files[0];
  if (file) {
    formData.append("profile_picture", file);
  }
  $.ajax({
    url: "/api/auth/update-profile.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: formData,
    processData: false,   
    contentType: false,   
    success: function (res) {
      if (res.status) {

    
        $("#nameDisplay").text(name);
        $("#nameInput").addClass("d-none");
        $("#nameDisplay").removeClass("d-none");
        
        

      } else {
        alert(res.message);
      }
    },
  });
})