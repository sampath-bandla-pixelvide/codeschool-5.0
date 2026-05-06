const buttons = document.querySelectorAll("#topMenu .top-btn");
const mainFeed = document.getElementById("mainFeed");
const sidebar = document.getElementById("leftSidebar");
let selectedFile = null;
const pages = {
  home: `
    <div class="card p-2 mb-3 border-0 main-card">
      <div class="d-flex align-items-center">
        <img id="postProfileImg"
     src="./Images/profile.png"
     class="rounded-circle me-2"
     style="height: 3em; width: 3em;">
        <div class="inside-search-box">
          <input type="text" placeholder="What's on your mind?">
        </div>
        <div class="d-flex align-items-center gap-2 ms-2">
          <img id="liveBtn"
               src="https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp"
               height="30" width="30">
          <img id="photoBtn"
               src="https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp"
               height="30" width="30">
          <img id="feelingBtn"
               src="https://static.xx.fbcdn.net/rsrc.php/y6/r/k77WaOhKN9t.webp"
               height="30" width="30">
        </div>
      </div>
      <input type="file" id="fileInput" hidden accept="image/*,video/*">
    </div>
    <div id="postsContainer"></div>
  `,
  reels: `<div>Reels Page</div>`,
  friends: `<div>Friends Page</div>`,
  groups: `<div>Groups Page</div>`,
};
mainFeed.innerHTML = pages.home;
initProfileMenu();
attachHomeEvents();
loadPosts();
buttons.forEach((btn) => {
  btn.addEventListener("click", function () {
    buttons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    const page = this.dataset.page;
    mainFeed.innerHTML = pages[page];
    if (page === "home") {
      sidebar.style.display = "block";
      attachHomeEvents();
      loadPosts();
    } else {
      sidebar.style.display = "none";
    }
  });
});

