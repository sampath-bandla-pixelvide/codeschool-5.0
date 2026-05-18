function loadUsers() {
  $("#users-grid").html(skeletonUserCards(8));
  $.ajax({
    url: "api/admin/users.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#users-grid").html(
          '<div class="col-12 text-center text-muted py-4">No users found.</div>',
        );
        return;
      }
      let html = "";
      $.each(d.data, function (_, u) {
        html += `<div class="col-sm-6 col-md-4 col-xl-3"><div class="card user-card p-3">`;
        html += `<div class="d-flex align-items-center gap-3 mb-2">`;
        html += `<div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>`;
        html += `<div><div class="fw-600" style="font-size:14px">${u.name}</div>`;
        html += `<span class="badge ${u.role === "admin" ? "bg-warning text-dark" : "bg-primary"}">${u.role}</span></div></div>`;
        html += `<div class="text-muted" style="font-size:12px"><i class="fa-solid fa-envelope me-1"></i>${u.email}</div>`;
        html += `<div class="text-muted" style="font-size:12px"><i class="fa-solid fa-phone me-1"></i>${u.mobile || "—"}</div>`;
        html += `</div></div>`;
      });
      $("#users-grid").html(html);
    },
    error: function (xhr) {
      const msg =
        xhr.status === 401
          ? "Session expired — please log in again."
          : "Failed to load users. Try refreshing.";
      $("#users-grid").html(
        `<div class="col-12 text-center text-danger py-4">${msg}</div>`,
      );
    },
  });
}
