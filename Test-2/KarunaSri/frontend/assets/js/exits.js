$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Exit Management"),
  );

  function loadExits() {
    App.apiRequest("exits", "GET").then((response) => {
      if (response.success) {
        const container = $("#exitList");
        container.empty();
        response.data.forEach((exit) => {
          container.append(`
                                    <div class="col-md-4 col-lg-3 animate-fade-in">
                                        <div class="card h-100 p-4 border-top border-primary border-4">
                                            <div class="d-flex justify-content-between mb-3">
                                                <div class="bg-primary bg-opacity-10 p-2 rounded">
                                                    <i class="bi bi-geo-alt-fill text-primary fs-4"></i>
                                                </div>
                                                <div class="dropdown">
                                                    <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                                        <i class="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                                        <li>
                                                            <button
                                                                class="dropdown-item edit-exit-btn"

                                                                data-id="${exit.id}"
                                                                data-name="${exit.exit_name}"
                                                                data-location="${exit.location}"
                                                            >
                                                                <i class="bi bi-pencil me-2"></i>

                                                                Edit
                                                            </button>
                                                        </li>

                                                        <li>
                                                            <button
                                                                class="dropdown-item text-danger delete-exit-btn"

                                                                data-id="${exit.id}"
                                                            >
                                                                <i class="bi bi-trash me-2"></i>

                                                                Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <h5 class="fw-bold mb-1">${exit.exit_name}</h5>
                                            <p class="text-muted small mb-0"><i class="bi bi-map me-1"></i> ${exit.location}</p>
                                        </div>
                                    </div>
                                `);
        });
      }
    });
  }

  $("#addExitForm").submit(function (e) {
    e.preventDefault();
    const data = {
      exit_name: $(this).find('[name="exit_name"]').val(),
      location: $(this).find('[name="location"]').val(),
    };

    App.apiRequest("exits", "POST", data).then((response) => {
      if (response.success) {
        App.showToast("success", "Plaza added successfully");
        $("#addExitModal").modal("hide");
        this.reset();
        loadExits();
      } else {
        App.showToast("error", response.message);
      }
    });
  });

  $("#editExitForm").submit(function (e) {
    e.preventDefault();

    const exitId = $(this).find("[name='id']").val();

    const data = {
      exit_name: $(this).find("[name='exit_name']").val(),

      location: $(this).find("[name='location']").val(),
    };

    App.apiRequest(`exits/${exitId}`, "PUT", data).then((response) => {
      if (response.success) {
        App.showToast("success", "Exit updated successfully");

        $("#editExitModal").modal("hide");

        loadExits();
      } else {
        App.showToast("error", response.message);
      }
    });
  });

  loadExits();

  $(document).on("click", ".edit-exit-btn", function () {
    $("#editExitForm [name='id']").val($(this).data("id"));

    $("#editExitForm [name='exit_name']").val($(this).data("name"));

    $("#editExitForm [name='location']").val($(this).data("location"));

    $("#editExitModal").modal("show");
  });
  $(document).on("click", ".delete-exit-btn", function () {
    const exitId = $(this).data("id");

    if (!confirm("Are you sure you want to delete this exit?")) {
      return;
    }

    App.apiRequest(`exits/${exitId}`, "DELETE").then((response) => {
      if (response.success) {
        App.showToast("success", "Exit deleted successfully");

        loadExits();
      } else {
        App.showToast("error", response.message);
      }
    });
  });
});
