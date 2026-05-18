// function checkLoggedUser() {
//   let token = localStorage.getItem("token");

//   if (!token) {
//     $("#authBtn").click(function () {
//       window.location.href = "login.html";
//     });
//     return;
//   }

//   $.ajax({
//     url: "api/get_logged_user.php",
//     method: "POST",
//     data: { token: token },

//     success: function (res) {
//       let response = typeof res === "string" ? JSON.parse(res) : res;

//       if (!response.status) {
//         localStorage.removeItem("token");
//         return;
//       }

//       let user = response.data;

//       $("#authArea").html(`
//           <div class="dropdown">

//             <button class="btn btn-warning dropdown-toggle fw-bold px-3"
//                     data-bs-toggle="dropdown">
//               <i class="bi bi-person-circle me-1"></i> ${user.name}
//             </button>

//             <ul class="dropdown-menu dropdown-menu-end shadow bg-dark text-white border-0">

//               <li class="px-3 py-2 border-bottom">
//                 <div class="fw-bold">${user.name}</div>
//                 <small class="text-secondary">${user.phone}</small>
//               </li>

//               <li>
//                 <a class="dropdown-item text-warning" href="watchlist.html">
//                   <i class="bi bi-bookmark me-2"></i> Watchlist
//                 </a>
//               </li>

//               <li>
//                 <a class="dropdown-item text-warning" href="#">
//                   <i class="bi bi-star me-2"></i> Your Ratings
//                 </a>
//               </li>

//               <li><hr class="dropdown-divider bg-secondary"></li>

//               <li>
//                 <button class="dropdown-item text-danger fw-bold" id="logoutBtn">
//                   <i class="bi bi-box-arrow-right me-2"></i> Sign out
//                 </button>
//               </li>

//             </ul>

//           </div>
//         `);
//     },
//   });
// }

function loadMovies() {
  $.ajax({
    url: "api/get_movies.php",
    method: "GET",

    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;

      let movies = response.data;

      showMovies("#featuredMovies", movies.slice(0, 20));
      showMovies("#topMovies", movies.slice(8, 14));
      showMovies("#fanMovies", movies.slice(14, 20));
    },
  });
}

function showMovies(container, movies) {
  let html = "";

  movies.forEach((movie) => {
    let rating = parseFloat(movie.rating);

    html += `
<div class="col-lg-3 col-md-4 col-sm-6 mb-4 movie-col">
  <div class="card bg-imdb-card text-white border-0 movie-card">
    <img src="${movie.image}" class="card-img-top movie-img">

    <div class="card-body">
      <h6 class="movie-title">${movie.title}</h6>
      <p>${movie.release_year}</p>

      <div class="imdb-rating mb-2">
        <span class="text-warning fs-4">★</span>
        ${!isNaN(rating) ? rating.toFixed(1) : "N/A"}
      </div>

      <button class="btn btn-warning w-100 viewDetailsBtn" data-id="${movie.id}">
        View Details
      </button>

      <button class="btn btn-outline-light w-100 mt-2 addWatchlistBtn" data-id="${movie.id}">
        + Watchlist
      </button>
    </div>
  </div>
</div>
`;
  });

  $(container).html(html);
}

function loadCelebrities() {
  $.ajax({
    url: "api/get_celebrities.php",
    method: "GET",

    success: function (res) {
      let response = typeof res === "string" ? JSON.parse(res) : res;
      let celebrities = response.data;

      let html = "";
      let chunkSize = 6;

      for (let i = 0; i < celebrities.length; i += chunkSize) {
        let group = celebrities.slice(i, i + chunkSize);

        html += `
          <div class="carousel-item ${i === 0 ? "active" : ""}">
            <div class="row text-center">
        `;

        group.forEach(function (celebrity) {
          html += `
            <div class="col-lg-2 col-md-4 col-6 mb-4">
              <div class="celebrity-card">
                <img src="${celebrity.image}" class="celebrity-img">
                <h6 class="mt-3 mb-1">${celebrity.name}</h6>
                <small class="text-secondary">
                  ${celebrity.ranking} ▲ ${celebrity.popularity}
                </small>
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      $("#celebrityContainer").html(html);
    },
  });
}

$(document).ready(function () {
  $("#navbarContainer").load("./templates/navbar.html", function () {
    checkLoggedUser();
    loadCelebrities();
    // $("#openMenu").click(function () {
    //   $("#menuOverlay").fadeIn(200);
    // });

    // $("#closeMenu").click(function () {
    //   $("#menuOverlay").fadeOut(200);
    // });

    loadMovies();

    $(document).on("click", "#logoutBtn", function () {
      localStorage.removeItem("token");
      Swal.fire({
        title: "Sign out?",
        text: "Are you sure you want to sign out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Signed out!",
            text: "You have been successfully signed out.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "home.html";
          });
        }
      });
    });

    $(document).on("click", ".viewDetailsBtn", function () {
      let movieId = $(this).data("id");
      let token = localStorage.getItem("token");
      window.location.href = "movie-details.html?id=" + movieId;
    });

    $(document).on("click", ".addWatchlistBtn", function () {
      let movieId = $(this).data("id");
      let token = localStorage.getItem("token");
      $.ajax({
        url: "api/add_to_watchlist.php",
        method: "POST",
        data: {
          movie_id: movieId,
          token: token,
        },

        success: function (res) {
          let response = typeof res === "string" ? JSON.parse(res) : res;
          alert(response.message);
        },
      });
    });
  });
});
