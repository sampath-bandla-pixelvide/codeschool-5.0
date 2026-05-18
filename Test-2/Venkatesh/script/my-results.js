$(document).ready(function () {
  let user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  loadMyResults();

  function loadMyResults() {
    $.ajax({
      type: "GET",
      url: "api/get_my_results.php",
      data: {
        user_id: user.id,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          let html = "";

          if (response.data.length === 0) {
            html = `
              <tr>
                <td colspan="7" class="text-center text-muted">
                  No results found
                </td>
              </tr>
            `;
          } else {
            $.each(response.data, function (index, result) {
              html += `
                <tr>
                  <td>${index + 1}</td>
                  <td>${result.subject_name}</td>
                  <td>${result.score}</td>
                  <td>${result.total_questions}</td>
                  <td>${result.time_taken_seconds} sec</td>
                  <td>${result.created_at}</td>
                  <td>
                    <a 
                      href="result.html?attempt_id=${result.attempt_id}" 
                      class="btn btn-sm btn-primary"
                    >
                      View
                    </a>
                  </td>
                </tr>
              `;
            });
          }

          $("#resultsTable").html(html);
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },

      error: function () {
        Swal.fire("Error", "Failed to load results", "error");
      },
    });
  }
});
