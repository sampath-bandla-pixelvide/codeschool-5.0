const token = localStorage.getItem("token");
if (!token) {
  window.location.replace("../index.html");
}
const telugu_movies = $("#teluguMovies");
const action_movies = $("#actionMovies");
const thriller_movies = $("#thrillerMovies");
const horror_movies = $("#horrorMovies");
const crime_movies = $("#crimeMovies");

let currentPreview = null; 


function getEmbedTrailerUrl(rawUrl, options = {}) {
  const { autoplay = false, muted = true, controls = 0 } = options;
  if (!rawUrl) return "";
  let url = String(rawUrl).trim();

  if (url.includes("watch?v=")) {
    url = url.replace("watch?v=", "embed/");
  } else if (url.includes("youtu.be/")) {
    url = url.replace("youtu.be/", "youtube.com/embed/");
  }

  const hasQuery = url.includes("?");
  const query = [
    `controls=${controls ? 1 : 0}`,
    `autoplay=${autoplay ? 1 : 0}`,
    `mute=${muted ? 1 : 0}`,
  ].join("&");
  return `${url}${hasQuery ? "&" : "?"}${query}`;
}

$("#logoutBtn").on("click", () => {
  const token = localStorage.getItem("token");
  $.ajax({
    type: "POST",
    url: "../api/tokenStatus.php",
    data: { token },
    dataType: "json",
    success: function (response) {
      Swal.fire({
        icon: "success",
        title: "Your are going to logout...",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonColor: "#e50914",
      }).then(() => {
        localStorage.removeItem("token");
        window.location.replace("../index.html");
      });
    },
  });
});

function appendMovie(data, movies) {
  data.forEach((element) => {
    movies.append(`
      <div class="movie-card mx-2"
          data-title="${element.title}"
          data-desc="${element.description}"
          data-rating="${element.rating}"
          data-duration="${element.duration}"
          data-category="${element.category_name}"
          data-actors="${element.actors}"
          data-trailer="${element.trailer}">

        <img src="${element.thumbnail}" class="movie-img"/>

        <div class="hover-content">
            <div class="preview">
              <img src="${element.thumbnail}" class="preview-thumb" alt="${element.title}" />
            </div>
        </div>
      </div>
    `);
  });
}

$(document).on("mouseenter", ".movie-card", function () {
  const trailer = $(this).data("trailer");
  const thumb = $(this).find(".movie-img").attr("src");
  $(this).addClass("is-hovered");
  if (currentPreview && currentPreview[0] !== $(this).find(".preview")[0]) {
    currentPreview.empty();
  }

  const iframe = trailer
    ? `
    <iframe src="${getEmbedTrailerUrl(trailer, { autoplay: true, muted: false, controls: 0 })}"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen></iframe>
  `
    : `<img src="${thumb}" class="preview-thumb" alt="Movie thumbnail" />`;

  $(this).find(".preview").html(iframe);
  currentPreview = $(this).find(".preview");
});

$(document).on("mouseleave", ".movie-card", function () {
  const thumb = $(this).find(".movie-img").attr("src");
  $(this).removeClass("is-hovered");
  $(this)
    .find(".preview")
    .html(`<img src="${thumb}" class="preview-thumb" alt="Movie thumbnail" />`);
});

$(document).on("click", ".movie-card", function () {
  const title = $(this).data("title");
  const desc = $(this).data("desc");
  const rating = $(this).data("rating");
  const duration = $(this).data("duration");
  const category = $(this).data("category");
  const actors = $(this).data("actors");
  const trailer = $(this).data("trailer");

  $("#movieModal .modal-body").html(`
    <div class="modal-hero">
      <iframe src="${getEmbedTrailerUrl(trailer, { autoplay: true, muted: false, controls: 1 })}"
        frameborder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>

    <div class="modal-content-body">
      <div class="left">
        <p class='text-white fw-bold'>Movie: <span class="fst-italic text-primary">${title}</span></p>
        <p class="text-success fw-bold">${rating} Rating</p>
        <p>${duration} mins • HD</p>
        <p>${desc}</p>
      </div>

      <div class="right">
        <p><b>Cast:</b> ${actors}</p>
        <p><b>Genre:</b> ${category}</p>
      </div>
    </div>
  `);

  $("#movieModal").modal("show");
});

function getMoviesByCat(category, movies) {
  $.ajax({
    type: "POST",
    url: "../api/categories.php",
    data: { category },
    dataType: "json",
    success: function (response) {
      if (response) appendMovie(response.data, movies);
    },
    error: function () {
      console.log("error while calling");
    },
  });
}

$(document).ready(() => {
  const name = localStorage.getItem("user");
  $("#userName").html(`Hello ${name} ,`);
  $.ajax({
    type: "GET",
    url: "../api/teluguMovies.php",
    dataType: "json",
    success: function (response) {
      if (response) appendMovie(response.data, telugu_movies);
    },
    error: function () {
      console.log("error in the fetch call");
    },
  });

  getMoviesByCat("Action", action_movies);
  getMoviesByCat("Thriller", thriller_movies);
  getMoviesByCat("Horror", horror_movies);
  getMoviesByCat("Crime", crime_movies);
});

$(document).on("keydown", function (e) {
  if (e.key === "Escape") {
    const modalEl = document.getElementById("movieModal");
    const modal = bootstrap.Modal.getInstance(modalEl);

    if (modal) modal.hide();
  }
});

$('#movieModal').on('hidden.bs.modal', function () {
  $(this).find('iframe').attr('src', '');
});