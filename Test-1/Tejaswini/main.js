$(document).ready(function () {
  fetchNews();
  const token = localStorage.getItem("token");

  if (token) {
    $("#signinBtn").hide();
    $("#registerBtn").hide();
    $("#logoutBtn").removeClass("d-none");
  } else {
    $("#signinBtn").show();
    $("#registerBtn").show();
    $("#logoutBtn").addClass("d-none");
  }

  $("#signinBtn").click(function (e) {
    e.preventDefault();
    location.href = "pages/login.html";
  });

  $("#registerBtn").click(function (e) {
    e.preventDefault();
    location.href = "pages/register.html";
  });

  $("#logoutBtn").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("token");
    Swal.fire("Logged out", "Logged out successfully", "success").then(() => {
      location.reload();
    });
    // Swal.fire("Logged out","Logged out successfully","success");
  });
});

const apiKey = "6979dc3ca9324bf689616d16c4169c53";

function fetchNews() {
  $.ajax({
    url: `https://newsapi.org/v2/everything?domains=wsj.com&pageSize=12&apiKey=${apiKey}`,
    method: "GET",
    success: function (data) {
      console.log(data.articles.length)
      displayNews(data.articles);
      displayFeatured(data.articles.slice(0, 7));
    },
    error: function () {
      alert("Error fetching news");
    },
  });
}

function displayNews(articles) {
  articles.forEach((article) => {
    const image = article.urlToImage;

    $("#newsContainer").append(`
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <img src="${image}" class="card-img-top" style="height:200px; object-fit:cover;">
          
          <div class="card-body">
            <h6 class="fw-bold">${article.title}</h6>
            <p class="text-muted small">
              ${article.description || "No description available"}
            </p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary">
              Read More
            </a>
          </div>
        </div>
      </div>
    `);
  });
}

function displayFeatured(articles) {
  articles.forEach((article) => {
    $("#featuredNews").append(`
      <div class="d-flex mb-3">
        <img src="${article.urlToImage}" width="80" height="60" style="object-fit:cover;" class="me-2 rounded">
        <div>
          <small class="text-muted">${new Date(article.publishedAt).toDateString()}</small>
          <p class="mb-0 small fw-bold">${article.title}</p>
        </div>
      </div>
    `);
  });
}



