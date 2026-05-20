$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Active Journey Monitor"),
  );

  function calculateDuration(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  }

  function loadActiveTrips() {
    App.apiRequest("trips/active", "GET").then((response) => {
      if (response.success) {
        const tbody = $("#activeTripsTable tbody");
        tbody.empty();
        response.data.forEach((trip) => {
          tbody.append(`
                                    <tr class="animate-fade-in">
                                        <td class="fw-bold text-primary">${trip.token_number}</td>
                                        <td class="text-uppercase fw-bold">${trip.vehicle_number}</td>
                                        <td>${trip.entry_point}</td>
                                        <td>${new Date(trip.entry_time).toLocaleString()}</td>
                                        <td><i class="bi bi-clock me-1"></i> ${calculateDuration(trip.entry_time)}</td>
                                        <td><span class="status-badge bg-primary bg-opacity-10 text-primary">In Transit</span></td>
                                        <td>
                                            <a href="vehicle-exit.html?token=${trip.token_number}" class="btn btn-sm btn-outline-primary">Process Exit</a>
                                        </td>
                                    </tr>
                                `);
        });
      }
    });
  }

  // Simple search filter
  $("#tripSearch").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    $("#activeTripsTable tbody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  loadActiveTrips();
  // Refresh every minute
  setInterval(loadActiveTrips, 60000);
});
