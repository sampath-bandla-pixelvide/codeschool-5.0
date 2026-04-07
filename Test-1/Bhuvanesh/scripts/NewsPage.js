$(document).ready(function () {
  let container = $("#mainContent");
  let api_key = "173e5075d24272bf4fba57367418642f";
  $("#logoutBtn").on("click", function () {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  });

  $.ajax({
    type: "GET",
    url: `https://gnews.io/api/v4/search?q=Google&lang=en&max=10&apikey=${api_key}`,
    success: function (res) {
      console.log(res);
      res.articles.forEach((articles) => {
        let card = `
           <div class="card col-md-3">
            <img src="${articles.image}" class="card-img-top" alt="newsimg">
           <div class="card-body">
            <h3>${articles.title}</h3>
            <p>${articles.description}</p>
            <a href=${articles.url}><button class="btn btn-primary px-3"><span>To View</span></button></a>
          </div>
      </div>
        `;
        container.append(card);
      });
    },
    error: function (err) {
      console.log(err);
    },
  });
  checkAccess();
  function checkAccess() {
    token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "./login.html";
    }
    fetch("https://dummyjson.com/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          logout();
          return;
        }
        return res.json();
      })
      .catch((err) => {
        console.error(err);
        console.log(err);
      });
  }
});
