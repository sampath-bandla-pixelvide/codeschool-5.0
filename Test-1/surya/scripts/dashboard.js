$(document).ready(function () {
  const users_per_page = 4;
  let usersData = [];
  let currentPage = 1;

  $.ajax({
    type: "GET",
    url: "https://dummyjson.com/users",
    success: function (response) {
      usersData = response.users;
      callUsers();
      Pagination();
    },
  });

  function callUsers() {
    let start = (currentPage - 1) * users_per_page;
    let end = start + users_per_page;
    let users = usersData.slice(start, end);

    let html = "";

    users.forEach((user) => {
      html += `
        <div class="d-flex align-items-center justify-content-between border-bottom p-3 mb-2">
          
          <div class="d-flex align-items-center gap-3">
            <img src="${user.image}" width="20" height="20" class="rounded-circle"/>
            
            <div>
              <strong>${user.firstName} ${user.lastName}</strong><br/>
              <small>${user.email}</small>
            </div>
          </div>

          <div>
            <span class="badge bg-success">Admin</span>
            <span class="badge bg-primary">Data Export</span>
            <span class="badge bg-secondary">Data Import</span>
          </div>

          <div>
          <span>last date</span>
          <span>date added</span>
          </div>
          
          <div>
        <i class="bi bi-three-dots-vertical"></i>
          </div>

        </div>
      `;
    });

    $("#userList").html(html);
  }

  function Pagination() {
    let totalPages = Math.ceil(usersData.length / users_per_page);
    let html = "";

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    $("#pagination").html(html);
  }

  $(document).on("click", ".page-link", function (res) {
    res.preventDefault();
    currentPage = parseInt($(this).data("page"));
    callUsers();
    Pagination();
  });
});

$("#logout").click(function () {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});



$("#searchUser").on("keyup", function () {
  let username = $(this).val(); 

  $.ajax({
    type: "GET",
    url: "https://dummyjson.com/users/search?q=" + username, 
    success: function (response) {
      let output = "";

      response.foreach((item) => {
        output += `
        <div class="card mb-2" style="width: 18rem;">
          <img src="${item.image}" class="card-img-top">

          <div class="card-body">
            <h5 class="card-title">
              ${item.firstName} ${item.users[i].lastName}
            </h5>

            <p class="card-text">
              ${item.email}
            </p>
          </div>
        </div>
        `;
      });
      $("#userList").html(output);
    },
  });
});

let username = document.getElementById("")
