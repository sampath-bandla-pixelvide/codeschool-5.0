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

function loadFollowing() {

  $.ajax({
    url: "/api/get_following.php",
    method: "GET",
    dataType: "json",

    success: function (res) {

      let html = "";

      if (!res.status || res.data.length === 0) {
        html = "<p>No following users</p>";
      } else {

        res.data.forEach(user => {
          html += `
            <div class="d-flex justify-content-between align-items-center border p-2 mb-2 rounded">
              <span>${user.name}</span>
              <button class="btn btn-sm btn-dark follow-btn" data-user-id="${user.id}">
                Following
              </button>
            </div>
          `;
        });

      }

      $("#followingList").html(html);
    }
  });
}

loadFollowing();