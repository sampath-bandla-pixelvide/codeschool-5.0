$(document).on("click", ".nav-link", function () {
  console.log("clicked");
});

$(document).on("click", "#sidebarToggle", function () {
  $(".sidebar").toggleClass("show");
});

$(document).on("click", "#logout", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

loadUsers();

function loadUsers() {
  $.ajax({
    url: "/api/users.php",
    method: "GET",
    dataType: "json",
    success: function (res) {
      let rows = "";

      res.forEach((u, i) => {
        rows += `
          <tr>
            <td>${i + 1}</td>
            <td>${u.first_name} ${u.last_name}</td>
            <td>${u.email}</td>
            <td>${u.phone}</td>
            <td>
              <button class="btn btn-sm btn-warning"
                onclick='editUser(${JSON.stringify(u)})'>
                Edit
              </button>

              <button class="btn btn-sm btn-danger"
                onclick="deleteUser(${u.id})">
                Delete
              </button>
            </td>
          </tr>
        `;
      });

      $("#userTable").html(rows);
    },
    error: (err) => {
      console.log(err);
    },
  });
}
