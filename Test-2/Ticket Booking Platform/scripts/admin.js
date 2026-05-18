const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
if (!token) {
  window.location.replace("./index.html");
} else if (role !== "admin") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "This page is restricted to administrators only.",
    confirmButtonColor: "#e94560",
    allowOutsideClick: false,
  }).then(() => {
    window.location.replace("./movies.html");
  });
}
$(document).ready(() => {
  const POSTER_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%231a1a2e'/%3E%3Ctext x='1.5' y='2.2' text-anchor='middle' dominant-baseline='middle' fill='%23e94560' font-size='0.35' font-family='sans-serif'%3ENo+Poster%3C/text%3E%3C/svg%3E";
  function apiPost(url, data) {
    return $.ajax({
      type: "POST",
      url,
      data: Object.assign({}, data, { token }),
      dataType: "json",
    });
  }
  function swalErr(title, text) {
    Swal.fire({
      icon: "error",
      title,
      text: text || "",
      confirmButtonColor: "#e94560",
    });
  }
  function swalOk(title, text) {
    Swal.fire({
      icon: "success",
      title,
      text: text || "",
      confirmButtonColor: "#e94560",
    });
  }
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  function formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return (
      (hr > 12 ? hr - 12 : hr || 12) + ":" + m + " " + (hr >= 12 ? "PM" : "AM")
    );
  }
  const adminName = localStorage.getItem("user");
  if (adminName)
    $("#adminName")
      .text("Welcome, " + adminName)
      .removeClass("d-none");
  $("#adminLogoutBtn").on("click", () => {
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
  $(".admin-tab").on("click", function () {
    const tab = $(this).data("tab");
    $(".admin-tab").removeClass("active");
    $(this).addClass("active");
    $(".tab-panel").removeClass("active");
    $(`#panel${capitalize(tab)}`).addClass("active");
  });
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  let moviesData = [];
  let theatresData = [];
  let showsData = [];
  let bookingsData = [];
  function loadAll() {
    loadMovies();
    loadTheatres();
    loadShows();
    loadBookings();
  }
  function loadMovies() {
    apiPost("./api/admin_list_movies.php", {}).done(function (res) {
      if (!res || !res.status) {
        return;
      }
      moviesData = res.data || [];
      $("#statMovies").text(moviesData.length);
      renderMoviesTable();
      populateMovieSelect();
    });
  }
  function renderMoviesTable() {
    if (!moviesData.length) {
      $("#moviesTableBody").html(
        `<tr class="empty-row"><td colspan="8">No movies added yet.</td></tr>`,
      );
      return;
    }
    let html = "";
    moviesData.forEach(function (m) {
      const poster = m.poster_url
        ? `<img class="poster-thumb" src="${escHtml(m.poster_url)}" alt="" onerror="this.onerror=null;this.src='${POSTER_PLACEHOLDER}'">`
        : `<div style="width:40px;height:56px;background:var(--mb-bg);border-radius:5px;display:flex;align-items:center;justify-content:center;color:var(--mb-muted);">?</div>`;
      html += `
        <tr>
          <td>${poster}</td>
          <td style="font-weight:700;max-width:180px;">${escHtml(m.title)}</td>
          <td>${m.genre_name ? `<span class="badge-genre">${escHtml(m.genre_name)}</span>` : "—"}</td>
          <td>${m.duration_mins} min</td>
          <td>${escHtml(m.language || "")}</td>
          <td>${m.rating ? `<span style="color:var(--mb-gold);font-weight:700;">⭐ ${parseFloat(m.rating).toFixed(1)}</span>` : "—"}</td>
          <td>${m.release_date ? formatDate(m.release_date) : "—"}</td>
          <td>
            <button class="btn btn-sm btn-outline-warning edit-movie-btn" data-id="${m.id}" data-bs-toggle="modal" data-bs-target="#modalMovie" style="padding: 2px 6px; font-size: 0.8rem; border-color: var(--mb-accent); color: var(--mb-text); background:transparent;">
              <i class="bi bi-pencil"></i> Edit
            </button>
          </td>
        </tr>`;
    });
    $("#moviesTableBody").html(html);
  }
  function populateMovieSelect() {
    const $sel = $("#showMovie");
    $sel.find("option:not(:first)").remove();
    moviesData.forEach(function (m) {
      $sel.append($("<option>", { value: m.id, text: m.title }));
    });
  }
  function loadTheatres() {
    apiPost("./api/admin_list_theatres.php", {}).done(function (res) {
      if (!res || !res.status) {
        return;
      }
      theatresData = res.data || [];
      $("#statTheatres").text(theatresData.length);
      renderTheatresTable();
      populateTheatreSelect();
    });
  }
  function renderTheatresTable() {
    if (!theatresData.length) {
      $("#theatresTableBody").html(
        `<tr class="empty-row"><td colspan="4">No theatres added yet.</td></tr>`,
      );
      return;
    }
    let html = "";
    theatresData.forEach(function (t) {
      html += `
        <tr>
          <td style="font-weight:700;">${escHtml(t.name)}</td>
          <td style="color:var(--mb-muted);">${escHtml(t.location)}</td>
          <td>${t.total_seats}</td>
          <td>
            <button class="btn btn-sm btn-outline-warning edit-theatre-btn" data-id="${t.id}" data-bs-toggle="modal" data-bs-target="#modalTheatre" style="padding: 2px 6px; font-size: 0.8rem; border-color: var(--mb-accent); color: var(--mb-text); background:transparent;">
              <i class="bi bi-pencil"></i> Edit
            </button>
          </td>
        </tr>`;
    });
    $("#theatresTableBody").html(html);
  }
  function populateTheatreSelect() {
    const $sel = $("#showTheatre");
    $sel.find("option:not(:first)").remove();
    theatresData.forEach(function (t) {
      $sel.append(
        $("<option>", { value: t.id, text: t.name + " — " + t.location }),
      );
    });
  }
  function loadShows() {
    apiPost("./api/admin_list_shows.php", {}).done(function (res) {
      if (!res || !res.status) {
        return;
      }
      showsData = res.data || [];
      $("#statShows").text(showsData.length);
      renderShowsTable();
    });
  }
  function renderShowsTable() {
    if (!showsData.length) {
      $("#showsTableBody").html(
        `<tr class="empty-row"><td colspan="8">No shows created yet.</td></tr>`,
      );
      return;
    }
    let html = "";
    showsData.forEach(function (s) {
      const pct =
        s.total_seats > 0
          ? Math.round((s.booked_seats / s.total_seats) * 100)
          : 0;
      html += `
        <tr>
          <td style="font-weight:700;max-width:150px;">${escHtml(s.movie_title)}</td>
          <td>${escHtml(s.theatre_name)}</td>
          <td>${formatDate(s.show_date)}</td>
          <td>${formatTime(s.show_time)}</td>
          <td style="color:var(--mb-gold);font-weight:700;">₹${parseFloat(s.price).toLocaleString("en-IN")}</td>
          <td>${s.total_seats}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:var(--mb-accent);border-radius:3px;transition:width 0.3s;"></div>
              </div>
              <span style="font-size:0.78rem;color:var(--mb-muted);">${s.booked_seats}/${s.total_seats}</span>
            </div>
          </td>
          <td>
            <button class="btn btn-sm edit-show-btn" data-id="${s.id}" data-bs-toggle="modal" data-bs-target="#modalShow" style="padding: 2px 6px; font-size: 0.8rem; border: 1px solid var(--mb-accent); color: var(--mb-text); background:transparent; margin-right: 4px;">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm delete-show-btn" data-id="${s.id}" style="padding: 2px 6px; font-size: 0.8rem; border: 1px solid var(--mb-accent); color: var(--mb-accent); background:transparent;">
              <i class="bi bi-trash"></i> Delete
            </button>
          </td>
        </tr>`;
    });
    $("#showsTableBody").html(html);
  }
  function loadBookings() {
    apiPost("./api/admin_list_bookings.php", {}).done(function (res) {
      if (!res || !res.status) {
        return;
      }
      bookingsData = res.data || [];
      $("#statBookings").text(bookingsData.length);
      renderBookingsTable();
    });
  }
  function renderBookingsTable() {
    if (!bookingsData.length) {
      $("#bookingsTableBody").html(
        `<tr class="empty-row"><td colspan="9">No bookings yet.</td></tr>`,
      );
      return;
    }
    let html = "";
    bookingsData.forEach(function (b) {
      html += `
        <tr>
          <td style="font-family:'Courier New',monospace;color:var(--mb-accent);font-weight:700;font-size:0.8rem;">${escHtml(b.reference_number)}</td>
          <td>
            <div style="font-weight:700;">${escHtml(b.first_name)} ${escHtml(b.last_name)}</div>
            <div style="font-size:0.75rem;color:var(--mb-muted);">${escHtml(b.email)}</div>
          </td>
          <td style="font-weight:600;max-width:130px;">${escHtml(b.movie_title)}</td>
          <td>${escHtml(b.theatre_name)}</td>
          <td>${formatDate(b.show_date)}</td>
          <td>${formatTime(b.show_time)}</td>
          <td style="font-size:0.8rem;color:var(--mb-muted);max-width:120px;">${escHtml(b.seats || "")}</td>
          <td style="color:var(--mb-gold);font-weight:700;">₹${parseFloat(b.total_amount).toLocaleString("en-IN")}</td>
          <td><span class="badge-confirmed">${escHtml(b.status)}</span></td>
        </tr>`;
    });
    $("#bookingsTableBody").html(html);
  }
  $("#formMovie").on("submit", function (e) {
    e.preventDefault();
    $(".text-danger").text("");
    let flag = false;
    const title = $("#movieTitle").val().trim();
    const genreId = $("#movieGenre").val();
    const duration = parseInt($("#movieDuration").val());
    if (!title) {
      $("#movieTitleErrMsg").text("Movie title is required.");
      flag = true;
    }
    if (!genreId) {
      $("#movieGenreErrMsg").text("Genre is required.");
      flag = true;
    }
    if (!duration || duration < 1) {
      $("#movieDurationErrMsg").text("Duration must be at least 1 minute.");
      flag = true;
    }
    if (flag) return;
    const $btn = $(this).find("button[type=submit]");
    const editId = $("#editMovieId").val();
    const isEdit = !!editId;
    $btn.prop("disabled", true).text(isEdit ? "Saving…" : "Adding…");

    let formData = new FormData();
    formData.append("token", token);
    formData.append("title", title);
    formData.append("description", $("#movieDescription").val().trim());
    formData.append("duration", duration);
    formData.append("poster_url", $("#moviePosterUrl").val().trim());
    formData.append("language", $("#movieLanguage").val().trim() || "English");
    formData.append("release_date", $("#movieReleaseDate").val());
    formData.append("rating", $("#movieRating").val() || "");
    formData.append("genre_id", genreId);
    if (isEdit) {
      formData.append("id", editId);
    }

    let files = $("#movieCarouselImages")[0].files;
    for (let i = 0; i < files.length; i++) {
      formData.append("carousel_images[]", files[i]);
    }

    $.ajax({
      type: "POST",
      url: isEdit
        ? "./api/admin_update_movie.php"
        : "./api/admin_create_movie.php",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (res) {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Add Movie");
        if (!res || !res.status) {
          swalErr(
            "Failed",
            res?.message || `Could not ${isEdit ? "update" : "add"} movie.`,
          );
          return;
        }
        bootstrap.Modal.getInstance(
          document.getElementById("modalMovie"),
        ).hide();
        $("#formMovie")[0].reset();
        swalOk(isEdit ? "Movie Updated!" : "Movie Added!", res.message);
        loadMovies();
      },
      error: function () {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Add Movie");
        swalErr("Server Error", "Could not reach server.");
      },
    });
  });
  $("#formShow").on("submit", function (e) {
    e.preventDefault();
    $(".text-danger").text("");
    let flag = false;
    const movieId = $("#showMovie").val();
    const theatreId = $("#showTheatre").val();
    const showDate = $("#showDate").val();
    const showTime = $("#showTime").val();
    const price = parseFloat($("#showPrice").val());
    if (!movieId) {
      $("#showMovieErrMsg").text("Please select a movie.");
      flag = true;
    }
    if (!theatreId) {
      $("#showTheatreErrMsg").text("Please select a theatre.");
      flag = true;
    }
    if (!showDate) {
      $("#showDateErrMsg").text("Date is required.");
      flag = true;
    }
    if (!showTime) {
      $("#showTimeErrMsg").text("Time is required.");
      flag = true;
    }
    if (!price || price < 1) {
      $("#showPriceErrMsg").text("Price must be at least ₹1.");
      flag = true;
    }
    if (flag) return;
    const $btn = $(this).find("button[type=submit]");
    const editId = $("#editShowId").val();
    const isEdit = !!editId;
    $btn.prop("disabled", true).text(isEdit ? "Saving…" : "Creating…");
    const payload = {
      movie_id: movieId,
      theatre_id: theatreId,
      show_date: showDate,
      show_time: showTime,
      price,
    };
    if (isEdit) {
      payload.id = editId;
    }
    apiPost(
      isEdit ? "./api/admin_update_show.php" : "./api/admin_create_show.php",
      payload,
    )
      .done(function (res) {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Create Show");
        if (!res || !res.status) {
          swalErr(
            "Failed",
            res?.message || `Could not ${isEdit ? "update" : "create"} show.`,
          );
          return;
        }
        bootstrap.Modal.getInstance(
          document.getElementById("modalShow"),
        ).hide();
        $("#formShow")[0].reset();
        swalOk(isEdit ? "Show Updated!" : "Show Created!", res.message);
        loadShows();
      })
      .fail(function () {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Create Show");
        swalErr("Server Error", "Could not reach server.");
      });
  });
  $("#formTheatre").on("submit", function (e) {
    e.preventDefault();
    $(".text-danger").text("");
    let flag = false;
    const name = $("#theatreName").val().trim();
    const location = $("#theatreLocation").val().trim();
    const totalSeats = parseInt($("#theatreSeats").val());
    if (!name) {
      $("#theatreNameErrMsg").text("Name is required.");
      flag = true;
    }
    if (!location) {
      $("#theatreLocationErrMsg").text("Location is required.");
      flag = true;
    }
    if (!totalSeats || totalSeats < 10) {
      $("#theatreSeatsErrMsg").text("Seats must be at least 10.");
      flag = true;
    }
    if (flag) return;
    const $btn = $(this).find("button[type=submit]");
    const editId = $("#editTheatreId").val();
    const isEdit = !!editId;
    $btn.prop("disabled", true).text(isEdit ? "Saving…" : "Adding…");
    const payload = {
      name,
      location,
      total_seats: totalSeats,
    };
    if (isEdit) {
      payload.id = editId;
    }
    apiPost(
      isEdit
        ? "./api/admin_update_theatre.php"
        : "./api/admin_create_theatre.php",
      payload,
    )
      .done(function (res) {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Add Theatre");
        if (!res || !res.status) {
          swalErr(
            "Failed",
            res?.message || `Could not ${isEdit ? "update" : "add"} theatre.`,
          );
          return;
        }
        bootstrap.Modal.getInstance(
          document.getElementById("modalTheatre"),
        ).hide();
        $("#formTheatre")[0].reset();
        swalOk(isEdit ? "Theatre Updated!" : "Theatre Added!", res.message);
        loadTheatres();
      })
      .fail(function () {
        $btn
          .prop("disabled", false)
          .text(isEdit ? "Save Changes" : "Add Theatre");
        swalErr("Server Error", "Could not reach server.");
      });
  });
  $("#modalMovie").on("show.bs.modal", function (e) {
    const $trigger = $(e.relatedTarget);
    if ($trigger.hasClass("edit-movie-btn")) {
      const id = $trigger.data("id");
      const m = moviesData.find((x) => x.id == id);
      if (m) {
        $("#modalMovie").find(".modal-title").text("Edit Movie");
        $("#formMovie").find("button[type=submit]").text("Save Changes");
        $("#editMovieId").val(m.id);
        $("#movieTitle").val(m.title);
        $("#movieGenre").val(m.genre_id);
        $("#movieDuration").val(m.duration_mins);
        $("#movieLanguage").val(m.language);
        $("#movieRating").val(m.rating);
        $("#movieReleaseDate").val(m.release_date);
        $("#moviePosterUrl").val(m.poster_url);
        $("#movieDescription").val(m.description);
        
        $("#movieCarouselImages").val('');
        if (m.carousel_images && m.carousel_images.length > 0) {
            let imgHtml = '<div class="d-flex gap-2 mt-2 flex-wrap">';
            m.carousel_images.forEach(img => {
                imgHtml += `<img src="${escHtml(img)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; border: 1px solid var(--mb-border);" />`;
            });
            imgHtml += '</div><small class="text-muted" style="font-size: 0.75rem;">Uploading new images will replace these.</small>';
            $("#existingCarouselImages").html(imgHtml);
        } else {
            $("#existingCarouselImages").html('<small class="text-muted" style="font-size: 0.75rem;">No carousel images uploaded yet.</small>');
        }
      }
    } else {
      $("#modalMovie").find(".modal-title").text("Add New Movie");
      $("#formMovie").find("button[type=submit]").text("Add Movie");
      $("#editMovieId").val("");
      $("#formMovie")[0].reset();
      $(".text-danger").text("");
      $("#existingCarouselImages").empty();
    }
  });

  $("#modalTheatre").on("show.bs.modal", function (e) {
    const $trigger = $(e.relatedTarget);
    if ($trigger.hasClass("edit-theatre-btn")) {
      const id = $trigger.data("id");
      const t = theatresData.find((x) => x.id == id);
      if (t) {
        $("#modalTheatre").find(".modal-title").text("Edit Theatre");
        $("#formTheatre").find("button[type=submit]").text("Save Changes");
        $("#editTheatreId").val(t.id);
        $("#theatreName").val(t.name);
        $("#theatreLocation").val(t.location);
        $("#theatreSeats").val(t.total_seats);
      }
    } else {
      $("#modalTheatre").find(".modal-title").text("Add New Theatre");
      $("#formTheatre").find("button[type=submit]").text("Add Theatre");
      $("#editTheatreId").val("");
      $("#formTheatre")[0].reset();
      $(".text-danger").text("");
    }
  });

  $("#modalShow").on("show.bs.modal", function (e) {
    const $trigger = $(e.relatedTarget);
    if ($trigger.hasClass("edit-show-btn")) {
      const id = $trigger.data("id");
      const s = showsData.find((x) => x.id == id);
      if (s) {
        $("#modalShow").find(".modal-title").text("Edit Show");
        $("#formShow").find("button[type=submit]").text("Save Changes");
        $("#editShowId").val(s.id);
        $("#showMovie").val(s.movie_id);
        $("#showTheatre").val(s.theatre_id);
        $("#showDate").val(s.show_date);
        $("#showDate").removeAttr("min");
        const timePart = s.show_time ? s.show_time.substring(0, 5) : "";
        $("#showTime").val(timePart);
        $("#showPrice").val(s.price);
      }
    } else {
      $("#modalShow").find(".modal-title").text("Create New Show");
      $("#formShow").find("button[type=submit]").text("Create Show");
      $("#editShowId").val("");
      $("#formShow")[0].reset();
      $(".text-danger").text("");
      const today = new Date().toISOString().split("T")[0];
      $("#showDate").attr("min", today);
    }
  });

  $(document).on("click", ".delete-show-btn", function () {
    const showId = $(this).data("id");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! The show and its seats will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e94560",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        apiPost("./api/admin_delete_show.php", { id: showId })
          .done(function (res) {
            if (res && res.status) {
              swalOk("Deleted!", res.message);
              loadShows();
            } else {
              swalErr("Error!", res?.message || "Could not delete the show.");
            }
          })
          .fail(function () {
            swalErr("Error!", "Could not reach the server.");
          });
      }
    });
  });

  function loadGenresIntoSelect() {
    $.ajax({
      type: "POST",
      url: "./api/list_genres.php",
      dataType: "json",
      success: function (res) {
        if (res && res.status && res.data) {
          const $sel = $("#movieGenre");
          res.data.forEach(function (g) {
            $sel.append($("<option>", { value: g.id, text: g.name }));
          });
        }
      },
    });
  }
  loadGenresIntoSelect();
  loadAll();
});
