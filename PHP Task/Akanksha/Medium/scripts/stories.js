$("#hamburger").click(function () {
  $("#sidebar").toggleClass("open");
});

$("#signout").click(function (e) {
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

function loadPosts() {
  $.ajax({
    url: "api/get_post.php",
    method: "GET",
    dataType: "json",

    success: function (res) {
      if (res.status) {
        let html = "";

        html += `
  <div class="mx-auto" style="max-width: 720px;">
    <h3 class="mt-3 mb-4">Stories</h3>
  </div>
`;

        if (res.data.length === 0) {
          html += `<p class="text-muted text-center">No stories yet...</p>`;
        }

        res.data.forEach((post) => {
          html += `
        <div class="mx-auto border-bottom mt-4" style="max-width: 720px;">

  <div class="post-card mb-4" data-id="${post.id}" style="cursor:pointer;">


    <h5 class="fw-bold mb-1">
      ${post.title}
    </h5>

  
    <p class="text-muted mb-2">
      ${post.content}
    </p>

  
    <div class="d-flex align-items-center justify-content-between">

      <small class="text-muted">
        ${new Date(post.created_at).toDateString()} · 
        ${Math.ceil(post.content.length / 200)} min read
      </small>

    
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary"
                onclick="editPost(${post.id})">
          Edit
        </button>

        <button class="btn btn-sm btn-outline-danger"
                onclick="deletePost(${post.id})">
          Delete
        </button>
      </div>

    </div>

  </div>

</div>

              `;
        });

        $("#postsContainer").html(html);
      }
    },
    error: function () {
      Swal.fire("Error", "Something went wrong", "error");
    },
  });
}

loadPosts();

function editPost(id) {
  $.ajax({
    url: "api/get_single_post.php",
    method: "GET",
    data: { id: id },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        $("#edit_id").val(res.data.id);
        $("#edit_title").val(res.data.title);
        $("#edit_content").val(res.data.content);

        $("#editModal").modal("show");
      }
    },
  });
}

$("#updatePostBtn").click(function () {
  $.ajax({
    url: "api/update_post.php",
    method: "POST",
    data: {
      id: $("#edit_id").val(),
      title: $("#edit_title").val(),
      content: $("#edit_content").val(),
    },
    success: function (res) {
      Swal.fire("Success", "Post updated", "success");
      $("#editModal").modal("hide");
      loadPosts();
    },
  });
});

function deletePost(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This post will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "api/delete_post.php",
        method: "POST",
        data: { id: id },
        success: function (res) {
          Swal.fire("Deleted!", "Post removed", "success");
          loadPosts();
        },
      });
    }
  });
}
