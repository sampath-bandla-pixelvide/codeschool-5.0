$(document).ready(function () {
  loadAllResults();

  function loadAllResults() {
    $.ajax({
      type: "GET",
      url: "api/get_all_results.php",
      dataType: "json",

      success: function (response) {
        if (response.status) {
          let html = "";

          if (response.data.length === 0) {
            html = `
              <tr>
                <td colspan="9" class="text-center text-muted">
                  No results found
                </td>
              </tr>
            `;
          } else {
            $.each(response.data, function (index, result) {
              let studentName = result.first_name + " " + result.last_name;

              html += `
                <tr>
                  <td>${index + 1}</td>
                  <td>${studentName}</td>
                  <td>${result.email}</td>
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

          $("#allResultsTable").html(html);
        }
      },

      error: function () {
        Swal.fire("Error", "Failed to load results", "error");
      }
    });
  }
});