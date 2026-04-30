$(document).ready(function () {
  let selectedFile = null;
  let selectedPostId = null;

  $(".bi-gear-wide").click(function () {
    $("#settingsModal").show();
    $("#modalOverlay").show();
  });

  $("#closeModal").click(function () {
    $("#settingsModal").hide();
    $("#modalOverlay").hide();
  });

  $("#closeProfileModal").click(function () {
    $("#profileModal").hide();
    $("#modalOverlay").hide();
  });

  $("#modalOverlay").click(function (e) {
    if (e.target.id !== "modalOverlay") return;

    $("#settingsModal, #profileModal, #viewPostModal, #deleteModal").hide();
    $("#modalOverlay").hide();
  });

  $("#logoutBtn").click(function () {
    fetch("api/logout.php")
      .then((res) => res.json())
      .then((response) => {
        if (response.status === "success") {
          window.location.href = "login.html";
        }
      });
  });

  $(document).on("click", "#cancelDelete", function () {
    console.log("cancel clicked");
    $("#deleteModal").hide();
    $("#modalOverlay").hide();
  });

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
        } else {
          window.location.href = "index.html";
        }
      },
    });
  }

  loadUser();

  $.ajax({
    url: "api/getPosts.php",
    method: "GET",
    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;

      if (response.status === "success" && response.posts.length > 0) {
        $("#gettingStartedCards").addClass("d-none");
        $("#postsContainer").removeClass("d-none");

        response.posts.forEach((post) => {
          $("#postsContainer").append(`
                        <div class="post" data-id="${post.id}">
                            <img src="api/${post.image}" 
                                 style="width:100%; height:100%; object-fit:cover;">
                        </div>
                    `);
        });

        $("#postCount").text(response.posts.length);
      }
    },
  });

  function loadSavedPosts() {
    let container = $("#savedPostsContainer");

    container.empty();

    $.ajax({
      url: "api/getSavedPosts.php",
      method: "GET",
      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.posts || response.posts.length === 0) {
          container.html('<p class="text-center mt-5">No saved posts</p>');
          return;
        }

        response.posts.forEach((post) => {
          container.append(`
          <div class="saved-item">
            <img src="api/${post.image}">
          </div>
        `);
        });
      },
    });
  }

  $(document).on("click", ".post", function () {
    let postId = $(this).attr("data-id");
    selectedPostId = postId;

    $("#viewPostModal").attr("data-id", postId);

    let imgSrc = $(this).find("img").attr("src");

    $("#viewPostImg").attr("src", imgSrc);
    $("#modalUsername").text($("#username").text());

    $("#viewPostModal").show();
    $("#modalOverlay").show();
  });

  $(document).on("click", "#postOptions", function (e) {
    e.stopPropagation();

    selectedPostId = $("#viewPostModal").attr("data-id");

    console.log("Selected for delete:", selectedPostId);

    $("#deleteModal").show();
    $("#modalOverlay").show();
  });

  $(document).on("click", "#confirmDelete", function () {
    console.log("Deleting ID:", selectedPostId);
    if (!selectedPostId) {
      alert("Post ID missing");
      return;
    }

    $.ajax({
      url: "api/deletePost.php",
      method: "POST",
      data: { post_id: selectedPostId },

      success: function (res) {
        console.log("DELETE RESPONSE:", res);

        let response = typeof res === "string" ? JSON.parse(res) : res;
        if (response.status === "success") {
          location.reload();
        } else {
          alert(response.message);
        }
      },
      error: function () {
        alert("Delete failed");
      },
    });
  });

  $(".tab").click(function () {
    let index = $(this).index();

    $(".tab").removeClass("active");
    $(this).addClass("active");

    $(".tab-content").removeClass("active");
    $(".tab-content").eq(index).addClass("active");

    if (index === 1) {
      loadSavedPosts();
    }
  });

  $("#openUpload").click(function () {
    $("#uploadModal").modal("show");

    $("#step1").removeClass("d-none");
    $("#step2, #step3, #step4").addClass("d-none");

    $("#nextBtn, #sharePostBtn").addClass("d-none");
  });

  $("#profilePicBox").click(function () {
    $("#profileModal").show();
    $("#modalOverlay").show();
  });

  $("#uploadNew").click(function () {
    $("#profileInput").click();
  });

  $("#profileInput")
    .off("change")
    .on("change", function () {
      let file = this.files[0];
      if (!file) return;

      let formData = new FormData();
      formData.append("profile", file);

      $("#uploadSpinner").show();

      $.ajax({
        url: "api/uploadProfile.php",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,

        success: function (res) {
          let response = typeof res === "string" ? JSON.parse(res) : res;

          $("#uploadSpinner").hide();
          $("#profileModal").hide();
          $("#modalOverlay").hide();

          if (response.status === "success") {
            loadUser();
          }
        },
      });
    });

  $("#removePhoto").click(function () {
    $.ajax({
      url: "api/removeProfile.php",
      method: "POST",

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (response.status === "success") {
          $("#profileImage").hide();
          $("#cameraIcon").show();

          $("#profileModal").hide();
          $("#modalOverlay").hide();
        }
      },
    });
  });
});
