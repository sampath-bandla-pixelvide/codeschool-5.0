$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Reports & Analytics"),
  );

  // Set default date to today
  document.getElementById("reportDate").valueAsDate = new Date();

  let revenueChart;

  function initChart(labels, data) {
    const ctx = document.getElementById("revenueChart").getContext("2d");
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Collection (₹)",
            data: data,
            backgroundColor: "#4e73df",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  function loadReports() {
    const date = $("#reportDate").val();

    // Load Daily Stats
    App.apiRequest(`reports/daily&date=${date}`, "GET").then((response) => {
      if (response.success) {
        const stats = response.data;
        $("#statTrips").text(stats.total_trips || 0);
        $("#statRevenue").text(
          "₹" + (parseFloat(stats.total_revenue) || 0).toFixed(2),
        );
        const avg =
          stats.total_trips > 0 ? stats.total_revenue / stats.total_trips : 0;
        $("#statAvg").text("₹" + avg.toFixed(2));

        // Mock chart data since we only have one day
        initChart(
          ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
          [2000, 4500, 3200, 5100, 6800, 3900],
        );
      }
    });

    // Load Employee Collections
    App.apiRequest("reports/employee-collections", "GET").then((response) => {
      if (response.success) {
        const list = $("#collectionList");
        list.empty();
        response.data.forEach((item) => {
          list.append(`
                                    <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3 animate-fade-in">
                                        <div>
                                            <div class="fw-bold">${item.employee_name}</div>
                                            <div class="small text-muted">${item.trips_closed} trips processed</div>
                                        </div>
                                        <div class="text-primary fw-bold">₹${parseFloat(item.total_collected).toFixed(2)}</div>
                                    </div>
                                `);
        });
      }
    });
  }

  $("#refreshBtn").click(loadReports);
  loadReports();
});
