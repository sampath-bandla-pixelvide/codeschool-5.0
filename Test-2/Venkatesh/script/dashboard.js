$(document).ready(function () {
  let token = localStorage.getItem("token");
  let user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (user) {
    let fullName = `${user.first_name} ${user.last_name}`;
    let role = user.role || "student";

    $("#navUserName").text(user.first_name);
    $("#dropdownUserName").text(fullName);
    $("#dropdownUserEmail").text(user.email);
    $("#userRole").text(role.toUpperCase());

    if (role === "student") {
      $(".admin-menu").hide();
    }
  }

  $("#toggleSidebar").click(function () {
    $("#sidebar").toggleClass("show");
  });

  $.ajax({
    type: "POST",
    url: "api/verify_token.php",
    data: {
      token: token,
    },
    dataType: "json",

    success: function (response) {
      if (!response.status) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        Swal.fire("Session Expired", response.message, "warning");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    },

    error: function () {
      Swal.fire("Error", "Server error", "error");
    },
  });

  $("#logoutBtn").click(function () {
    $.ajax({
      type: "POST",
      url: "api/logout.php",
      data: {
        token: token,
      },
      dataType: "json",

      complete: function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
      },
    });
  });

  // load the quiz subjects
  function loadSubjects() {
    $.ajax({
      type: "GET",
      url: "api/get_subjects.php",
      dataType: "json",

      success: function (response) {
        if (response.status) {
          let html = "";

          $.each(response.data, function (index, subject) {
            html += `
            <div class="col-md-4">
              <div 
                class="card border-0 shadow-sm rounded-4 subject-card h-100"
                data-id="${subject.id}"
              >
                <div class="card-body text-center p-4">

                  <i class="bi ${subject.icon} fs-1 text-primary"></i>

                  <h5 class="fw-bold mt-3">
                    ${subject.subject_name}
                  </h5>

                  <p class="text-muted mb-0">
                    Start ${subject.subject_name} Quiz
                  </p>

                </div>
              </div>
            </div>
          `;
          });

          $("#subjectCards").html(html);
        }
      },
    });
  }

  function loadDashboardStats() {
    $.ajax({
      type: "GET",
      url: "api/get_dashboard_stats.php",
      dataType: "json",

      success: function (response) {
        if (response.status) {
          $("#attemptCount").text(response.data.attempts);
          $("#bestScore").text(response.data.best_score);
          $("#studentCount").text(response.data.students);
        }
      },
    });
  }

  loadDashboardStats();
  $(document).on("click", ".subject-card", function () {
    let subjectId = $(this).data("id");

    window.location.href = "quiz.html?subject_id=" + subjectId;
  });

  loadSubjects();
});
