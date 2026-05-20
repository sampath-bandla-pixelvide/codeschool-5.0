$(document).ready(function () {
  $("#sidebar-container").load("../components/sidebar.html");
  $("#navbar-container").load("../components/navbar.html", () =>
    $("#pageTitle").text("Employee Management"),
  );

  function loadEmployees() {
    App.apiRequest("employees", "GET").then((response) => {
      if (response.success) {
        const tbody = $("#employeeTable tbody");
        tbody.empty();
        response.data.forEach((emp) => {
          tbody.append(`
                                    <tr class="animate-fade-in">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-circle-sm me-2">${emp.name.charAt(0)}</div>
                                                <span class="fw-bold">${emp.name}</span>
                                            </div>
                                        </td>
                                        <td>${emp.email}</td>
                                        <td><span class="badge bg-light text-dark text-capitalize">${emp.role}</span></td>
                                        <td>
                                            <span class="status-badge ${emp.is_active ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}">
                                                ${emp.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                         <td>
            <button 
                class="btn btn-sm btn-light text-primary me-2 edit-employee-btn"

                data-id="${emp.id}"
                data-first-name="${emp.first_name}"
                data-last-name="${emp.last_name}"
                data-email="${emp.email}"
                data-role="${emp.role}"
                data-active="${emp.is_active}"
            >
                <i class="bi bi-pencil"></i>
            </button>

            <button 
                class="btn btn-sm btn-light text-danger delete-employee-btn"
                data-id="${emp.id}"
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

  $("#addEmployeeForm").submit(function (e) {
    e.preventDefault();
    const formData = {
      first_name: $(this).find('[name="first_name"]').val(),
      last_name: $(this).find('[name="last_name"]').val(),
      email: $(this).find('[name="email"]').val(),
      password: $(this).find('[name="password"]').val(),
    };

    App.apiRequest("employees", "POST", formData).then((response) => {
      if (response.success) {
        App.showToast("success", "Employee created successfully");
        $("#addEmployeeModal").modal("hide");
        this.reset();
        loadEmployees();
      } else {
        App.showToast("error", response.message);
      }
    });
  });

  loadEmployees();

  $(document).on("click", ".edit-employee-btn", function () {
    $("#editEmployeeForm [name='id']").val($(this).data("id"));

    $("#editEmployeeForm [name='first_name']").val($(this).data("first-name"));

    $("#editEmployeeForm [name='last_name']").val($(this).data("last-name"));

    $("#editEmployeeForm [name='email']").val($(this).data("email"));

    $("#editEmployeeForm [name='role']").val($(this).data("role"));

    $("#editEmployeeForm [name='is_active']").val(
      $(this).data("active").toString(),
    );

    $("#editEmployeeModal").modal("show");
  });

  $("#editEmployeeForm").submit(function (e) {
    e.preventDefault();

    const employeeId = $(this).find("[name='id']").val();

    const formData = {
      first_name: $(this).find("[name='first_name']").val(),
      last_name: $(this).find("[name='last_name']").val(),
      email: $(this).find("[name='email']").val(),
      role: $(this).find("[name='role']").val(),
      is_active: $(this).find("[name='is_active']").val() === "true",
    };

    App.apiRequest(`employees/${employeeId}`, "PUT", formData).then(
      (response) => {
        if (response.success) {
          App.showToast("success", "Employee updated successfully");

          $("#editEmployeeModal").modal("hide");

          loadEmployees();
        } else {
          App.showToast("error", response.message);
        }
      },
    );
  });

  $(document).on("click", ".delete-employee-btn", function () {
    const employeeId = $(this).data("id");

    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    App.apiRequest(`employees/${employeeId}`, "DELETE").then((response) => {
      if (response.success) {
        App.showToast("success", "Employee deleted successfully");

        loadEmployees();
      } else {
        App.showToast("error", response.message);
      }
    });
  });
});
