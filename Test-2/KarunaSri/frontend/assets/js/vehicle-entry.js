$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Vehicle Entry"),
  );

  // Load Exits
  App.apiRequest("exits", "GET").then((response) => {
    if (response.success) {
      response.data.forEach((exit) => {
        $("#exitSelect").append(
          `<option value="${exit.id}">${exit.exit_name} (${exit.location})</option>`,
        );
      });
    }
  });

  $("#entryForm").submit(function (e) {
    e.preventDefault();
    const btn = $("#submitBtn");
    btn
      .prop("disabled", true)
      .html(
        '<span class="spinner-border spinner-border-sm"></span> Processing...',
      );

    const data = {
      vehicle_number: $('input[name="vehicle_number"]').val(),
      entry_exit_id: $("#exitSelect").val(),
    };

    App.apiRequest("trips/entry", "POST", data)
      .then((response) => {
        if (response.success) {
          $("#generatedToken").text(response.data.token_number);
          $("#displayVehicle").text(response.data.vehicle_number);
          $("#displayTime").text(
            new Date(response.data.entry_time).toLocaleTimeString(),
          );
          $("#tokenModal").modal("show");
          this.reset();
        } else {
          App.showToast("error", response.message);
        }
      })
      .always(() =>
        btn
          .prop("disabled", false)
          .html('Generate Token <i class="bi bi-qr-code ms-2"></i>'),
      );
  });
});
