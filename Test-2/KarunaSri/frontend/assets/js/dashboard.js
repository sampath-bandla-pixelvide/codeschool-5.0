$(document).ready(function () {
  // Load components
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () => {
    $("#pageTitle").text("Operations Dashboard");
  });

  // Initialize Charts
  const revCtx = document.getElementById("revenueChart").getContext("2d");
  new Chart(revCtx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Revenue (₹)",
          data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
          borderColor: "#4e73df",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(78, 115, 223, 0.1)",
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });

  const trafficCtx = document.getElementById("trafficChart").getContext("2d");
  new Chart(trafficCtx, {
    type: "doughnut",
    data: {
      labels: ["Heavy Vehicle", "Cars", "Bikes"],
      datasets: [
        {
          data: [30, 55, 15],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });

  // Fetch Data
  function loadDashboardData() {
    App.apiRequest("trips/active", "GET").then((response) => {
      if (response.success) {
        $("#activeTripsCount").text(response.data.length);
        const tbody = $("#recentTripsTable tbody");
        tbody.empty();
        response.data.slice(0, 5).forEach((trip) => {
          tbody.append(`
                                    <tr class="animate-fade-in">
                                        <td class="fw-bold text-primary">${trip.token_number}</td>
                                        <td>${trip.vehicle_number}</td>
                                        <td>${trip.entry_point}</td>
                                        <td>${new Date(trip.entry_time).toLocaleString()}</td>
                                        <td><span class="status-badge bg-success bg-opacity-10 text-success">Active</span></td>
                                    </tr>
                                `);
        });
      }
    });

    App.apiRequest("reports/daily", "GET").then((response) => {
      if (response.success) {
        $("#totalRevenue").text("₹" + (response.data.total_revenue || 0));
        $("#dailyJourneys").text(response.data.total_trips || 0);
      }
    });

    App.apiRequest("employees", "GET").then((response) => {
      if (response.success) {
        $("#employeeCount").text(response.data.length);
      }
    });
  }

  loadDashboardData();
});
