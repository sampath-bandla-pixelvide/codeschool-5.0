$("#hamburger").click(function () {
  $("#sidebar").toggleClass("open");
});

$("#signout", "#logoutBtn").click(function (e) {
  e.preventDefault();

  $.ajax({
    url: "api/logout.php",
    method: "POST",
    success: function (res) {
      console.log("logout response:", res);
      window.location.href = "index.html";
    },
    error: function (err) {
      console.log("error:", err);
    },
  });
});

$("#publishPost").click(function () {
  const title = $("#postTitle").val();
  const content = $("#postContent").val();

  if (!title || !content) {
    Swal.fire("Error", "All fields required", "error");
    return;
  }

  $.ajax({
    url: "/api/create_post.php",
    method: "POST",
    data: {
      title: title,
      content: content,
    },
    dataType: "json",

    success: function (res) {
      if (res.status) {
        Swal.fire("Success", "Post created!", "success");

        $("#postTitle").val("");
        $("#postContent").val("");

        $("#writeModal").modal("hide");
      } else {
        Swal.fire("Error", res.message, "error");
      }
    },

    error: function () {
      Swal.fire("Error", "Something went wrong", "error");
    },
  });
});

function loadAllPosts() {
  $.ajax({
    url: "/api/get_all_posts.php",
    method: "GET",
    dataType: "json",

    success: function (res) {
      if (res.status) {
        let html = "";

        res.data.forEach((post) => {
          html += `
        <div class="mx-auto border-bottom " style="max-width: 720px;">
          <div class="post-card mb-4" data-id="${post.id}" style="cursor: pointer">
            <div class="d-flex justify-content-between">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-2">
                <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                    style="width:32px; height:32px; font-size:14px;">
                  ${post.name.charAt(0).toUpperCase()}
                </div>
                <p class="mt-3">${post.name}</p>
              </div>
              <h4 class="fw-bold mb-1" style="line-height:1.3;">
                ${post.title}
              </h4>

        
        <p class="text-muted mb-2" style="font-size:15px;">
          ${post.content.substring(0, 120)}...
        </p>
        <div class="d-flex align-items-center justify-content-between">

          <small class="text-muted">
            ${formatLastMsgTime(post.created_at)} · 
            ${Math.ceil(post.content.length / 200)} min read
          </small>

          <div class="d-flex gap-3 text-muted">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" aria-labelledby="clap-filled-static-desc" viewBox="0 0 16 16"><desc id="clap-filled-static-desc">A clap icon</desc><path fill="#6B6B6B" fill-rule="evenodd" d="m3.672 10.167 2.138 2.14h-.002c1.726 1.722 4.337 2.436 5.96.81 1.472-1.45 1.806-3.68.76-5.388l-1.815-3.484c-.353-.524-.849-1.22-1.337-.958-.49.261 0 1.56 0 1.56l.78 1.932L6.43 2.866c-.837-.958-1.467-1.108-1.928-.647-.33.33-.266.856.477 1.598.501.503 1.888 1.957 1.888 1.957.17.174.083.485-.093.655a.56.56 0 0 1-.34.163.43.43 0 0 1-.317-.135s-2.4-2.469-2.803-2.87c-.344-.346-.803-.54-1.194-.15-.408.406-.273 1.065.11 1.447.345.346 2.31 2.297 2.685 2.67l.062.06c.17.175.269.628.093.8-.193.188-.453.33-.678.273a.9.9 0 0 1-.446-.273S2.501 6.84 1.892 6.23c-.407-.406-.899-.333-1.229 0-.525.524.263 1.28 1.73 2.691.384.368.814.781 1.279 1.246m8.472-7.219c.372-.29.95-.28 1.303.244V3.19l1.563 3.006.036.074c.885 1.87.346 4.093-.512 5.159l-.035.044c-.211.264-.344.43-.74.61 1.382-1.855.963-3.478-.248-5.456L11.943 3.88l-.002-.037c-.017-.3-.039-.71.203-.895" clip-rule="evenodd"></path></svg></span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6B6B6B" aria-labelledby="response-filled-16px-desc" viewBox="0 0 16 16"><desc id="response-filled-16px-desc">A response icon</desc><path fill="#6B6B6B" d="M12.344 11.458A5.28 5.28 0 0 0 14 7.526C14 4.483 11.391 2 8.051 2S2 4.483 2 7.527c0 3.051 2.712 5.526 6.059 5.526a6.6 6.6 0 0 0 1.758-.236q.255.223.554.414c.784.51 1.626.768 2.512.768a.37.37 0 0 0 .355-.214.37.37 0 0 0-.03-.384 4.7 4.7 0 0 1-.857-1.958v.014z"></path></svg>
            </span>
            <span>⋯</span>
          </div>

        </div>

      </div>

    </div>

  </div>

</div>`;
        });

        $("#postsContainer").html(html);
      }
    },
  });
}

loadAllPosts();

$(document).on("click", ".post-card", function () {
  let id = $(this).data("id");

  window.location.href = `readPost.html?id=${id}`;
});

function loadUserInfo() {
  $.ajax({
    url: "api/get_profile.php",
    method: "GET",
    dataType: "json",

    success: function (res) {
      console.log(res);
      if (res.status) {
        $("#userName").text(res.data.name);
        $("#userEmail").text(maskEmail(res.data.email));

        let initial = res.data.name.charAt(0).toUpperCase();
        $("#userinital").first().text(initial);
      }
    },
  });
}

loadUserInfo();

function maskEmail(email) {
  let [name, domain] = email.split("@");

  let visible = name.substring(0, 3);
  let masked = visible + "*".repeat(name.length - 3);

  return masked + "@" + domain;
}

function formatLastMsgTime(time) {
  if (!time) return "";

  const msgDate = new Date(time);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );
  const diffDays = Math.floor((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return msgDate.toLocaleDateString([], { weekday: "long" });
  }
  return msgDate.toLocaleDateString();
}

//data-id="${post.id}" style="cursor:pointer;"

// $(document).on("click", ".post-card", function () {
//   let id = $(this).data("id");

//   console.log("post id:", id);
//   openReadMode(id);
// });

// function openReadMode(id) {
//   $.ajax({
//     url: "api/get_post_by_id.php",
//     method: "GET",
//     data: { id: id },
//     dataType: "json",

//     success: function (res) {
//       if (res.status) {

//         $("#read_title").text(res.data.title);
//         $("#read_content").text(res.data.content);
//         $("#read_author").text(res.data.name);
//         $("#read_date").text(new Date(res.data.created_at).toDateString());

//         let modal = new bootstrap.Modal(document.getElementById("readModal"));
//         modal.show();
//       } else {
//         Swal.fire("Error", res.message, "error");
//       }
//     },
//   });
// }
