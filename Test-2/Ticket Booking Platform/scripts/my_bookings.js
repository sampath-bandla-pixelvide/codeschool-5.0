
const token = localStorage.getItem("token");
if (!token) {
  window.location.replace("./index.html");
}
$(document).ready(() => {
  const POSTER_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%231a1a2e'/%3E%3Ctext x='1.5' y='2.2' text-anchor='middle' dominant-baseline='middle' fill='%23e94560' font-size='0.35' font-family='sans-serif'%3ENo+Poster%3C/text%3E%3C/svg%3E";
  function apiPost(url, data) {
    return $.ajax({
      type: "POST", url,
      data: Object.assign({}, data, { token }),
      dataType: "json",
    });
  }
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  function formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return (hr > 12 ? hr - 12 : hr || 12) + ":" + m + " " + (hr >= 12 ? "PM" : "AM");
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
  function loadBookings() {
    apiPost("./api/list_my_bookings.php", {}).done(function (res) {
      if (!res || !res.status) {
        showEmpty("Could not load bookings. Please try again.");
        return;
      }
      const rows = res.data || [];
      if (!rows.length) {
        showEmpty("You haven't booked any tickets yet.");
        return;
      }
      let html = "";
      rows.forEach(function (b) {
        const poster = b.poster_url
          ? escHtml(b.poster_url)
          : POSTER_PLACEHOLDER;
        const statusClass = b.status === "confirmed" ? "status-confirmed" : "status-cancelled";
        const statusLabel = b.status === "confirmed" ? "✓ Confirmed" : "✗ Cancelled";
        html += `
          <div class="booking-card">
            <div class="booking-card-inner">
              <img class="booking-poster" src="${poster}" alt="${escHtml(b.movie_title)}" onerror="this.onerror=null;this.src='${POSTER_PLACEHOLDER}'" />
              <div class="booking-info">
                <div class="booking-title">${escHtml(b.movie_title)}</div>
                <div class="booking-meta">
                  <div class="meta-item"><i class="bi bi-building"></i> ${escHtml(b.theatre_name)}</div>
                  <div class="meta-item"><i class="bi bi-geo-alt"></i> ${escHtml(b.location)}</div>
                  <div class="meta-item"><i class="bi bi-calendar3"></i> ${formatDate(b.show_date)}</div>
                  <div class="meta-item"><i class="bi bi-clock"></i> ${formatTime(b.show_time)}</div>
                </div>
                <div class="booking-ref">${escHtml(b.reference_number)}</div>
                <div class="booking-seats">💺 Seats: <strong>${escHtml(b.seats || "")}</strong></div>
              </div>
            </div>
            <div class="booking-footer">
              <span class="${statusClass}">${statusLabel}</span>
              <span class="booking-amount">₹${parseFloat(b.total_amount).toLocaleString("en-IN")}</span>
            </div>
          </div>`;
      });
      $("#bookingsList").html(html);
    }).fail(function () {
      showEmpty("Server error. Please try again.");
    });
  }
  function showEmpty(msg) {
    $("#bookingsList").html(`
      <div class="empty-state">
        <i class="bi bi-ticket-perforated"></i>
        <p>${msg}</p>
        <a href="./movies.html" style="color:var(--mb-accent);text-decoration:none;font-weight:700;">
          <i class="bi bi-film"></i> Browse Movies
        </a>
      </div>
    `);
  }
  loadBookings();
});
