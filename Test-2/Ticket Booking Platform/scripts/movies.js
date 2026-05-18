$(document).ready(() => {
  const token = localStorage.getItem("token");
  const user  = localStorage.getItem("user");
  const role  = localStorage.getItem("role");
  const POSTER_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%231a1a2e'/%3E%3Ctext x='1.5' y='2.2' text-anchor='middle' dominant-baseline='middle' fill='%23e94560' font-size='0.35' font-family='sans-serif'%3ENo+Poster%3C/text%3E%3C/svg%3E";
  if (token) {
    $("#loginLink").hide();
    $("#logoutBtn").show();
    if (user) {
      $("#welcomeMsg").text("Hi, " + user).removeClass("d-none");
    }
    $("#myBookingsLink").show();
    if (role === "admin") {
      $("#adminLink").show();
    }
  }
  $("#logoutBtn").on("click", () => {
    $.ajax({
      type: "POST",
      url: "./api/tokenStatus.php",
      data: { token },
      dataType: "json",
      complete: function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.replace("./index.html");
      },
    });
  });
  function loadGenres() {
    $.ajax({
      type: "POST",
      url: "./api/list_genres.php",
      dataType: "json",
      success: function (res) {
        if (res && res.status && res.data) {
          const $pills = $("#genrePills");
          res.data.forEach(function (g) {
            $pills.append(
              $("<span>", {
                class: "genre-pill",
                text: g.name,
                "data-genre": g.id,
              })
            );
          });
          bindGenrePills();
        }
      },
    });
  }
  function bindGenrePills() {
    $(".genre-pill").on("click", function () {
      $(".genre-pill").removeClass("active");
      $(this).addClass("active");
      const genreId = $(this).data("genre");
      loadMovies(genreId);
    });
  }
  let allMovies = [];
  function loadMovies(genreId) {
    $("#moviesGrid").html(skeletonHtml());
    $.ajax({
      type: "POST",
      url: "./api/list_movies.php",
      data: genreId ? { genre_id: genreId } : {},
      dataType: "json",
      success: function (res) {
        if (res && res.status && res.data) {
          allMovies = res.data;
          renderMovies(allMovies);
        } else {
          $("#moviesGrid").html(emptyHtml("No movies found."));
        }
      },
      error: function () {
        $("#moviesGrid").html(emptyHtml("Failed to load movies. Please try again."));
      },
    });
  }
  function renderMovies(movies) {
    if (!movies.length) {
      $("#moviesGrid").html(emptyHtml("No movies match your search."));
      $("#movieCount").text("");
      return;
    }
    $("#movieCount").text("(" + movies.length + " movies)");
    let html = "";
    movies.forEach(function (m) {
      const rating = m.rating ? m.rating : "";
      const ratingHtml = rating
        ? `<div class="rating-badge"><i class="bi bi-star-fill"></i>${parseFloat(rating).toFixed(1)}</div>`
        : "";
      const genreHtml = m.genre_name
        ? `<div class="genre-tag">${escHtml(m.genre_name)}</div>`
        : "";
      const poster = m.poster_url
        ? escHtml(m.poster_url)
        : POSTER_PLACEHOLDER;
      const duration = m.duration_mins ? m.duration_mins + " min" : "";
      const lang = m.language || "";
      html += `
        <div class="col-6 col-md-4 col-lg-3">
          <div class="movie-card" data-movie-id="${m.id}">
            <div class="movie-poster-wrap">
              <img class="movie-poster" src="${poster}" alt="${escHtml(m.title)}" loading="lazy" onerror="this.onerror=null;this.src='${POSTER_PLACEHOLDER}'" />
              <div class="poster-overlay"></div>
              ${genreHtml}
              ${ratingHtml}
            </div>
            <div class="card-body-cb">
              <h6 class="movie-title-cb">${escHtml(m.title)}</h6>
              <div class="movie-meta">
                ${duration ? `<span><i class="bi bi-clock"></i> ${duration}</span>` : ""}
                ${lang ? `<span><i class="bi bi-translate"></i> ${lang}</span>` : ""}
              </div>
              <button class="btn-book book-btn" data-movie-id="${m.id}">
                <i class="bi bi-ticket-perforated"></i> Book Now
              </button>
            </div>
          </div>
        </div>`;
    });
    $("#moviesGrid").html(html);
    $(".book-btn").on("click", function (e) {
      e.stopPropagation();
      const movieId = $(this).data("movie-id");
      handleBookNow(movieId);
    });
    $(".movie-card").on("click", function () {
      const movieId = $(this).data("movie-id");
      handleBookNow(movieId);
    });
  }
  function handleBookNow(movieId) {
    if (!token) {
      Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please login to book tickets.",
        confirmButtonColor: "#e94560",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = "./index.html";
        }
      });
      return;
    }
    window.location.href = "./book.html?movie_id=" + movieId;
  }
  $("#searchInput").on("input", function () {
    const q = $(this).val().trim().toLowerCase();
    if (!q) {
      renderMovies(allMovies);
      return;
    }
    const filtered = allMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.genre_name && m.genre_name.toLowerCase().includes(q))
    );
    renderMovies(filtered);
  });
  function skeletonHtml() {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += `<div class="col-6 col-md-4 col-lg-3 skeleton-card">
        <div class="movie-card">
          <div class="skeleton skeleton-poster"></div>
          <div class="card-body-cb">
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-btn"></div>
          </div>
        </div>
      </div>`;
    }
    return s;
  }
  function emptyHtml(msg) {
    return `<div class="col-12">
      <div class="empty-state">
        <i class="bi bi-film"></i>
        <p>${msg}</p>
      </div>
    </div>`;
  }
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  loadGenres();
  loadMovies(null);
});