function attachHomeEvents() {
  const photoBtn = document.getElementById("photoBtn");
  const fileInput = document.getElementById("fileInput");
  const modal = document.getElementById("postModal");
  const closeModal = document.getElementById("closeModal");
  const preview = document.getElementById("previewContainer");
  if (!photoBtn || !fileInput || !modal || !preview) return;
  photoBtn.onclick = () => {
    console.log("ok");
    fileInput.click();
  };
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    selectedFile = file;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image")) {
      preview.innerHTML = `<img src="${url}" style="width:100%">`;
    } else {
      preview.innerHTML = `<video controls style="width:100%">
                             <source src="${url}">
                           </video>`;
    }
    modal.classList.remove("d-none");
  };
  if (closeModal) {
    closeModal.onclick = () => {
      modal.classList.add("d-none");
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitPost");

  if (submitBtn) {
    submitBtn.onclick = () => {
      const text = $("#modalText").val();

      let formData = new FormData();
      formData.append("text", text);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      $.ajax({
        url: "api/upload.php",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          console.log("UPLOAD:", data);
          $("#postModal").addClass("d-none");
          $("#modalText").val("");
          $("#previewContainer").html("");
          selectedFile = null;

          if (typeof loadPosts === "function") {
            loadPosts();
          }
        },
        error: function (err) {
          console.error("Upload error:", err);
        },
      });
    };
  }

  $.ajax({
    url: "api/getUser.php",
    type: "GET",
    dataType: "json",
    success: function (user) {
      if (user.error) return;

      const nameEl = document.getElementById("userName");
      const imgEl = document.getElementById("userImg");
      const profileIcon = document.getElementById("postProfilePic");
      const postProfilePic = document.getElementById("postProfilePic");
      const postImg = document.getElementById("postProfileImg");

      if (nameEl) {
        nameEl.innerText =
          (user.first_name || "") + " " + (user.last_name || "");
      }

      if (imgEl) {
        imgEl.src = "Images/" + (user.profile_pic || "profile.png");
      }

      if (profileIcon) {
        profileIcon.src = "Images/" + (user.profile_pic || "profile.png");
      }

      if (postProfilePic) {
        postProfilePic.src = "Images/" + (user.profile_pic || "profile.png");
      }

      if (postImg) {
        postImg.src = "Images/" + (user.profile_pic || "profile.png");
      }
    },
    error: function (err) {
      console.error("User fetch error:", err);
    },
  });
});
function loadPosts() {
  $.ajax({
    url: "/api/getPosts.php",
    method: "GET",
    dataType: "json",
    success: function (data) {
      const container = document.getElementById("postsContainer");
      if (!container) return;

      container.innerHTML = "";
      data.forEach((post) => {
        let media = "";

        if (post.file) {
          if (post.file.match(/\.(mp4|webm)/)) {
            media = `<video controls style="width:100%">
                        <source src="${post.file}">
                     </video>`;
          } else {
            media = `<img src="${post.file}" style="width:100%">`;
          }
        }

        // container.innerHTML += `
        // <div class="post" data-post-id="${post.id}"> 
        //   <div class="card mb-3 border-0 shadow-sm">
        //     <div class="d-flex align-items-center p-3">
        //       <img src="Images/${post.profile_pic || "profile.png"}"
        //            class="rounded-circle me-2"
        //            style="width:40px;height:40px;">
        //       <div>
        //         <div style="font-weight:600;">
        //           ${post.full_name || "User"}
        //         </div>
        //         <div style="font-size:12px;color:#65676b;">
        //           ${formatTime(post.created_at)} 
        //         </div>
        //       </div>
        //     </div>
        //     ${post.text ? `<div class="px-3 pb-2">${post.text}</div>` : ""}
        //     ${media ? `<div>${media}</div>` : ""}
        //    <div class="post-actions d-flex py-2">
        //   <button class="action-btn like-btn">
        //     <i class="bi bi-hand-thumbs-up"></i>
        //      <span class="like-count">${post.like_count}</span>
        //   </button>
        //   <button class="action-btn comment-btn">
        //     <i class="bi bi-chat"></i>
        //   </button>
        //   <button class="action-btn share-btn">
        //     <i class="bi bi-share"></i>
        //   </button>
        // </div>
        //   </div>
        //   </div>
        // `;
        container.innerHTML += `
  <div class="post" data-post-id="${post.id}"> 
    <div class="card mb-3 border-0 shadow-sm position-relative">

      <!-- 3 DOT MENU -->
      <div class="post-menu position-absolute top-0 end-0 p-2">
        <i class="fas fa-ellipsis-v" onclick="toggleMenu(this)"></i>

        <div class="dropdown-menu-custom d-none">
          <button onclick="deletePost(this)" class="dropdown-item text-danger">
            Delete
          </button>
        </div>
      </div>

      <!-- HEADER -->
      <div class="d-flex align-items-center p-3">
        <img src="Images/${post.profile_pic || "profile.png"}"
             class="rounded-circle me-2"
             style="width:40px;height:40px;">
        <div>
          <div style="font-weight:600;">
            ${post.full_name || "User"}
          </div>
          <div style="font-size:12px;color:#65676b;">
            ${formatTime(post.created_at)} 
          </div>
        </div>
      </div>

      ${post.text ? `<div class="px-3 pb-2">${post.text}</div>` : ""}
      ${media ? `<div>${media}</div>` : ""}

      <div class="post-actions d-flex py-2">
        <button class="action-btn like-btn">
          <i class="bi bi-hand-thumbs-up"></i>
          <span class="like-count">${post.like_count}</span>
        </button>
        <button class="action-btn comment-btn">
          <i class="bi bi-chat"></i>
        </button>
        <button class="action-btn share-btn">
          <i class="bi bi-share"></i>
        </button>
      </div>

    </div>
  </div>
`;
      });
    },
    error: function (err) {
      console.error("Error fetching posts:", err);
    },
  });
}
function formatTime(time) {
  const now = new Date();
  const postTime = new Date(time);
  const diff = Math.floor((now - postTime) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + "min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return postTime.toLocaleDateString();
}
function initProfileMenu() {
  const profileIcon = document.getElementById("postProfilePic");
  const profileMenu = document.getElementById("profileMenu");

  if (profileIcon && profileMenu) {
    profileIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      profileMenu.classList.toggle("d-none");
    });
  }

  document.addEventListener("click", function (e) {
    if (!profileIcon || !profileMenu) return;

    if (!profileIcon.contains(e.target) && !profileMenu.contains(e.target)) {
      profileMenu.classList.add("d-none");
    }
  });
  $(document).on("click", "#logoutBtn", function () {
    $.ajax({
      url: "api/logout.php",
      type: "GET",
      success: function () {
        window.location.href = "index.html";
      },
    });
  });
  $(document).on("click", "#uploadProfile", function () {
    $("#profileFile").click();
  });
  $(document).on("change", "#profileFile", function () {
    let file = this.files[0];
    if (!file) return;
    let newUrl = URL.createObjectURL(file);
    $("#userImg").attr("src", newUrl);
    $("#postProfilePic").attr("src", newUrl);
    let formData = new FormData();
    formData.append("file", file);
    $.ajax({
      url: "api/uploadProfile.php",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
    });
  });
}
$(document).on("click", ".like-btn", function () {
  console.log("LIKE CLICKED");
  let btn = $(this);
  let postDiv = btn.closest(".post");
  let postId = postDiv.attr("data-post-id");
  console.log("POST ID:", postId);
  $.ajax({
    url: "api/like.php",
    method: "POST",
    data: { post_id: postId },
    dataType: "json",
    success: function (data) {
      //console.log("SERVER RESPONSE:", data);
      btn.find(".like-count").text(data.likes);
      btn.toggleClass("liked", data.liked);
    },
    error: function (err) {
      console.log("ERROR:", err);
    },
  });
});
let commentModal;
$(document).on("click", ".comment-btn", function () {
  const commentModal = new bootstrap.Modal(document.getElementById("commentModal"));
  let post = $(this).closest(".post");
  let postId = post.attr("data-post-id");
  currentPostId = postId;
  commentModal.show();
  $.ajax({
    url: "api/getComments.php",
    method: "GET",
    data: { post_id: postId },
    dataType: "json",
    success: function (data) {
      let html = "";

      data.forEach((c) => {
        html += `
          <div class="mb-2">
            <b>${c.full_name || "User"}:</b> ${c.comment}
          </div>
        `;
      });

      $("#modalCommentsList").html(html);
    },
    error: function (xhr) {
      console.log("Error:", xhr.responseText);
    }
  });
});
$(document).on("keypress", "#modalCommentInput", function (e) {
  if (e.which === 13) {
    let input = $(this);
    let text = input.val().trim();
    if (!text) return;
    $.ajax({
      url: "api/comment.php",
      type: "POST",
      data: {
        post_id: currentPostId,
        comment: text
      },
      dataType: "json",
      success: function (res) {
        $("#modalCommentsList").prepend(`
          <div class="mb-2">
            <b>You:</b> ${res.comment}
          </div>
        `);
        input.val("");
      },
      error: function (err) {
        console.log("Error:", err.responseText);
      }
    });
  }
});

