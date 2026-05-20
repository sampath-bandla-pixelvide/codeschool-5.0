$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Vehicle Exit & Payment"),
  );

  // Load Exits
  App.apiRequest("exits", "GET").then((res) => {
    if (res.success)
      res.data.forEach((e) =>
        $("#exitPlazaSelect").append(
          `<option value="${e.id}">${e.exit_name}</option>`,
        ),
      );
  });

  // Search Token
  $("#searchBtn").click(function () {
    const token = $("#tokenSearch").val();
    if (!token) return App.showToast("warning", "Please enter a token");

    App.apiRequest(`trips/${token}`, "GET").then((res) => {
      if (res.success && res.data.status === "active") {
        $("#detVehicle").text(res.data.vehicle_number);
        $("#detEntry").text(res.data.entry_exit_id);
        $("#detTime").text(new Date(res.data.entry_time).toLocaleString());
        $("#hiddenToken").val(token);

        $("#searchPlaceholder").addClass("d-none");
        $("#tripDetails").removeClass("d-none");
        $("#paymentCard").css({ opacity: "1", "pointer-events": "auto" });
      } else {
        App.showToast("error", "No active trip found for this token");
      }
    });
  });

  // Exit Submission
  $("#exitForm").submit(function (e) {
    e.preventDefault();
    const btn = $("#completeBtn");
    btn.prop("disabled", true).text("Processing Payment...");

    const data = {
      token_number: $("#hiddenToken").val(),
      exit_exit_id: $("#exitPlazaSelect").val(),
      payment_method: $('input[name="payment_method"]:checked').val(),
    };

    App.apiRequest("trips/exit", "POST", data).then((res) => {
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Payment Successful",
          html: `Amount Paid: <b>₹${res.data.amount}</b><br>Token: ${res.data.token_number}`,
          confirmButtonText: "Print Receipt",
        }).then(() => location.reload());
      } else {
        App.showToast("error", res.message);
        btn.prop("disabled", false).text("Complete Payment & Close Trip");
      }
    });
  });
});
