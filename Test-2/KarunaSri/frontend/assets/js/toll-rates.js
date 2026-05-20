$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Toll Rate Management"),
  );

  function loadRates() {
    App.apiRequest("toll-rates", "GET").then((response) => {
      if (response.success) {
        const tbody = $("#ratesTable tbody");
        tbody.empty();
        response.data.forEach((rate) => {
          tbody.append(`
                                    <tr class="animate-fade-in">
                                        <td><span class="fw-bold">${rate.entry_name}</span></td>
                                        <td><span class="fw-bold">${rate.destination_name}</span></td>
                                        <td><span class="text-primary fw-bold">₹${parseFloat(rate.amount).toFixed(2)}</span></td>
                                        <td>${new Date(rate.created_at).toLocaleDateString()}</td>
                                        <td>
                                            
                                        
                                                                                <button
                                      class="btn btn-sm btn-light text-primary me-2 edit-rate-btn"

                                      data-id="${rate.id}"
                                      data-entry="${rate.entry_exit_id}"
                                      data-destination="${rate.destination_exit_id}"
                                      data-amount="${rate.amount}"
                                  >
                                      <i class="bi bi-pencil"></i>
                                  </button>


                                                                                <button
                              class="btn btn-sm btn-light text-danger delete-rate-btn"

                              data-id="${rate.id}"
                          >
                              <i class="bi bi-trash"></i>
                          </button>
                                        </td>
                                    </tr>
                                `);
        });
      }
    });
  }

  // Load Exits for selects
  App.apiRequest("exits", "GET").then((res) => {
    if (res.success) {
      res.data.forEach((exit) => {
        const option = `<option value="${exit.id}">
                    ${exit.exit_name}
                </option>`;

        $("#entrySelect, #destSelect").append(option);

        $("#editEntrySelect, #editDestSelect").append(option);
      });
    }
  });

  $("#addRateForm").submit(function (e) {
    e.preventDefault();
    const data = {
      entry_exit_id: $(this).find('[name="entry_exit_id"]').val(),
      destination_exit_id: $(this).find('[name="destination_exit_id"]').val(),
      amount: $(this).find('[name="amount"]').val(),
    };

    App.apiRequest("toll-rates", "POST", data).then((response) => {
      if (response.success) {
        App.showToast("success", "Toll rate configured");
        $("#addRateModal").modal("hide");
        this.reset();
        loadRates();
      } else {
        App.showToast("error", response.message);
      }
    });
  });

  loadRates();

  $(document).on("click", ".edit-rate-btn", function () {
    $("#editRateForm [name='id']").val($(this).data("id"));

    $("#editEntrySelect").val($(this).data("entry"));

    $("#editDestSelect").val($(this).data("destination"));

    $("#editRateForm [name='amount']").val($(this).data("amount"));

    $("#editRateModal").modal("show");
  });

  $("#editRateForm").submit(function (e) {
    e.preventDefault();

    const rateId = $(this).find("[name='id']").val();

    const data = {
      entry_exit_id: $(this).find("[name='entry_exit_id']").val(),

      destination_exit_id: $(this).find("[name='destination_exit_id']").val(),

      amount: $(this).find("[name='amount']").val(),
    };

    App.apiRequest(`toll-rates/${rateId}`, "PUT", data).then((response) => {
      if (response.success) {
        App.showToast("success", "Toll rate updated successfully");

        $("#editRateModal").modal("hide");

        loadRates();
      } else {
        App.showToast("error", response.message);
      }
    });
  });

  $(document).on("click", ".delete-rate-btn", function () {
    const rateId = $(this).data("id");

    if (!confirm("Are you sure you want to delete this toll rate?")) {
      return;
    }

    App.apiRequest(`toll-rates/${rateId}`, "DELETE").then((response) => {
      if (response.success) {
        App.showToast("success", "Toll rate deleted successfully");

        loadRates();
      } else {
        App.showToast("error", response.message);
      }
    });
  });
});
