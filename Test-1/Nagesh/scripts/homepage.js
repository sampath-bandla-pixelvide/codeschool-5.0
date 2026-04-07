$(document).ready(function () {
  function fetchNews() {
    $("#newsContainer").html("<h4 class='text-center'>Loading...</h4>");

    $.ajax({
      url: "https://newsdata.io/api/1/latest",
      method: "GET",

      data: {
        apikey: "pub_4821dc75076341b69be53e49e1277724",
      },

      success: function (response) {
        console.log(response);

        const news = response.results;
        $("#newsContainer").empty();

        if (!news || news.length === 0) {
          $("#newsContainer").html(
            "<h4 class='text-center'>No news found</h4>",
          );
          return;
        }

        news.forEach(function (item) {
          const image =
            item.image_url ||
            "https://via.placeholder.com/300x200?text=No+Image";

          const card = `
            <div class="col-md-4">
              <div class="card h-100 shadow-sm">
                   <img 
                    src="${image}" 
                    class="card-img-top" 
                    alt="news"
                    onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image';"
                    />
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text">
                    ${
                      item.description
                        ? item.description.substring(0, 100)
                        : "No description"
                    }...
                  </p>
                  <a href="${item.link}" target="_blank" class="btn btn-primary">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          `;

          $("#newsContainer").append(card);
        });
      },

      error: function (err) {
        console.log(err);
        Swal.fire({
          title: "Network slow",
          icon: "warning",
        });
      },
    });
  }
  fetchNews();

  $("#menuToggle").click(function () {
  $(".collapse-menu").toggleClass("show-menu");
});
});
