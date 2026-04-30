$(document).ready(function () {

  
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  const token = localStorage.getItem("token");

  if (!movieId) {
    Swal.fire("Error", "Invalid movie", "error");
    return;
  }

  loadMovie(movieId);
  loadReviews(movieId);

   
  if (!token) {
    $("#rating").hide();
    $("#reviewText").hide();
    $("#addReviewBtn").hide();

    $("#reviewsContainer").before(`
      <div class="alert alert-warning mt-3">
        Please login to add ratings and reviews.
        <a href="login.html" class="fw-bold">Login</a>
      </div>
    `);
  }

  $("#addReviewBtn").click(function () {
    if (!token) {
      Swal.fire("Login Required", "Please login to add review", "warning");
      return;
    }

    let rating = $("#rating").val();
    let reviewText = $("#reviewText").val().trim();

    if (rating === "") {
      Swal.fire("Warning", "Please select rating", "warning");
      return;
    }

    if (reviewText === "") {
      Swal.fire("Warning", "Please write review", "warning");
      return;
    }

    let editId = $("#addReviewBtn").data("edit-id");
    let apiUrl = editId ? "api/update_review.php" : "api/add_review.php";

    let requestData = {
      movie_id: movieId,
      rating: rating,
      review_text: reviewText,
      token: token,
    };

    if (editId) {
      requestData.review_id = editId;
    }

    $.ajax({
      url: apiUrl,
      method: "POST",
      data: requestData,

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }

        Swal.fire(
          "Success",
          editId ? "Review updated" : "Review added",
          "success",
        );

        $("#rating").val("");
        $("#reviewText").val("");

        $("#addReviewBtn")
          .text("Add Review")
          .removeClass("btn-success")
          .addClass("btn-warning")
          .removeData("edit-id");

        loadReviews(movieId);
      },
    });
  });

  function loadMovie(id) {
    $.ajax({
      url: "api/get_movie_details.php",
      method: "GET",
      data: { id: id },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }

        let movie = response.data;

        $("#movieTitle").text(movie.title);
        $("#movieYear").text(movie.release_year);
        $("#movieDescription").text(movie.description);
        $("#movieImage").attr("src", movie.image);
      },
    });
  }

  function loadReviews(movieId) {
    $.ajax({
      url: "api/get_reviews.php",
      method: "GET",
      data: { movie_id: movieId },

      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;

        let reviews = response.data || [];
        let html = "";

        if (reviews.length === 0) {
          html = `
    <div class="text-center text-secondary py-4">
        <i class="bi bi-chat-dots fs-3"></i>
        <p class="mt-2">No reviews yet</p>
    </div>
`;
        } else {
          reviews.forEach(function (review) {
            let rating = parseFloat(review.rating);
            html += `
              <div class="review-box">
                <h6 class="text-warning">${review.name}</h6>
                <p class="fs-4">${review.review_text}</p>
                  <div class="imdb-rating mb-2">
                    <span class="text-warning fs-4">★</span>
                    ${!isNaN(rating) ? rating.toFixed(1) : "N/A"}
                  </div>

                ${
                  token
                    ? `
                <div class="mt-2">
                  <button class="btn btn-sm btn-warning editReviewBtn"
                    data-id="${review.id}"
                    data-rating="${review.rating}"
                    data-text="${review.review_text}">
                    Edit
                  </button>

                  <button class="btn btn-sm btn-danger deleteReviewBtn" data-id="${review.id}">
                    Delete
                  </button>
                </div>`
                    : ""
                }
              </div>
            `;
          });
        }

        $("#reviewsContainer").html(html);
        $("#rating").val("");

        $("#ratingStars i")
          .removeClass("active bi-star-fill")
          .addClass("bi-star");
      },
    });
  }

  $(document).on("click", ".deleteReviewBtn", function () {
    let reviewId = $(this).data("id");

    Swal.fire({
      title: "Delete review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        url: "api/delete_review.php",
        method: "POST",
        data: {
          review_id: reviewId,
          token: token,
        },

        success: function (res) {
          let response = typeof res === "string" ? JSON.parse(res) : res;

          if (!response.status) {
            Swal.fire("Error", response.message, "error");
            return;
          }

          Swal.fire("Deleted", "Review deleted", "success");
          loadReviews(movieId);
        },
      });
    });
  });

  $(document).on("click", ".editReviewBtn", function () {
    $("#rating").val($(this).data("rating"));
    $("#reviewText").val($(this).data("text"));

    $("#addReviewBtn")
      .text("Update Review")
      .removeClass("btn-warning")
      .addClass("btn-success")
      .data("edit-id", $(this).data("id"));
  });

  $(document).on("click", "#ratingStars i", function () {
    let value = $(this).data("value");

    $("#rating").val(value);

    $("#ratingStars i").each(function () {
      if ($(this).data("value") <= value) {
        $(this)
          .addClass("active")
          .removeClass("bi-star")
          .addClass("bi-star-fill");
      } else {
        $(this)
          .removeClass("active")
          .removeClass("bi-star-fill")
          .addClass("bi-star");
      }
    });
  });

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
});
