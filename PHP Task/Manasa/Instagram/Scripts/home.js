window.onload = function () {
  console.log("WINDOW LOADED");
  loadFeed();
  loadCurrentUser();
  loadUser();
};
function loadUser() {
  $.ajax({
    url: "api/getUser.php",
    method: "GET",
    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;

      if (response.status === "success") {
        let user = response.data;

        $("#username").text(user.username);
        $("#fullname").text(user.fullname);

        if (user.profile_pic) {
          $("#profileImage")
            .attr("src", "api/" + user.profile_pic)
            .show();
          $("#cameraIcon").hide();
        }

        if (user.profile_pic) {
          $(".sidebar-profile").html(`
                            <img src="api/${user.profile_pic}" 
                                 style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
                        `);
        }
        if (user.profile_pic) {
          $("#sideBarProfile").html(`
                            <img src="api/${user.profile_pic}" 
                                 style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
                        `);
        }
      } else {
        window.location.href = "index.html";
      }
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  let homeBtn = document.getElementById("homeBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", function () {
      console.log("Home clicked");
      loadFeed();
    });
  } else {
    console.log("homeButtonn NOT FOUND");
  }
});

function loadFeed() {
  fetch("api/getAllPosts.php")
    .then((res) => res.json())
    .then((response) => {
      console.log("API RESPONSE:", response);

      if (response.status !== "success") {
        console.log("Error loading posts");
        return;
      }

      let posts = response.posts;

      let container = document.getElementById("homeFeed");
      container.innerHTML = "";

      posts.forEach((post) => {
        container.innerHTML += `
    <div class="card mb-4" style="width:500px;">

      <div class="p-2 d-flex align-items-center gap-2">

        ${
          post.profile_pic
            ? `<img src="api/${post.profile_pic}" 
                 style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
            : `<i class="bi bi-person-circle"></i>`
        }

        <b>${post.username}</b>
      </div>

      <img src="api/${post.image}" class="img-fluid">

      <div class="p-2 d-flex justify-content-between align-items-center">

        <div class="d-flex gap-3 fs-5">
        <i class="bi ${post.is_liked == 1 ? "bi-heart-fill text-danger" : "bi-heart"} like-btn" data-id="${post.id}"></i>
          <i class="bi bi-chat comment-btn"></i>
          <i class="bi bi-send"></i>
        </div>

       <i class="bi ${post.is_saved == 1 ? "bi-bookmark-fill" : "bi-bookmark"} save-btn" data-id="${post.id}"></i>

      </div>

    </div>
  `;
      });
    })
    .catch((err) => {
      console.log("FETCH ERROR:", err);
    });
}

$(document).on("click", ".save-btn", function () {
  let btn = $(this);
  let postId = btn.data("id");

  $.ajax({
    url: "api/toggleSave.php",
    method: "POST",
    data: { post_id: postId },

    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;

      if (response.status === "success") {
        if (response.action === "saved") {
          btn.removeClass("bi-bookmark").addClass("bi-bookmark-fill");
        } else {
          btn.removeClass("bi-bookmark-fill").addClass("bi-bookmark");
        }
      }
    },
  });
});

$(document).on("click", ".like-btn", function () {
  let btn = $(this);
  let postId = btn.data("id");

  console.log("CLICKED POST:", postId);

  $.ajax({
    url: "api/toggleLike.php",
    method: "POST",
    data: { post_id: postId },

    success: function (res) {
      console.log("RAW RESPONSE:", res);

      let response = typeof res === "string" ? JSON.parse(res) : res;

      if (response.status === "success") {
        if (response.action === "liked") {
          btn.removeClass("bi-heart").addClass("bi-heart-fill text-danger");
        } else {
          btn.removeClass("bi-heart-fill text-danger").addClass("bi-heart");
        }
      }
    },
  });
});

function loadCurrentUser() {
  fetch("api/getUser.php")
    .then((res) => res.json())
    .then((response) => {
      console.log("USER API:", response);

      if (response.status !== "success") {
        console.log("User not logged in");
        return;
      }

      let user = response.data;

      document.getElementById("currentUsername").innerText = user.username;
      document.getElementById("currentFullname").innerText = user.fullname;
    })
    .catch((err) => {
      console.log("Error fetching user:", err);
    });
}