$(document).on("click", "#postCommentBtn", function () {
  console.log("CLICK WORKING");
  let input = $("#modalCommentInput");
  let text = input.val().trim();
  if (!text) return;
  $.ajax({
    url: "api/comment.php",
    type: "POST",
    data: {
      post_id: currentPostId,
      comment: text
    },
    dataType: "json",
    success: function (res) {
      $("#modalCommentsList").prepend(`
        <div class="comment-item d-flex mb-2">
          <img src="Images/${res.profile_pic || "profile.png"}"
               class="rounded-circle me-2"
               style="width:32px;height:32px;">
          <div>
            <div style="font-weight:300;">
              ${res.full_name}
            </div>
            <div>${res.comment}</div>
          </div>
        </div>
      `);
      input.val("");
    },
    error: function (err) {
      console.log("Error:", err.responseText);
    }
  });
});
function toggleMenu(icon) {
  let menu = icon.nextElementSibling;

  $(".dropdown-menu-custom").addClass("d-none");
  $(menu).toggleClass("d-none");
}

function deletePost(btn) {
   console.log("DELETE CLICKED");
  let postDiv = $(btn).closest(".post");
  let postId = postDiv.attr("data-post-id");
   console.log("POST ID:", postId);
  $.ajax({
    url: "api/deletePost.php",
    type: "POST",
    data: { post_id: postId },
    dataType: "json",
    success: function (res) {
      if (res.success) {
        postDiv.remove();
      } else {
        alert(res.error);
      }
    },
      error: function (xhr) {
      console.log("ERROR RESPONSE:", xhr.responseText);
    }
    
  });
}