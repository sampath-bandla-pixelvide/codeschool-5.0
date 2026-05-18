const token = localStorage.getItem("token");
if (!token) {
  Swal.fire({
    icon: "warning",
    title: "Login Required",
    text: "Please login to book tickets.",
    confirmButtonColor: "#e94560",
    allowOutsideClick: false,
  }).then(() => {
    window.location.replace("./index.html");
  });
}
$(document).ready(() => {
  const state = {
    movieId: null,
    theatreId: null,
    theatreName: "",
    showDate: null,
    showId: null,
    showTime: "",
    showPrice: 0,
    selectedSeats: [],
    currentStep: 1,
  };
  const params = new URLSearchParams(window.location.search);
  const movieId = parseInt(params.get("movie_id"));
  if (!movieId) {
    Swal.fire({
      icon: "error",
      title: "No movie selected",
      text: "Please select a movie from the listing page.",
      confirmButtonColor: "#e94560",
    }).then(() => {
      window.location.replace("./movies.html");
    });
    return;
  }
  state.movieId = movieId;
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
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function swalErr(title, text) {
    Swal.fire({
      icon: "error",
      title,
      text: text || "",
      confirmButtonColor: "#e94560",
    });
  }
  function loading(html) {
    return `<div class="cb-loading"><div class="cb-spinner"></div><p>${html}</p></div>`;
  }
  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", {
      weekday: "short",
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
  function showStep(n) {
    $(".step-panel").removeClass("active");
    $(`#stepPanel${n}`).addClass("active");
    state.currentStep = n;
    for (let i = 1; i <= 6; i++) {
      const $ind = $(`#step-ind-${i}`);
      $ind.removeClass("active done");
      if (i < n) $ind.addClass("done");
      else if (i === n) $ind.addClass("active");
    }
    updateSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateSummary() {
    $("#sumMovie").text(state.movieTitle || "—");
    $("#sumTheatre").text(state.theatreName || "—");
    $("#sumDate").text(state.showDate ? formatDate(state.showDate) : "—");
    $("#sumTime").text(state.showTime ? formatTime(state.showTime) : "—");
    $("#sumPrice").text(state.showPrice ? "₹" + state.showPrice : "—");
    if (state.selectedSeats.length) {
      $("#sumSeats").text(state.selectedSeats.map((s) => s.number).join(", "));
      $("#sumCount").text(state.selectedSeats.length);
      $("#sumTotal").text(
        "₹" +
          (state.showPrice * state.selectedSeats.length).toLocaleString(
            "en-IN",
          ),
      );
    } else {
      $("#sumSeats").text("None");
      $("#sumCount").text("0");
      $("#sumTotal").text("₹0");
    }
  }
  apiPost("./api/get_movie.php", { movie_id: movieId }).done(function (res) {
    if (!res || !res.status) {
      swalErr("Movie not found", res?.message || "");
      return;
    }
    const m = res.data;
    state.movieTitle = m.title;
    const rating = m.rating
      ? `<span style="color:var(--mb-gold);font-weight:800;"><i class="bi bi-star-fill"></i> ${parseFloat(m.rating).toFixed(1)}</span>`
      : "";
    const actors = (m.actors || [])
      .map(
        (a) =>
          `<span class="actor-chip">${a.photo_url ? `<img src="${escHtml(a.photo_url)}" onerror="this.style.display='none'">` : ""} ${escHtml(a.name)}</span>`,
      )
      .join("");
    const poster = m.poster_url || POSTER_PLACEHOLDER;
    let carouselHtml = "";
    if (m.carousel_images && m.carousel_images.length > 0) {
      let indicators = "";
      let items = "";
      m.carousel_images.forEach((url, i) => {
        indicators += `<button type="button" data-bs-target="#movieCarousel" data-bs-slide-to="${i}" class="${i === 0 ? "active" : ""}"></button>`;
        items += `<div class="carousel-item ${i === 0 ? "active" : ""}">
                    <img src="${escHtml(url)}" class="d-block w-100 movie-banner-poster" style="height: 300px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null;this.src='${POSTER_PLACEHOLDER}'">
                  </div>`;
      });
      carouselHtml = `
        <div id="movieCarousel" class="carousel slide" data-bs-ride="carousel" style="width: 200px; flex-shrink: 0; background:var(--mb-surface2); border-radius: 8px; overflow: hidden;">
          <div class="carousel-indicators" style="margin-bottom:0;">${indicators}</div>
          <div class="carousel-inner" style="height:100%;">${items}</div>
          <button class="carousel-control-prev" type="button" data-bs-target="#movieCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#movieCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
      `;
    } else {
      carouselHtml = `<img class="movie-banner-poster" src="${escHtml(poster)}" alt="${escHtml(m.title)}" style="width:200px; height: 300px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null;this.src='${POSTER_PLACEHOLDER}'" />`;
    }

    $("#movieBanner").html(`
      <div class="movie-banner">
        ${carouselHtml}
        <div class="movie-banner-info">
          <div class="movie-banner-title">${escHtml(m.title)}</div>
          <div class="mb-2">
            <span class="meta-chip"><i class="bi bi-clock"></i> ${m.duration_mins} min</span>
            <span class="meta-chip"><i class="bi bi-translate"></i> ${escHtml(m.language || "English")}</span>
            ${m.genre_name ? `<span class="meta-chip"><i class="bi bi-tag"></i> ${escHtml(m.genre_name)}</span>` : ""}
            ${rating}
          </div>
          ${m.description ? `<p style="color:var(--mb-muted);font-size:0.85rem;margin:0 0 12px;">${escHtml(m.description)}</p>` : ""}
          ${actors ? `<div><span style="font-size:0.75rem;font-weight:700;color:var(--mb-muted);text-transform:uppercase;letter-spacing:0.5px;">Cast</span><br>${actors}</div>` : ""}
        </div>
      </div>
    `);
  });
  $("#nextToTheatre").on("click", () => {
    showStep(2);
    loadTheatres();
  });
  function loadTheatres() {
    $("#theatreList").html(loading("Loading theatres…"));
    apiPost("./api/list_theatres.php", { movie_id: state.movieId }).done(
      function (res) {
        if (!res || !res.status || !res.data.length) {
          $("#theatreList").html(
            `<div class="col-12"><p style="color:var(--mb-muted);">No theatres available for this movie.</p></div>`,
          );
          return;
        }
        let html = "";
        res.data.forEach(function (t) {
          html += `
          <div class="col-md-6">
            <div class="sel-card theatre-sel" data-id="${t.id}" data-name="${escHtml(t.name)}">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="sel-title">${escHtml(t.name)}</div>
                  <div class="sel-sub"><i class="bi bi-geo-alt"></i> ${escHtml(t.location)}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.78rem;color:var(--mb-muted);">${t.total_seats} seats</div>
                </div>
              </div>
            </div>
          </div>`;
        });
        $("#theatreList").html(html);
        $(".theatre-sel").on("click", function () {
          $(".theatre-sel").removeClass("selected");
          $(this).addClass("selected");
          state.theatreId = $(this).data("id");
          state.theatreName = $(this).data("name");
          $("#nextToDate").prop("disabled", false);
        });
      },
    );
  }
  $("#backToMovie").on("click", () => showStep(1));
  $("#nextToDate").on("click", () => {
    if (!state.theatreId) return;
    state.selectedSeats = [];
    state.showDate = null;
    state.showId = null;
    showStep(3);
    loadDates();
  });
  function loadDates() {
    $("#dateList").html(loading("Loading dates…"));
    apiPost("./api/list_show_dates.php", {
      movie_id: state.movieId,
      theatre_id: state.theatreId,
    }).done(function (res) {
      if (!res || !res.status || !res.data.length) {
        $("#dateList").html(
          `<p style="color:var(--mb-muted);">No shows available for this theatre.</p>`,
        );
        return;
      }
      let html = "";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      res.data.forEach(function (row) {
        const d = new Date(row.show_date);
        html += `
          <div class="date-card date-sel" data-date="${row.show_date}">
            <div class="date-day">${days[d.getDay()]}</div>
            <div class="date-num">${d.getDate()}</div>
            <div class="date-month">${months[d.getMonth()]}</div>
          </div>`;
      });
      $("#dateList").html(html);
      $(".date-sel").on("click", function () {
        $(".date-sel").removeClass("selected");
        $(this).addClass("selected");
        state.showDate = $(this).data("date");
        $("#nextToShow").prop("disabled", false);
      });
    });
  }
  $("#backToTheatre").on("click", () => showStep(2));
  $("#nextToShow").on("click", () => {
    if (!state.showDate) return;
    state.selectedSeats = [];
    state.showId = null;
    showStep(4);
    loadShows();
  });
  function loadShows() {
    $("#showList").html(loading("Loading show times…"));
    apiPost("./api/list_shows.php", {
      movie_id: state.movieId,
      theatre_id: state.theatreId,
      show_date: state.showDate,
    }).done(function (res) {
      if (!res || !res.status || !res.data.length) {
        $("#showList").html(
          `<div class="col-12"><p style="color:var(--mb-muted);">No shows available for this date.</p></div>`,
        );
        return;
      }
      let html = "";
      res.data.forEach(function (s) {
        const avail = s.available_seats || 0;
        const availColor = avail > 0 ? "var(--mb-success)" : "var(--mb-danger)";
        html += `
          <div class="col-md-4">
            <div class="show-card show-sel ${avail <= 0 ? "opacity-50" : ""}" 
                 data-id="${s.id}" data-time="${s.show_time}" data-price="${s.price}"
                 ${avail <= 0 ? "style='pointer-events:none;'" : ""}>
              <div class="show-time-text">${formatTime(s.show_time)}</div>
              <div class="show-avail" style="color:${availColor};">${avail} seats left</div>
              <div class="show-price">₹${parseFloat(s.price).toLocaleString("en-IN")}</div>
            </div>
          </div>`;
      });
      $("#showList").html(html);
      $(".show-sel").on("click", function () {
        $(".show-sel").removeClass("selected");
        $(this).addClass("selected");
        state.showId = $(this).data("id");
        state.showTime = $(this).data("time");
        state.showPrice = parseFloat($(this).data("price"));
        $("#nextToSeats").prop("disabled", false);
      });
    });
  }
  $("#backToDate").on("click", () => showStep(3));
  $("#nextToSeats").on("click", () => {
    if (!state.showId) return;
    state.selectedSeats = [];
    showStep(5);
    loadSeatMap();
    updateSummary();
  });
  function loadSeatMap() {
    $("#seatMap").html(loading("Loading seat map…"));
    apiPost("./api/list_seats.php", { show_id: state.showId }).done(
      function (res) {
        if (!res || !res.status) {
          $("#seatMap").html(
            `<p style="color:var(--mb-muted);">Failed to load seats.</p>`,
          );
          return;
        }
        const seats = res.data;
        if (!seats.length) {
          $("#seatMap").html(
            `<p style="color:var(--mb-muted);">No seats configured for this show.</p>`,
          );
          return;
        }
        const rows = {};
        seats.forEach(function (s) {
          if (!rows[s.seat_row]) rows[s.seat_row] = [];
          rows[s.seat_row].push(s);
        });
        let html = `<div class="seat-map">`;
        Object.keys(rows)
          .sort()
          .forEach(function (rowLabel) {
            const rowSeats = rows[rowLabel].sort((a, b) => {
              const aNum = parseInt(a.seat_number.replace(/\D/g, ""));
              const bNum = parseInt(b.seat_number.replace(/\D/g, ""));
              return aNum - bNum;
            });
            html += `<div class="seat-row"><div class="seat-row-label">${rowLabel}</div>`;
            rowSeats.forEach(function (s) {
              const cls = s.is_booked ? "booked" : "available";
              const disabled = s.is_booked ? "disabled" : "";
              html += `<button class="seat-btn ${cls}" 
                     data-id="${s.id}" data-num="${escHtml(s.seat_number)}"
                     title="${escHtml(s.seat_number)}"
                     ${disabled}>
                     ${escHtml(s.seat_number.replace(rowLabel, ""))}
                   </button>`;
            });
            html += `</div>`;
          });
        html += `</div>`;
        $("#seatMap").html(html);
        $(document).on(
          "click",
          ".seat-btn.available, .seat-btn.selected-seat",
          function () {
            const $btn = $(this);
            const seatId = parseInt($btn.data("id"));
            const seatNum = $btn.data("num");
            if ($btn.hasClass("selected-seat")) {
              $btn.removeClass("selected-seat").addClass("available");
              state.selectedSeats = state.selectedSeats.filter(
                (s) => s.id !== seatId,
              );
            } else {
              $btn.removeClass("available").addClass("selected-seat");
              state.selectedSeats.push({ id: seatId, number: seatNum });
            }
            $("#proceedToConfirm").prop(
              "disabled",
              state.selectedSeats.length === 0,
            );
            updateSummary();
          },
        );
      },
    );
  }
  $("#backToShow").on("click", () => {
    $(document).off("click", ".seat-btn.available, .seat-btn.selected-seat");
    showStep(4);
  });
  $("#proceedToConfirm").on("click", () => {
    if (!state.selectedSeats.length) return;
    Swal.fire({
      title: "Confirm Booking?",
      html: `<b>${state.selectedSeats.length} seat(s)</b> for <b>${escHtml(state.movieTitle)}</b><br>
             Total: <b>₹${(state.showPrice * state.selectedSeats.length).toLocaleString("en-IN")}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e94560",
      cancelButtonText: "Review",
      confirmButtonText: "Yes, Book!",
    }).then((result) => {
      if (!result.isConfirmed) return;
      const seatIds = state.selectedSeats.map((s) => s.id);
      apiPost("./api/create_booking.php", {
        show_id: state.showId,
        seat_ids: JSON.stringify(seatIds),
      })
        .done(function (res) {
          if (!res || !res.status) {
            swalErr("Booking Failed", res?.message || "Please try again.");
            return;
          }
          const ref = res.data.reference_number;
          const total = res.data.total_amount;
          $("#refNumber").text(ref);
          $("#cfmMovie").text(state.movieTitle || "");
          $("#cfmTheatre").text(state.theatreName || "");
          $("#cfmDate").text(formatDate(state.showDate));
          $("#cfmTime").text(formatTime(state.showTime));
          $("#cfmSeats").text(
            state.selectedSeats.map((s) => s.number).join(", "),
          );
          $("#cfmTotal").text("₹" + parseFloat(total).toLocaleString("en-IN"));
          showStep(6);
        })
        .fail(function () {
          swalErr("Server Error", "Could not reach server. Please try again.");
        });
    });
  });
  showStep(1);
});
