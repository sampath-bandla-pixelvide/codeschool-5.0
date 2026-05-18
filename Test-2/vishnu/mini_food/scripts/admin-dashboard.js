let dashUsersAll = [];
let dashUsersPage = 1;
const dashUsersPerPage = 6;

function renderDashUsers(page) {
  dashUsersPage = page;
  const start = (page - 1) * dashUsersPerPage;
  const slice = dashUsersAll.slice(start, start + dashUsersPerPage);
  const total = dashUsersAll.length;
  const pages = Math.ceil(total / dashUsersPerPage);

  $("#users-page-info").text(
    `Showing ${start + 1}–${Math.min(start + dashUsersPerPage, total)} of ${total}`,
  );

  if (!slice.length) {
    $("#dash-users-grid").html(
      '<div class="col-12 text-center text-muted py-3">No users yet.</div>',
    );
    $("#users-pagination").html("");
    return;
  }

  let html = "";
  $.each(slice, function (_, u) {
    html += `<div class="col-sm-6 col-md-4"><div class="card user-card p-3 d-flex flex-row align-items-center gap-3">`;
    html += `<div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>`;
    html += `<div><div class="fw-600" style="font-size:14px">${u.name}</div>`;
    html += `<div class="text-muted" style="font-size:12px">${u.email}</div>`;
    html += `<div class="text-muted" style="font-size:12px">${u.mobile || "—"}</div></div></div></div>`;
  });
  $("#dash-users-grid").html(html);

  let pagi = `<li class="page-item${page === 1 ? " disabled" : ""}"><a class="page-link dash-user-page" href="#" data-page="${page - 1}">&laquo;</a></li>`;
  for (let p = 1; p <= pages; p++) {
    pagi += `<li class="page-item${p === page ? " active" : ""}"><a class="page-link dash-user-page" href="#" data-page="${p}">${p}</a></li>`;
  }
  pagi += `<li class="page-item${page === pages ? " disabled" : ""}"><a class="page-link dash-user-page" href="#" data-page="${page + 1}">&raquo;</a></li>`;
  $("#users-pagination").html(pagi);
}

function loadDashboard() {
  $("#dash-users-grid").html(skeletonDashUserCards(6));
  $("#dash-orders-body").html(skeletonTableRows(5, 5));

  $.ajax({
    url: "api/admin/stats.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      $("#stat-users").text(d.data.users);
      $("#stat-cats").text(d.data.categories);
      $("#stat-items").text(d.data.food_items);
      $("#stat-orders").text(d.data.orders);
    },
    error: function () {
      ["stat-users", "stat-cats", "stat-items", "stat-orders"].forEach((id) =>
        $(`#${id}`).text("—"),
      );
    },
  });

  $.ajax({
    url: "api/admin/users.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      dashUsersAll = d.data || [];
      renderDashUsers(1);
    },
    error: function () {
      $("#dash-users-grid").html(
        '<div class="col-12 text-center text-danger py-3">Failed to load users.</div>',
      );
    },
  });

  $.ajax({
    url: "api/admin/orders.php?limit=5",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#dash-orders-body").html(
          '<tr><td colspan="5" class="text-center text-muted py-3">No orders yet.</td></tr>',
        );
        return;
      }
      let rows = "";
      $.each(d.data, function (_, o) {
        rows += `<tr><td>#${o.id}</td><td>${o.user_name}</td>`;
        rows += `<td>₹${parseFloat(o.total_amount).toFixed(2)}</td>`;
        rows += `<td>${statusBadge(o.status)}</td>`;
        rows += `<td>${new Date(o.created_at).toLocaleDateString()}</td></tr>`;
      });
      $("#dash-orders-body").html(rows);
    },
    error: function () {
      $("#dash-orders-body").html(
        '<tr><td colspan="5" class="text-center text-danger py-3">Failed to load recent orders.</td></tr>',
      );
    },
  });
}

$(function () {
  $(document).on("click", ".dash-user-page", function (e) {
    e.preventDefault();
    const p = parseInt($(this).data("page"));
    if (p < 1 || p > Math.ceil(dashUsersAll.length / dashUsersPerPage)) return;
    renderDashUsers(p);
  });
});
