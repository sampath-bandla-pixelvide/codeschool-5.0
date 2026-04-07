let allNews = [];
let showAll = false;

$(document).ready(function () {

  const API_KEY = "pub_ec4cb7e3e7e5427b891d5297c8db9acb";
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en`;


  $.ajax({
    url: url,
    method: "GET",
    success: function (response) {
      console.log(response);

      allNews = response.results || [];

      if (allNews.length === 0) {
        $("#newsContainer").html("<p>No news found</p>");
        return;
      }

      renderNews(allNews.slice(0, 4));
    },
    error: function () {
      $("#newsContainer").html("<p>Failed to load news</p>");
    }
  });


  $("#seeAllBtn").click(function () {
    if (showAll) {
      renderNews(allNews.slice(0, 4));
      $(this).text("See All");
      showAll = false;
    } else {
      renderNews(allNews);
      $(this).text("Show Less");
      showAll = true;
    }
  });
});



function renderNews(newsArray) {
  $("#newsContainer").empty();

  newsArray.forEach(function (item) {

    let image = item.image_url || "https://via.placeholder.com/300x200";

    let description = item.description
      ? item.description.substring(0, 100)
      : "No description available";

    let card = `
      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <img src="${image}" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text">${description}...</p>
            <a href="${item.link}" target="_blank" class="btn btn-primary">Read More</a>
          </div>
        </div>
      </div>
    `;

    $("#newsContainer").append(card);
  });
}
$(document).ready(function () {

  const API_KEY = "pub_ec4cb7e3e7e5427b891d5297c8db9acb";

  function fetchBusinessNews() {
    const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&category=business&country=in&language=en`;

    $.ajax({
      url: url,
      method: "GET",
      success: function (response) {
        console.log(response);

        let news = response.results || [];
        renderBusiness(news.slice(0, 4)); // show 4 cards like UI
      },
      error: function () {
        $("#businessContainer").html("<p>Failed to load news</p>");
      }
    });
  }

  fetchBusinessNews();
});


// 🔥 Render Function (THIS is where most people fail)
function renderBusiness(newsArray) {
  $("#businessContainer").empty();

  newsArray.forEach(function (item) {

    let image = item.image_url || "https://via.placeholder.com/300x200";
    let title = item.title || "No title";
    let source = item.source_id || "Unknown";
    let time = "• " + (item.pubDate ? "recent" : "unknown");
    let category = item.category ? item.category[0] : "Business";

    let card = `
      <div class="col-md-3 mb-4">
        <div class="card h-100">

          <img src="${image}" alt="news">

          <div class="card-body">

            <p class="meta">${source} ${time}</p>

            <h6 class="card-title">${title}</h6>

            <p class="category">${category} • 10 min read</p>

          </div>
        </div>
      </div>
    `;

    $("#businessContainer").append(card);
  });
}