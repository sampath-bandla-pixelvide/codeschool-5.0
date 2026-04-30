$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Please login to view your watchlist",
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }
  

  loadWatchlist();

  function loadWatchlist() {
    $.ajax({
      url: "api/get_watchlist.php",
      method: "POST",
      data: { token: token },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }

        let movies = response.data;
        let html = "";

        if (movies.length === 0) {
          html = `
            <div class="text-center text-secondary py-5">
              <i class="bi bi-bookmark-x fs-2"></i>
              <p class="mt-2">Your watchlist is empty</p>
            </div>
          `;
        } else {
          movies.forEach(function (movie) {
            html += `
              <div class="col-lg-3 col-md-4 col-sm-6 mb-4 movie-col">
                <div class="card bg-imdb-card text-white border-0 movie-card">
                  <img src="${movie.image}" class="card-img-top movie-img">

                  <div class="card-body">
                    <h6 class="movie-title">${movie.title}</h6>
                    <p>${movie.release_year}</p>

                    <button class="btn btn-warning w-100 viewDetailsBtn" data-id="${movie.id}">
                      View Details
                    </button>

                    <button class="btn btn-danger w-100 mt-2 removeWatchlistBtn" data-id="${movie.id}">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            `;
          });
        }

        $("#watchlistContainer").html(html);
      },

      error: function (err) {
        console.log(err);
        Swal.fire("Error", "Failed to load watchlist", "error");
      },
    });
  }

  $(document).on("click", ".viewDetailsBtn", function () {
    let movieId = $(this).data("id");
    window.location.href = "movie-details.html?id=" + movieId;
  });

  $(document).on("click", ".removeWatchlistBtn", function () {
    let movieId = $(this).data("id");

    $.ajax({
      url: "api/remove_watchlist.php",
      method: "POST",
      data: {
        movie_id: movieId,
        token: token,
      },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        Swal.fire("Success", response.message, "success");
        loadWatchlist();
      },
    });
  });
});
